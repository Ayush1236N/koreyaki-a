"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, MessageCircle, RotateCcw, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { getCategory, getMenuItem, MENU_ITEMS } from "@/lib/menu-data";
import { getModelConfig } from "@/lib/model-registry";
import {
  defaultSelections,
  groupRequirementText,
  selectionError,
  unitPriceFor,
} from "@/lib/pricing";
import { useCartStore } from "@/lib/store";
import type { CustomizationGroup, SelectedOption } from "@/lib/types";
import { useInView } from "@/lib/use-in-view";
import { cn, formatPrice, RESTAURANT_INFO, whatsappLink } from "@/lib/utils";

const FoodViewer = dynamic(() => import("@/components/three/FoodViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-ink-900" aria-hidden />,
});

export default function DishDetail({ slug }: { slug: string }) {
  const item = getMenuItem(slug);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  const [selections, setSelections] = useState<SelectedOption[]>(() => (item ? defaultSelections(item) : []));
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [exploded, setExploded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const { ref: viewerRef, inView } = useInView<HTMLDivElement>("300px");

  const config = getModelConfig(slug);
  const category = item ? getCategory(item.category) : undefined;
  const related = useMemo(() => MENU_ITEMS.filter((m) => m.slug !== slug && m.category === item?.category).slice(0, 3), [slug, item]);

  if (!item) return null;

  const unitPrice = unitPriceFor(item.basePrice, selections);
  const total = unitPrice * quantity;
  const problem = selectionError(item, selections);
  const canAdd = item.isAvailable && !problem;

  const optionSummary = selections.map((s) => `${s.groupName}: ${s.optionName}`).join(", ");
  const whatsappMessage = [
    `Hi Koreyaki! I'd like to order:`,
    `${quantity} × ${item.name}${optionSummary ? ` (${optionSummary})` : ""} — ${formatPrice(total)}`,
    notes.trim() ? `Note: ${notes.trim()}` : null,
    `Please confirm availability and the final total.`,
  ]
    .filter(Boolean)
    .join("\n");

  const toggleOption = (group: CustomizationGroup, optionName: string) => {
    const cfg = group.options.find((o) => o.name === optionName);
    if (!cfg) return;
    setJustAdded(false);
    setSelections((prev) => {
      const current = prev.filter((s) => s.groupSlug === group.slug);
      const others = prev.filter((s) => s.groupSlug !== group.slug);
      const isOn = current.some((s) => s.optionName === optionName);
      const entry: SelectedOption = {
        groupSlug: group.slug,
        groupName: group.name,
        optionName: cfg.name,
        priceAdjustment: cfg.priceAdjustment,
      };
      if (group.maxSelect === 1) {
        if (isOn) return group.minSelect === 0 ? others : prev;
        return [...others, entry];
      }
      if (isOn) return [...others, ...current.filter((s) => s.optionName !== optionName)];
      if (current.length >= group.maxSelect) return prev;
      return [...prev, entry];
    });
  };

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(item.slug, item.name, item.basePrice, selections, quantity, notes.trim() || undefined);
    setJustAdded(true);
    setCartOpen(true);
  };

  const resetDefaults = () => {
    setSelections(defaultSelections(item));
    setQuantity(1);
    setNotes("");
    setJustAdded(false);
  };

  const toggleHidden = (id: string) =>
    setHiddenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:pt-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400">
        <Link href="/menu" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Menu
        </Link>
        {category && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/menu?category=${category.slug}`} className="hover:text-white">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Photo */}
        <div className="xl:order-1">
          <figure className="overflow-hidden rounded-3xl border border-ink-800 bg-ink-900">
            <div className="relative aspect-[4/5] lg:aspect-[4/3] xl:aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              {item.badge && (
                <div className="absolute left-4 top-4">
                  <Badge variant="accent">{item.badge}</Badge>
                </div>
              )}
            </div>
            {item.imageCredit && (
              <figcaption className="px-4 py-2 text-[11px] text-ink-400">Photo: {item.imageCredit}</figcaption>
            )}
          </figure>
          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Photo is representative of the dish. Veg/non-veg status and allergen details aren&apos;t listed for this dish yet
            — please confirm with the restaurant before ordering if you have an allergy.
          </p>
        </div>

        {/* Details + options */}
        <div className="xl:order-2">
          {category && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">{category.name}</p>}
          <h1 className="mt-2 font-serif text-4xl leading-tight text-white sm:text-5xl">{item.name}</h1>
          <p className="mt-4 text-base leading-relaxed text-ink-300">{item.description}</p>

          <div className="mt-6 flex items-end justify-between border-y border-ink-800 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-ink-400">Base price</p>
              <p className="mt-1 font-serif text-2xl text-ink-100">{formatPrice(item.basePrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.15em] text-ink-400">Your price</p>
              <p className="mt-1 font-serif text-3xl text-accent-soft" aria-live="polite">
                {formatPrice(unitPrice)}
              </p>
              {unitPrice !== item.basePrice && (
                <p className="text-xs text-ink-400">
                  {unitPrice > item.basePrice ? "+" : "−"}
                  {formatPrice(Math.abs(unitPrice - item.basePrice))} from options
                </p>
              )}
            </div>
          </div>

          {item.customization.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">No options for this dish. Choose a quantity and add it to your order.</p>
          ) : (
            <div className="mt-6 space-y-7">
              {item.customization.map((group) => {
                const count = selections.filter((s) => s.groupSlug === group.slug).length;
                const missing = count < group.minSelect;
                return (
                  <fieldset key={group.slug}>
                    <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
                      <span className="font-semibold text-ink-100">{group.name}</span>
                      <span className={cn("text-xs", missing ? "text-accent-soft" : "text-ink-400")}>
                        {missing ? `Required · ${groupRequirementText(group)}` : groupRequirementText(group)}
                      </span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.options.map((opt) => {
                        const on = selections.some((s) => s.groupSlug === group.slug && s.optionName === opt.name);
                        return (
                          <label
                            key={opt.name}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                              on ? "border-accent bg-accent/10 text-white" : "border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-600"
                            )}
                          >
                            <input
                              type={group.maxSelect === 1 ? "radio" : "checkbox"}
                              name={group.slug}
                              checked={on}
                              onChange={() => toggleOption(group, opt.name)}
                              className="sr-only"
                            />
                            <span
                              aria-hidden
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center border",
                                group.maxSelect === 1 ? "rounded-full" : "rounded",
                                on ? "border-accent bg-accent text-white" : "border-ink-600"
                              )}
                            >
                              {on && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            <span className="flex-1">{opt.name}</span>
                            {opt.priceAdjustment !== 0 && (
                              <span className="text-xs text-ink-400">
                                {opt.priceAdjustment > 0 ? "+" : "−"}
                                {formatPrice(Math.abs(opt.priceAdjustment))}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
              <p className="text-xs text-ink-400">
                Add-on prices are shown when confirmed by the restaurant. Options here change how you order, not the 3D model.
              </p>
            </div>
          )}

          <div className="mt-7">
            <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-ink-100">
              Special instructions <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 300))}
              rows={2}
              placeholder="E.g. less sauce, no spring onion"
              className="w-full rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 focus:border-accent focus:outline-none"
            />
          </div>

          {!item.isAvailable && (
            <p role="status" className="mt-5 rounded-xl border border-ink-700 bg-ink-900 p-4 text-sm text-ink-300">
              This dish is currently unavailable. Please check back or ask the restaurant about alternatives.
            </p>
          )}
          {problem && item.isAvailable && (
            <p role="alert" className="mt-5 text-sm text-accent-soft">
              {problem}
            </p>
          )}
          {justAdded && (
            <p role="status" className="mt-5 flex items-center gap-2 text-sm text-whatsapp">
              <Check className="h-4 w-4" /> Added to your order.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Stepper value={quantity} onChange={setQuantity} label="Quantity" />
            <Button onClick={handleAdd} disabled={!canAdd} size="lg" className="flex-1 min-w-[12rem]">
              <ShoppingBag className="h-4 w-4" />
              Add to order · {formatPrice(total)}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }), "flex-1 min-w-[12rem]", !canAdd && "pointer-events-none opacity-40")}
              aria-disabled={!canAdd}
              tabIndex={canAdd ? 0 : -1}
            >
              <MessageCircle className="h-4 w-4" />
              Order this on WhatsApp
            </a>
          </div>
          <button
            type="button"
            onClick={resetDefaults}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
          </button>
          <p className="mt-6 text-xs leading-relaxed text-ink-400">
            Taxes and delivery charges are confirmed by Koreyaki when your order is confirmed. Final availability and price are
            checked by the restaurant.
          </p>
        </div>

        {/* 3D build view */}
        <div className="xl:order-3">
          <div className="sticky top-24">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-300">Build view</p>
              {config && (
                <p className="text-xs text-ink-400">
                  {config.components.length - hiddenIds.length}/{config.components.length} parts shown
                </p>
              )}
            </div>

            <div ref={viewerRef} className="h-[420px] sm:h-[480px] xl:h-[560px]">
              {config ? (
                inView ? (
                  <FoodViewer
                    menuItemSlug={item.slug}
                    poster={item.image}
                    posterAlt={item.name}
                    exploded={exploded}
                    onExplodedChange={setExploded}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    hiddenIds={hiddenIds}
                    className="h-full"
                  />
                ) : (
                  <div className="h-full w-full overflow-hidden rounded-2xl border border-ink-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-full w-full object-cover opacity-70" loading="lazy" />
                  </div>
                )
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-ink-900 p-8 text-center">
                  <p className="font-serif text-xl text-ink-100">3D build view coming soon</p>
                  <p className="mt-2 max-w-xs text-sm text-ink-400">
                    This dish doesn&apos;t have a build view yet. You can still customise and order it.
                  </p>
                </div>
              )}
            </div>

            {config && (
              <div className="mt-4">
                <ul className="divide-y divide-ink-800 rounded-2xl border border-ink-800 bg-ink-900">
                  {config.components.map((c, idx) => {
                    const hidden = hiddenIds.includes(c.id);
                    const active = selectedId === c.id;
                    return (
                      <li key={c.id} className="flex items-center gap-2 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedId(active ? null : c.id)}
                          aria-pressed={active}
                          className={cn(
                            "flex flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                            active ? "bg-accent/15 text-white" : "text-ink-300 hover:text-white",
                            hidden && "line-through opacity-50"
                          )}
                        >
                          <span className="font-mono text-[11px] text-ink-400">{String(idx + 1).padStart(2, "0")}</span>
                          <span className="flex-1">{c.label}</span>
                          {c.optional && <Badge variant="outline">Optional</Badge>}
                        </button>
                        {c.optional && (
                          <button
                            type="button"
                            onClick={() => toggleHidden(c.id)}
                            aria-label={hidden ? `Show ${c.label}` : `Hide ${c.label}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-800 hover:text-white"
                          >
                            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-ink-400">
                  A procedural build view showing how the dish is put together — tap a part to highlight it, drag to rotate, pinch or
                  scroll to zoom. A scanned model drops straight in here when the restaurant commissions one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-20 border-t border-ink-800 pt-12">
          <div className="flex items-end justify-between">
            <h2 id="related" className="font-serif text-2xl text-white">
              More from {category?.name}
            </h2>
            <Link href={`/menu?category=${item.category}`} className="inline-flex items-center gap-1 text-sm text-accent-soft hover:text-white">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/dish/${r.slug}`} className="group flex items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 p-3 hover:border-ink-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg text-white group-hover:text-accent-soft">{r.name}</p>
                  <p className="text-sm text-ink-400">{formatPrice(r.basePrice)}</p>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-xs text-ink-400">
            Questions? Call {RESTAURANT_INFO.phoneDisplay} or visit us in {RESTAURANT_INFO.area}.
          </p>
        </section>
      )}
    </div>
  );
}
