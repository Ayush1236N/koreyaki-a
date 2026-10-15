import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { getMenuItem } from "@/lib/menu-data";
import { normalizeSelections, unitPriceFor, PRICING_RULES } from "@/lib/pricing";
import type { CheckoutRequest, CheckoutResponse, CheckoutLine } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LINES = 20;
const MAX_QTY_PER_LINE = 20;
const MAX_TOTAL_QTY = 60;

type ApiError = { error: string; field?: string };

function fail(status: number, body: ApiError) {
  return NextResponse.json(body, { status });
}

function cleanText(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
  return t || undefined;
}

export async function POST(req: Request) {
  let body: CheckoutRequest;
  try {
    body = (await req.json()) as CheckoutRequest;
  } catch {
    return fail(400, { error: "Request body must be JSON." });
  }

  // ----- customer -----
  const customerName = cleanText(body.customerName, 80);
  if (!customerName || customerName.length < 2) return fail(400, { error: "Please enter your name.", field: "customerName" });

  const phoneDigits = typeof body.customerPhone === "string" ? body.customerPhone.replace(/\D/g, "") : "";
  if (phoneDigits.length < 10 || phoneDigits.length > 13) {
    return fail(400, { error: "Please enter a valid phone number.", field: "customerPhone" });
  }

  if (body.orderType !== "pickup" && body.orderType !== "delivery") {
    return fail(400, { error: "Choose pickup or delivery.", field: "orderType" });
  }
  const deliveryAddress = body.orderType === "delivery" ? cleanText(body.deliveryAddress, 300) : undefined;
  if (body.orderType === "delivery" && !deliveryAddress) {
    return fail(400, { error: "Please enter a delivery address.", field: "deliveryAddress" });
  }
  const notes = cleanText(body.notes, 500);

  // ----- items -----
  if (!Array.isArray(body.items) || body.items.length === 0) return fail(400, { error: "Your order is empty." });
  if (body.items.length > MAX_LINES) return fail(400, { error: "Too many different dishes in one order." });

  let totalQty = 0;
  const lines: { name: string; slug: string; quantity: number; unitPrice: number; lineTotal: number; options: { groupName: string; optionName: string; priceAdjustment: number }[]; optionsText: string; instructions?: string }[] = [];

  for (const line of body.items) {
    const item = getMenuItem(line?.menuItemSlug ?? "");
    if (!item) return fail(400, { error: "An item in your order is no longer on the menu. Please remove it and try again." });
    if (!item.isAvailable) return fail(409, { error: `${item.name} is currently unavailable.` });

    const qty = Number.isInteger(line.quantity) ? line.quantity : NaN;
    if (!(qty >= 1 && qty <= MAX_QTY_PER_LINE)) return fail(400, { error: `Quantity for ${item.name} must be between 1 and ${MAX_QTY_PER_LINE}.` });
    totalQty += qty;
    if (totalQty > MAX_TOTAL_QTY) return fail(400, { error: "Orders are limited to 60 items. Please contact the restaurant for larger orders." });

    const selections = Array.isArray(line.selections) ? line.selections : [];
    const normalized = normalizeSelections(
      item,
      selections
        .filter((s) => s && typeof s.groupSlug === "string" && typeof s.optionName === "string")
        .map((s) => ({ groupSlug: s.groupSlug, optionName: s.optionName }))
    );
    if (!normalized.ok) return fail(400, { error: normalized.error });

    // Price comes from configuration only; any client-sent price was never read.
    const unitPrice = unitPriceFor(item.basePrice, normalized.options);
    lines.push({
      name: item.name,
      slug: item.slug,
      quantity: qty,
      unitPrice,
      lineTotal: unitPrice * qty,
      options: normalized.options.map((o) => ({ groupName: o.groupName, optionName: o.optionName, priceAdjustment: o.priceAdjustment })),
      optionsText: normalized.options.map((o) => `${o.groupName}: ${o.optionName}`).join(", "),
      instructions: cleanText(line.specialInstructions, 300),
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  // Taxes and delivery are not configured (PRICING_RULES). Recorded as 0 until the restaurant confirms its rules.
  const tax = 0;
  const deliveryFee = 0;
  const total = subtotal + tax + deliveryFee;

  try {
    const [inserted] = await db
      .insert(orders)
      .values({
        customerName,
        customerPhone: phoneDigits,
        orderType: body.orderType,
        deliveryAddress: deliveryAddress ?? null,
        subtotal,
        tax,
        deliveryFee,
        discount: 0,
        total,
        status: "pending_restaurant_confirmation",
        notes: notes ?? null,
      })
      .returning({ id: orders.id, orderUuid: orders.orderUuid });

    if (!inserted) return fail(500, { error: "We couldn't save your order. Please try again or call the restaurant." });

    await db.insert(orderItems).values(
      lines.map((l) => ({
        orderId: inserted.id,
        menuItemId: null,
        itemName: l.name,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
        customizations: l.options,
        specialInstructions: l.instructions ?? null,
      }))
    );

    const reference = `KY-${inserted.orderUuid.slice(0, 8).toUpperCase()}`;
    const response: CheckoutResponse = {
      reference,
      orderId: inserted.orderUuid,
      lines: lines.map<CheckoutLine>((l) => ({
        name: l.name,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        options: l.optionsText,
      })),
      subtotal,
      total,
      currency: PRICING_RULES.currency,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[orders] insert failed", err);
    return fail(500, { error: "We couldn't save your order right now. Please try again or call the restaurant." });
  }
}
