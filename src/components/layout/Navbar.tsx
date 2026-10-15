"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/#signatures", label: "Signatures" },
  { href: "/#story", label: "Our Story" },
  { href: "/#visit", label: "Visit" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-ink-800 bg-ink-950/90 backdrop-blur-md" : "border-transparent bg-ink-950"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Koreyaki home">
          <span className="font-serif text-2xl font-semibold tracking-tight text-white">Koreyaki</span>
          <span className="hidden font-korean text-xs text-ink-400 sm:inline">한식당</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-300 transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/#reserve" className={cn(buttonVariants({ size: "sm" }), "hidden tracking-wide sm:inline-flex")}>
            Reserve
          </Link>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 text-ink-100 transition-colors hover:border-ink-400"
            aria-label={`Open order, ${hydrated ? count : 0} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            {hydrated && count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 text-ink-100 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-ink-800 bg-ink-950 px-4 py-4 md:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-ink-100 hover:bg-ink-800"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/#reserve"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ size: "lg" }), "mt-3")}
            >
              Reserve a table
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
