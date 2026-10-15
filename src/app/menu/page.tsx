"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import MenuCard from "@/components/menu/MenuCard";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, getCategory, MENU_ITEMS } from "@/lib/menu-data";
import { cn, RESTAURANT_INFO } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name (A–Z)" },
];

const BADGE_RANK: Record<string, number> = { "Chef's Pick": 0, "Best Seller": 1, Popular: 2, Signature: 3, Refreshing: 4 };

export default function MenuPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c && CATEGORIES.some((x) => x.slug === c)) setCategory(c);
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = MENU_ITEMS.filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (!q) return true;
      const cat = getCategory(m.category)?.name.toLowerCase() ?? "";
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || cat.includes(q);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.basePrice - b.basePrice;
        case "price-desc":
          return b.basePrice - a.basePrice;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return (BADGE_RANK[a.badge ?? ""] ?? 9) - (BADGE_RANK[b.badge ?? ""] ?? 9);
      }
    });
    return list;
  }, [query, category, sort]);

  const activeName = category === "all" ? "All dishes" : getCategory(category)?.name ?? "All dishes";

  const clear = () => {
    setQuery("");
    setCategory("all");
    setSort("featured");
  };

  return (
    <div>
      <section className="border-b border-ink-800">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="text-xs text-ink-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / <span className="text-ink-200">Menu</span>
          </nav>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-white sm:text-6xl">
            Authentic Korean <em className="text-accent-soft">flavours.</em>
          </h1>
          <p className="mt-4 max-w-2xl text-ink-300">
            Browse our menu, open any dish to see its build view and options, then send your order to Koreyaki on WhatsApp.
            Prices in INR. Taxes and delivery are confirmed by the restaurant.
          </p>
        </div>
      </section>

      <section aria-label="Filters" className="sticky top-16 z-30 border-b border-ink-800 bg-ink-950/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search dishes</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes or descriptions"
                className="h-11 w-full rounded-full border border-ink-700 bg-ink-900 pl-11 pr-10 text-sm text-white placeholder:text-ink-400 focus:border-accent focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <label className="sm:w-60">
              <span className="sr-only">Sort dishes</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 w-full rounded-full border border-ink-700 bg-ink-900 px-4 text-sm text-white focus:border-accent focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div role="tablist" aria-label="Categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {[{ slug: "all", name: "All" }, ...CATEGORIES].map((c) => {
              const active = category === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c.slug)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-ink-700 text-ink-300 hover:border-ink-500 hover:text-white"
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl text-white">{activeName}</h2>
          <p className="text-sm text-ink-400" aria-live="polite">
            {items.length} {items.length === 1 ? "dish" : "dishes"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-ink-700 px-6 py-20 text-center">
            <h3 className="font-serif text-2xl text-white">No dishes match</h3>
            <p className="mt-2 max-w-md text-sm text-ink-400">
              Try a different word or category. If you can&apos;t find something, ask the restaurant at {RESTAURANT_INFO.phoneDisplay}.
            </p>
            <Button variant="outline" className="mt-6" onClick={clear}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <MenuCard key={item.slug} item={item} />
            ))}
          </div>
        )}

        <p className="mt-14 text-center text-xs text-ink-400">
          Veg/non-veg and allergen details are confirmed by the restaurant. If you have an allergy, please check before ordering.
        </p>
      </section>
    </div>
  );
}
