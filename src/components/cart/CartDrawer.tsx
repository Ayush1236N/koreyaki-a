"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/lib/store";
import { priceCart } from "@/lib/pricing";
import { useHydrated } from "@/lib/use-in-view";
import { cn, formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const hydrated = useHydrated();

  const cart = priceCart(items);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[70] bg-black/60"
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 320 }}
            className="fixed right-0 top-0 z-[75] flex h-full w-full max-w-md flex-col border-l border-ink-800 bg-ink-900 shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-ink-800 px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl text-white">Your order</h2>
                <p className="text-xs text-ink-400">{hydrated ? `${count} ${count === 1 ? "item" : "items"}` : " "}</p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-300 hover:bg-ink-800 hover:text-white"
                aria-label="Close order"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {!hydrated ? (
                <div className="space-y-4 py-6" aria-hidden>
                  {[0, 1].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-ink-800" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink-800">
                    <ShoppingBag className="h-7 w-7 text-ink-400" />
                  </div>
                  <h3 className="font-serif text-xl text-white">Your order is empty</h3>
                  <p className="mt-2 max-w-xs text-sm text-ink-400">
                    Add a dish from the menu. You can customise it first.
                  </p>
                  <Link
                    href="/menu"
                    onClick={() => setCartOpen(false)}
                    className={cn(buttonVariants({ size: "lg" }), "mt-6")}
                  >
                    Browse the menu
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-ink-800">
                  {cart.lines.map(({ cartItem: item, menu, unitPrice, lineTotal, available, priceChanged }) => (
                    <li key={item.id} className="py-5">
                      <div className="flex gap-4">
                        {menu ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={menu.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-xl bg-ink-800" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={menu ? `/dish/${menu.slug}` : "/menu"}
                              onClick={() => setCartOpen(false)}
                              className="font-medium leading-snug text-white hover:text-accent-soft"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-ink-400 hover:text-accent-soft"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.selectedOptions.length > 0 && (
                            <p className="mt-1 text-xs leading-relaxed text-ink-400">
                              {item.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}`).join(" · ")}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="mt-1 text-xs italic text-ink-400">“{item.specialInstructions}”</p>
                          )}

                          {!available && (
                            <div className="mt-2">
                              <Badge variant="accent">
                                <AlertTriangle className="h-3 w-3" /> Unavailable · remove to continue
                              </Badge>
                            </div>
                          )}
                          {priceChanged && available && (
                            <p className="mt-1 text-[11px] text-gold">Price updated to the current menu price.</p>
                          )}

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex h-9 items-center rounded-full border border-ink-700">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="inline-flex h-9 w-9 items-center justify-center text-ink-300 hover:text-white"
                                aria-label={`Decrease ${item.name}`}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, Math.min(20, item.quantity + 1))}
                                className="inline-flex h-9 w-9 items-center justify-center text-ink-300 hover:text-white"
                                aria-label={`Increase ${item.name}`}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold tabular-nums">{formatPrice(lineTotal)}</p>
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-ink-400">{formatPrice(unitPrice)} each</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {hydrated && items.length > 0 && (
              <footer className="border-t border-ink-800 bg-ink-950/60 px-6 py-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-300">
                    <span>Subtotal (items)</span>
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

                {cart.blocking && (
                  <p role="alert" className="mt-3 text-xs text-accent-soft">
                    Some items are no longer available. Remove them to continue.
                  </p>
                )}

                <Link
                  href="/checkout"
                  onClick={(e) => {
                    if (cart.blocking) e.preventDefault();
                    else setCartOpen(false);
                  }}
                  aria-disabled={cart.blocking}
                  className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full", cart.blocking && "pointer-events-none opacity-40")}
                >
                  Review &amp; send order <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-[11px] text-ink-400">
                  Your order is sent to Koreyaki on WhatsApp. It is confirmed once the restaurant replies.
                </p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
