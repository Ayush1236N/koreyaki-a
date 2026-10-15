"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import type { MenuItem } from "@/lib/types";
import { getCategory } from "@/lib/menu-data";
import { hasBuildView } from "@/lib/model-registry";
import { canQuickAdd, defaultSelections } from "@/lib/pricing";
import { useCartStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";

export default function MenuCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const [qty, setQty] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  const quick = canQuickAdd(item);
  const has3D = hasBuildView(item.slug);
  const category = getCategory(item.category);
  const href = `/dish/${item.slug}`;

  const handleAdd = () => {
    addItem(item.slug, item.name, item.basePrice, defaultSelections(item), qty);
    setCartOpen(true);
    setQty(1);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 transition-colors hover:border-ink-600">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-ink-800" aria-label={`View ${item.name}`}>
        {!loaded && !broken && <div className="absolute inset-0 animate-pulse bg-ink-800" aria-hidden />}
        {broken ? (
          <div className="flex h-full items-center justify-center p-6 text-center font-serif text-lg text-ink-300">
            {item.name}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04]",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {item.badge && <Badge variant="accent">{item.badge}</Badge>}
        </div>
        {has3D && (
          <div className="absolute right-3 top-3">
            <Badge variant="glass">3D build view</Badge>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/70">
            <Badge variant="outline">Currently unavailable</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl leading-tight text-white">
            <Link href={href} className="hover:text-accent-soft">
              {item.name}
            </Link>
          </h3>
          <p className="shrink-0 font-serif text-lg text-accent-soft">{formatPrice(item.basePrice)}</p>
        </div>
        {category && <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-400">{category.name}</p>}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-400">{item.description}</p>

        <div className="mt-auto flex items-center gap-3 pt-5">
          <Stepper value={qty} onChange={setQty} label={`${item.name} quantity`} />
          {quick ? (
            <Button
              onClick={handleAdd}
              disabled={!item.isAvailable}
              className="h-11 flex-1"
              aria-label={`Add ${qty} ${item.name} to order`}
            >
              Add · {formatPrice(item.basePrice * qty)}
            </Button>
          ) : (
            <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "h-11 flex-1")}>
              Customise
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
