"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { CATEGORIES, getCategory, MENU_ITEMS } from "@/lib/menu-data";
import { getModelConfig } from "@/lib/model-registry";
import type { MenuItem } from "@/lib/types";
import { cn, formatPrice, RESTAURANT_INFO } from "@/lib/utils";

/*
  Chimaek is a rule-based guide grounded in the verified menu data above. It never
  invents ingredients, allergens, prices, hours or promotions. Allergy questions are
  always routed to the restaurant. Connect a server-side LLM later through an API route
  that receives the same menu context; never expose provider keys to the browser.
*/

interface Msg {
  id: number;
  role: "user" | "assistant";
  text: string;
  dishes?: MenuItem[];
  links?: { label: string; href: string }[];
}

const QUICK = [
  "What should I order?",
  "Best sellers",
  "Spicy options",
  "Vegetarian options",
  "Opening hours",
  "Bubble tea",
];

let nextId = 1;
const make = (role: Msg["role"], text: string, extra: Partial<Msg> = {}): Msg => ({ id: nextId++, role, text, ...extra });

const prices = () => {
  const p = MENU_ITEMS.map((m) => m.basePrice);
  return { min: Math.min(...p), max: Math.max(...p) };
};

function answer(raw: string): Msg {
  const q = raw.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has("allerg", "gluten", "nut", "peanut", "vegan safe", "halal", "pork", "beef", "contain")) {
    return make(
      "assistant",
      `I can't confirm ingredients or allergens for every dish, so I won't guess. Please call ${RESTAURANT_INFO.phoneDisplay} or message us on WhatsApp before ordering. Tell the team about any allergy so they can advise on cross-contact.`,
      { links: [{ label: "WhatsApp Koreyaki", href: `https://wa.me/${RESTAURANT_INFO.whatsappNumber}` }] }
    );
  }

  if (has("hour", "open", "close", "timing", "time")) {
    return make(
      "assistant",
      `Koreyaki is open every day, ${RESTAURANT_INFO.hours}. Address: ${RESTAURANT_INFO.address}.`,
      { links: [{ label: "Get directions", href: RESTAURANT_INFO.mapsUrl }] }
    );
  }

  if (has("where", "location", "address", "visit", "directions")) {
    return make("assistant", `We're at ${RESTAURANT_INFO.address}. Call ${RESTAURANT_INFO.phoneDisplay} for reservations.`, {
      links: [{ label: "Get directions", href: RESTAURANT_INFO.mapsUrl }],
    });
  }

  if (has("reserve", "reservation", "table", "book")) {
    return make(
      "assistant",
      `You can reserve a table by WhatsApp or phone at ${RESTAURANT_INFO.phoneDisplay}. Use the reservation form on the home page to send your request.`,
      { links: [{ label: "Reserve", href: "/#reserve" }] }
    );
  }

  if (has("vegetarian", "veg ", "veggie", "vegetable")) {
    return make(
      "assistant",
      "Koreyaki serves both vegetarian and non-vegetarian dishes. Veg/non-veg status isn't listed per dish in our verified data yet, so please confirm the dish you pick with the restaurant.",
      { links: [{ label: "Browse menu", href: "/menu" }] }
    );
  }

  if (has("spic", "hot", "heat")) {
    const spicy = MENU_ITEMS.filter((m) => m.customization.some((g) => g.slug === "spice")).slice(0, 4);
    return make(
      "assistant",
      "These dishes let you choose your spice level when you customise them. Medium is the default.",
      { dishes: spicy }
    );
  }

  if (has("boba", "bubble", "tea", "drink", "shake", "fizzy", "beverage")) {
    return make("assistant", "Here are our boba and drinks. You can pick sugar level (and ice for bubble tea).", {
      dishes: MENU_ITEMS.filter((m) => m.category === "boba-tea"),
    });
  }

  if (has("chicken", "wing", "fried")) {
    return make("assistant", "Our Korean fried chicken is double-fried. You can choose the glaze.", {
      dishes: MENU_ITEMS.filter((m) => m.category === "fried-chicken"),
    });
  }

  if (has("ramen", "noodle", "rice", "kimbap", "kimchi")) {
    return make("assistant", "Rice and ramen dishes from our kitchen:", {
      dishes: MENU_ITEMS.filter((m) => m.category === "rice-ramen"),
    });
  }

  if (has("bao", "dumpling", "tteok", "corn dog", "side", "street")) {
    return make("assistant", "Bao, street food and sides:", {
      dishes: MENU_ITEMS.filter((m) => ["bao-buns", "k-sides"].includes(m.category)),
    });
  }

  if (has("best", "popular", "recommend", "should i order", "suggest", "what to order", "signature", "chef")) {
    const picks = MENU_ITEMS.filter((m) => m.badge === "Chef's Pick" || m.badge === "Best Seller" || m.badge === "Popular").slice(0, 4);
    return make("assistant", "Guest favourites on our menu, based on the badges we publish:", { dishes: picks });
  }

  if (has("price", "cost", "how much", "cheap", "expensive", "budget")) {
    const { min, max } = prices();
    return make(
      "assistant",
      `Dishes on our menu range from ${formatPrice(min)} to ${formatPrice(max)}. Taxes and delivery are confirmed by the restaurant at checkout.`,
      { links: [{ label: "Browse menu", href: "/menu" }] }
    );
  }

  if (has("order", "checkout", "cart", "deliver", "pickup", "pick up")) {
    return make(
      "assistant",
      "Add dishes to your order, review it, then send it to Koreyaki on WhatsApp. The restaurant confirms availability and the final total.",
      { links: [{ label: "Review order", href: "/checkout" }] }
    );
  }

  const named = MENU_ITEMS.find((m) => q.includes(m.name.toLowerCase()));
  if (named) {
    const cfg = getModelConfig(named.slug);
    const cat = getCategory(named.category);
    const groups = named.customization.map((g) => g.name).join(", ");
    return make(
      "assistant",
      `${named.name} (${cat?.name ?? "Menu"}): ${named.description} ${groups ? `You can customise: ${groups}.` : "No options are needed; just pick a quantity."} ${cfg ? "There's an interactive 3D build view." : ""}`.trim(),
      {
        dishes: [named],
        links: [{ label: "Open dish", href: `/dish/${named.slug}` }],
      }
    );
  }

  if (has("hi", "hello", "hey", "annyeong")) {
    return make("assistant", "Annyeong! I'm Chimaek, your Koreyaki guide. Ask about dishes, spice, drinks, hours or how to order.");
  }

  return make(
    "assistant",
    `I can help with dishes, spice levels, drinks, hours and ordering. Try "Best sellers" or name a dish. Browse categories: ${CATEGORIES.map((c) => c.name).join(", ")}.`
  );
}

