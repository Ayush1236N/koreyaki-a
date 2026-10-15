"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, Check, MessageCircle, ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/lib/store";
import { priceCart } from "@/lib/pricing";
import { useHydrated } from "@/lib/use-in-view";
import type { CheckoutRequest, CheckoutResponse } from "@/lib/types";
import { cn, formatPrice, RESTAURANT_INFO, whatsappLink } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-sm text-white placeholder:text-ink-400 focus:border-accent focus:outline-none";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const hydrated = useHydrated();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResponse | null>(null);

  const cart = useMemo(() => priceCart(items), [items]);

  const buildMessage = (r: CheckoutResponse) =>
    [
      `Hi Koreyaki! New order ${r.reference}`,
      "",
      ...r.lines.map((l) => `${l.quantity} × ${l.name}${l.options ? ` (${l.options})` : ""} — ${formatPrice(l.lineTotal)}`),
      "",
      `Items total: ${formatPrice(r.subtotal)}`,
      `Type: ${orderType === "pickup" ? "Pickup" : "Delivery"}`,
      orderType === "delivery" && address ? `Address: ${address}` : null,
      `Name: ${name}`,
      `Phone: ${phone}`,
      notes ? `Notes: ${notes}` : null,
      "",
      "Please confirm availability, taxes/delivery and the final total.",
    ]
      .filter((x) => x !== null)
      .join("\n");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    if (!cart.lines.length || cart.blocking) {
      setError("Please remove unavailable items before sending your order.");
      return;
    }
    setSubmitting(true);
    const payload: CheckoutRequest = {
      customerName: name.trim(),
      customerPhone: phone.trim(),
      orderType,
      deliveryAddress: orderType === "delivery" ? address.trim() : undefined,
      notes: notes.trim() || undefined,
      items: items.map((i) => ({
        menuItemSlug: i.menuItemSlug,
        quantity: i.quantity,
        selections: i.selectedOptions.map((s) => ({ groupSlug: s.groupSlug, optionName: s.optionName })),
        specialInstructions: i.specialInstructions,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "We couldn't send your order. Please try again.");
        if (data.field) setFieldError(data.field);
        return;
      }
      setResult(data as CheckoutResponse);
      clearCart();
    } catch {
      setError("Network problem. Your order hasn't been sent. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const link = whatsappLink(buildMessage(result));
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-ink-800 bg-ink-900 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp">
            <Check className="h-7 w-7" strokeWidth={3} />
          </div>
          <h1 className="mt-5 font-serif text-3xl text-white">Order saved</h1>
          <p className="mt-2 text-sm text-ink-300">
            Reference <span className="font-mono font-semibold text-white">{result.reference}</span>. Send it to Koreyaki on
            WhatsApp to finish. The order is confirmed only when the restaurant replies.
          </p>

          <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-950 p-5 text-left text-sm">
            {result.lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-4 py-1.5">
                <span className="text-ink-200">
                  {l.quantity} × {l.name}
                  {l.options && <span className="block text-xs text-ink-400">{l.options}</span>}
                </span>
                <span className="tabular-nums text-white">{formatPrice(l.lineTotal)}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-ink-800 pt-3 font-serif text-lg text-white">
              <span>Items total</span>
              <span className="tabular-nums">{formatPrice(result.total)}</span>
            </div>
            <p className="mt-2 text-xs text-ink-400">Taxes and delivery are confirmed by the restaurant.</p>
          </div>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "whatsapp", size: "xl" }), "mt-6 w-full")}
          >
            <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
          </a>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/menu" className="text-ink-300 hover:text-white">
              Order something else
            </Link>
            <a href={`tel:${RESTAURANT_INFO.phoneTel}`} className="text-ink-400 hover:text-white">
              Or call {RESTAURANT_INFO.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ink-800">
          <ShoppingBag className="h-7 w-7 text-ink-400" />
        </div>
        <h1 className="font-serif text-3xl text-white">Your order is empty</h1>
        <p className="mt-3 text-ink-400">Add dishes from the menu to start your order.</p>
        <Link href="/menu" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <Link href="/menu" className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>
      <h1 className="mt-4 font-serif text-4xl text-white sm:text-5xl">Review &amp; send</h1>
      <p className="mt-2 max-w-2xl text-ink-400">
        Check your items, add your details and send the order to Koreyaki on WhatsApp. Taxes and delivery are confirmed by the
        restaurant.
      </p>

      <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]" noValidate>
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink-800 bg-ink-900 p-6">
            <h2 className="font-semibold text-white">How will you get it?</h2>
            <div role="radiogroup" aria-label="Order type" className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["pickup", "delivery"] as const).map((t) => (
                <label
                  key={t}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                    orderType === t ? "border-accent bg-accent/10" : "border-ink-700 hover:border-ink-500"
                  )}
                >
                  <input type="radio" name="orderType" value={t} checked={orderType === t} onChange={() => setOrderType(t)} className="sr-only" />
                  <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", orderType === t ? "border-accent bg-accent" : "border-ink-600")} aria-hidden>
                    {orderType === t && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span>
                    <span className="block font-medium text-white">{t === "pickup" ? "Pickup" : "Delivery request"}</span>
                    <span className="block text-xs text-ink-400">
                      {t === "pickup" ? `Visit ${RESTAURANT_INFO.area}` : "The restaurant confirms if it can deliver to you"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-ink-800 bg-ink-900 p-6">
            <h2 className="font-semibold text-white">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-300">Name *</span>
                <input
                  className={cn(field, fieldError === "customerName" && "border-accent")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-300">Phone *</span>
                <input
                  className={cn(field, fieldError === "customerPhone" && "border-accent")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="10-digit mobile number"
                />
              </label>
              {orderType === "delivery" && (
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-ink-300">Delivery address *</span>
                  <textarea
                    className={cn(field, "resize-none", fieldError === "deliveryAddress" && "border-accent")}
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat / house, street, area, landmark"
                  />
                </label>
              )}
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-ink-300">Notes (optional)</span>
                <textarea
                  className={cn(field, "resize-none")}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Allergies, timing, or other requests"
                />
              </label>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              For allergies, please also confirm with the restaurant. Cross-contact may occur in a shared kitchen.
            </p>
          </section>

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent-soft">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <aside aria-label="Order summary" className="h-fit rounded-2xl border border-ink-800 bg-ink-900 p-6 lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Order summary</h2>
            {hydrated && <Badge variant="outline">{items.reduce((n, i) => n + i.quantity, 0)} items</Badge>}
          </div>

          <ul className="mt-4 divide-y divide-ink-800">
            {cart.lines.map(({ cartItem: item, menu, unitPrice, lineTotal, available }) => (
              <li key={item.id} className="py-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-white">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="tabular-nums text-white">{formatPrice(lineTotal)}</span>
                </div>
                {item.selectedOptions.length > 0 && (
                  <p className="mt-0.5 text-xs text-ink-400">{item.selectedOptions.map((o) => o.optionName).join(" · ")}</p>
                )}
                {!available && (
                  <p className="mt-1 text-xs text-accent-soft">
                    {menu ? "Unavailable. Remove it from your order." : "No longer on the menu. Remove it from your order."}
                  </p>
                )}
                {available && unitPrice !== item.unitPrice && <p className="mt-1 text-xs text-gold">Price updated</p>}
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-ink-800 pt-4 text-sm">
            <div className="flex justify-between text-ink-300">
              <span>Items total</span>
              <span className="tabular-nums text-white">{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-ink-400">
              <span>Taxes &amp; delivery</span>
              <span>Confirmed by restaurant</span>
            </div>
            <div className="flex justify-between border-t border-ink-800 pt-3 font-serif text-xl text-white">
              <span>Estimated total</span>
              <span className="tabular-nums">{formatPrice(cart.subtotal)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" variant="whatsapp" className="mt-6 w-full" disabled={submitting || cart.blocking || !hydrated}>
            {submitting ? "Saving order…" : (
              <>
                <MessageCircle className="h-4 w-4" /> Continue to WhatsApp
              </>
            )}
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-400">
            We save your order, then open WhatsApp with the details. Your order is confirmed only when Koreyaki replies.
          </p>
        </aside>
      </form>
    </div>
  );
}