export default function AIAssistant() {
  const isOpen = useCartStore((s) => s.aiOpen);
  const setAiOpen = useCartStore((s) => s.setAiOpen);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        make(
          "assistant",
          "Annyeong! I'm Chimaek, your Koreyaki guide. I can explain dishes, suggest what to order, and help you with spice, drinks, hours and ordering."
        ),
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, make("user", t)]);
    setInput("");
    setTyping(true);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, answer(t)]);
      setTyping(false);
    }, 350);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="fixed bottom-5 left-5 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-xl transition hover:bg-accent-hover"
          aria-label="Open Chimaek, the Koreyaki menu guide"
        >
          <Sparkles className="h-4 w-4" />
          Ask Chimaek
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiOpen(false)}
              className="fixed inset-0 z-[80] bg-black/50 md:hidden"
              aria-hidden
            />
            <motion.section
              role="dialog"
              aria-label="Chimaek menu guide"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-3 bottom-3 z-[85] flex h-[72vh] max-h-[680px] flex-col overflow-hidden rounded-3xl border border-ink-700 bg-ink-900 shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:h-[600px] sm:w-[420px]"
            >
              <header className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg text-white">Chimaek</h2>
                    <p className="text-[11px] text-ink-400">Koreyaki menu guide · answers from our verified menu</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-300 hover:bg-ink-800 hover:text-white"
                  aria-label="Close guide"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[88%] space-y-3", m.role === "user" ? "items-end" : "")}>
                      <p
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          m.role === "user" ? "bg-accent text-white" : "bg-ink-800 text-ink-100"
                        )}
                      >
                        {m.text}
                      </p>

                      {m.dishes && m.dishes.length > 0 && (
                        <ul className="space-y-1.5">
                          {m.dishes.map((d) => (
                            <li key={d.slug}>
                              <Link
                                href={`/dish/${d.slug}`}
                                onClick={() => setAiOpen(false)}
                                className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-950 p-2 pr-3 text-left transition-colors hover:border-ink-500"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={d.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                                <span className="min-w-0 flex-1 truncate text-sm text-white">{d.name}</span>
                                <span className="text-xs text-accent-soft">{formatPrice(d.basePrice)}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      {m.links && m.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {m.links.map((l) =>
                            l.href.startsWith("http") ? (
                              <a
                                key={l.href}
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-ink-600 px-3 py-1.5 text-xs text-ink-100 hover:border-ink-400"
                              >
                                {l.label}
                              </a>
                            ) : (
                              <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setAiOpen(false)}
                                className="rounded-full border border-ink-600 px-3 py-1.5 text-xs text-ink-100 hover:border-ink-400"
                              >
                                {l.label}
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex gap-1 rounded-2xl bg-ink-800 px-4 py-3" aria-label="Chimaek is typing">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400" style={{ animationDelay: `${i * 120}ms` }} />
                    ))}
                  </div>
                )}
              </div>

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 border-t border-ink-800 px-4 py-3">
                  {QUICK.map((qk) => (
                    <button
                      key={qk}
                      type="button"
                      onClick={() => ask(qk)}
                      className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-ink-200 hover:border-ink-500 hover:text-white"
                    >
                      {qk}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-ink-800 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a dish, spice or hours"
                  aria-label="Message Chimaek"
                  maxLength={300}
                  className="h-11 flex-1 rounded-full border border-ink-700 bg-ink-950 px-4 text-sm text-white placeholder:text-ink-400 focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="flex items-center justify-between px-4 pb-3 text-[11px] text-ink-400">
                <span>Allergies? Always confirm with the restaurant.</span>
                <button
                  type="button"
                  onClick={() => {
                    setAiOpen(false);
                    setCartOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-ink-300 hover:text-white"
                >
                  <MessageCircle className="h-3 w-3" /> View order
                </button>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
