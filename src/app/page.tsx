"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import { ArrowRight, Box, Clock, Layers, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import MenuCard from "@/components/menu/MenuCard";
import { CATEGORIES, getMenuItem, MENU_ITEMS, SITE_PHOTOS } from "@/lib/menu-data";
import { useInView } from "@/lib/use-in-view";
import { cn, RESTAURANT_INFO, whatsappLink } from "@/lib/utils";

const FoodViewer = dynamic(() => import("@/components/three/FoodViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-ink-900" aria-hidden />,
});

const SIGNATURE_SLUGS = ["katsu-ramen", "korean-fried-chicken", "bao-buns", "kimchi-fried-rice"];
const CATEGORY_COVER: Record<string, string> = {
  "k-sides": "tteokbokki",
  "bao-buns": "bao-buns",
  "fried-chicken": "korean-fried-chicken",
  "rice-ramen": "katsu-ramen",
  "boba-tea": "boba-tea",
};

const FAQ = [
  {
    q: "What type of cuisine does Koreyaki serve?",
    a: "Koreyaki serves authentic Korean food, including Korean fried chicken, ramen, rice bowls, kimbap, tteokbokki, dumplings, bao buns and bubble tea.",
  },
  {
    q: "Where is Koreyaki located?",
    a: `${RESTAURANT_INFO.address}.`,
  },
  {
    q: "What are Koreyaki's opening hours?",
    a: `Koreyaki is open every day, ${RESTAURANT_INFO.hours}.`,
  },
  {
    q: "Does Koreyaki offer vegetarian options?",
    a: "Yes. Koreyaki offers a selection of vegetarian Korean dishes alongside its non-vegetarian menu. Please confirm the dish you pick with the restaurant.",
  },
  {
    q: "Can I reserve a table?",
    a: `Yes. Use the reservation form on this page, or call or WhatsApp ${RESTAURANT_INFO.phoneDisplay}.`,
  },
  {
    q: "How do I order?",
    a: "Build your order here, then send it to Koreyaki on WhatsApp. The restaurant confirms availability and the final total before preparing it.",
  },
];

export default function HomePage() {
  const signatures = SIGNATURE_SLUGS.map((s) => getMenuItem(s)).filter(Boolean) as typeof MENU_ITEMS;
  const { ref: viewerRef, inView: viewerInView } = useInView<HTMLDivElement>("300px");

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-300">
              <span className="h-1.5 w-1.5 rounded-full bg-whatsapp" aria-hidden />
              Open today · {RESTAURANT_INFO.hours}
            </p>
            <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Authentic Korean
              <br />
              flavours, <em className="text-accent-soft">explored</em> in 3D.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
              Turn any dish around, pull it apart into its components, pick your options and see the price before you
              send your order to Koreyaki on WhatsApp.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/menu" className={cn(buttonVariants({ size: "xl" }))}>
                Explore the menu <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dish/katsu-ramen" className={cn(buttonVariants({ variant: "outline", size: "xl" }))}>
                <Box className="h-4 w-4" /> Try a 3D dish
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-800 pt-8">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-ink-400">Rating</dt>
                <dd className="mt-1 flex items-center gap-1.5 font-serif text-2xl text-white">
                  {RESTAURANT_INFO.rating.value}
                  <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
                </dd>
                <dd className="text-xs text-ink-400">{RESTAURANT_INFO.rating.count} ratings on {RESTAURANT_INFO.rating.source}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-ink-400">Dishes</dt>
                <dd className="mt-1 font-serif text-2xl text-white">{MENU_ITEMS.length}</dd>
                <dd className="text-xs text-ink-400">on our published menu</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-ink-400">Location</dt>
                <dd className="mt-1 font-serif text-2xl text-white">Indiranagar</dd>
                <dd className="text-xs text-ink-400">Bengaluru</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-ink-800 bg-ink-900 sm:aspect-[5/4] lg:aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SITE_PHOTOS.hero.url} alt="A spread of Korean dishes on a table at Koreyaki" className="h-full w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-md">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-accent-soft">Chef&apos;s pick</p>
                  <p className="font-serif text-xl text-white">Katsu Ramen</p>
                </div>
                <Link href="/dish/katsu-ramen" className={cn(buttonVariants({ size: "sm" }))}>
                  Customise
                </Link>
              </div>
            </div>
            <div className="absolute -left-3 top-8 hidden max-w-[220px] rounded-2xl border border-ink-700 bg-ink-900 p-4 shadow-xl sm:block">
              <div className="flex items-center gap-2 text-accent-soft">
                <Layers className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em]">Build view</p>
              </div>
              <p className="mt-2 text-sm text-ink-200">See every component, then reassemble it in one tap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SHORTCUTS */}
      <section aria-labelledby="categories" className="border-y border-ink-800 bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">Browse</p>
              <h2 id="categories" className="mt-2 font-serif text-3xl text-white sm:text-4xl">
                Find your craving
              </h2>
            </div>
            <Link href="/menu" className="hidden text-sm text-ink-300 hover:text-white sm:inline-flex sm:items-center sm:gap-1">
              Full menu <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            {CATEGORIES.map((c) => {
              const cover = getMenuItem(CATEGORY_COVER[c.slug] ?? "");
              return (
                <li key={c.slug}>
                  <Link href={`/menu?category=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-ink-800 bg-ink-900">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90" loading="lazy" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" aria-hidden />
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="font-serif text-xl text-white">{c.name}</p>
                      <p className="mt-1 text-xs text-ink-300">{c.description}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* SIGNATURES */}
      <section id="signatures" aria-labelledby="signatures-title" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">Most ordered</p>
            <h2 id="signatures-title" className="mt-2 font-serif text-3xl text-white sm:text-4xl">
              Signatures from our kitchen
            </h2>
            <p className="mt-3 max-w-xl text-ink-400">
              Badges come from our published menu. Each card links to the dish page, where you can customise and see the 3D build view.
            </p>
          </div>
          <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }))}>
            View all dishes
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {signatures.map((item) => (
            <MenuCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      {/* 3D SHOWCASE */}
      <section id="build" aria-labelledby="build-title" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <div className="grid gap-10 rounded-[2rem] border border-ink-800 bg-ink-900 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <div>
            <Badge variant="outline">Interactive build view</Badge>
            <h2 id="build-title" className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">
              See what&apos;s inside your bowl.
            </h2>
            <p className="mt-4 leading-relaxed text-ink-300">
              Each build view is made from separate components, so you can explode a dish, highlight one part, and hide the optional
              garnish. It loads only when it scrolls into view and works on phones.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-200">
              {[
                "Drag to rotate, pinch or scroll to zoom, reset anytime",
                "Explode the dish to see each component separately",
                "Tap a part to see its name and show or hide optional parts",
                "Your options and price update on the same page",
              ].map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-ink-400">
              Each build view is a procedural model of that specific dish. When a commissioned 3D scan is added, it loads in its place
              automatically and the photo stays as the fallback.
            </p>
            <Link href="/dish/katsu-ramen" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
              Open Katsu Ramen build view <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div ref={viewerRef} className="h-[380px] sm:h-[460px]">
            {viewerInView ? (
              <FoodViewer menuItemSlug="katsu-ramen" poster={getMenuItem("katsu-ramen")?.image} posterAlt="Katsu Ramen" className="h-full" />
            ) : (
              <div className="h-full w-full animate-pulse rounded-2xl bg-ink-800" aria-hidden />
            )}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" aria-labelledby="story-title" className="mx-auto grid max-w-7xl scroll-mt-20 items-center gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE_PHOTOS.story.url} alt="Korean dishes served at Koreyaki" className="h-full w-full object-cover" loading="lazy" />
          <p className="absolute bottom-3 left-4 text-[11px] text-white/70">Photo: {SITE_PHOTOS.story.credit}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">Our story</p>
          <h2 id="story-title" className="mt-2 font-serif text-3xl text-white sm:text-4xl">
            Authentic Korean cuisine, served with passion.
          </h2>
          <p className="mt-5 leading-relaxed text-ink-300">
            At Koreyaki we bring the rich flavours and traditions of Korea to the heart of Indiranagar. Every dish is crafted to
            deliver an authentic dining experience, from comforting street-food favourites to classic Korean specialities.
          </p>
          <p className="mt-4 leading-relaxed text-ink-300">
            Our menu features Korean fried chicken, ramen, bibimbap-style rice bowls, tteokbokki, dumplings and refreshing bubble
            tea, made with quality ingredients and traditional recipes.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink-800 pt-6">
            <div>
              <p className="font-serif text-2xl text-white">50+</p>
              <p className="text-xs text-ink-400">Korean dishes</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-white">Daily</p>
              <p className="text-xs text-ink-400">Fresh ingredients</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-white">Veg &amp; non-veg</p>
              <p className="text-xs text-ink-400">Both on one menu</p>
            </div>
          </div>
        </div>
      </section>

      {/* VISIT + RESERVATION */}
      <section id="visit" aria-labelledby="visit-title" className="scroll-mt-20 border-y border-ink-800 bg-ink-900/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">Visit</p>
            <h2 id="visit-title" className="mt-2 font-serif text-3xl text-white sm:text-4xl">
              Come on over.
            </h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" />
                <div>
                  <p className="font-medium text-white">Address</p>
                  <a href={RESTAURANT_INFO.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-ink-300 hover:text-white">
                    {RESTAURANT_INFO.address}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" />
                <div>
                  <p className="font-medium text-white">Opening hours</p>
                  <p className="text-sm text-ink-300">
                    {RESTAURANT_INFO.hoursNote}: {RESTAURANT_INFO.hours}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" />
                <div>
                  <p className="font-medium text-white">Call or WhatsApp</p>
                  <a href={`tel:${RESTAURANT_INFO.phoneTel}`} className="text-sm text-ink-300 hover:text-white">
                    {RESTAURANT_INFO.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <a href={`mailto:${RESTAURANT_INFO.email}`} className="text-sm text-ink-300 hover:text-white">
                    {RESTAURANT_INFO.email}
                  </a>
                </div>
              </li>
            </ul>
            <div className="mt-8 rounded-2xl border border-ink-800 bg-ink-950 p-5">
              <p className="text-sm text-ink-200">
                Rated <span className="font-semibold text-white">{RESTAURANT_INFO.rating.value}</span> from{" "}
                {RESTAURANT_INFO.rating.count} ratings on{" "}
                <a href={RESTAURANT_INFO.eazydinerUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-ink-600 underline-offset-4 hover:text-white">
                  {RESTAURANT_INFO.rating.source}
                </a>
                . We don&apos;t publish reviews here until we can show them verbatim with their source.
              </p>
            </div>
          </div>

          <ReservationForm />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">FAQ</p>
          <h2 id="faq-title" className="mt-2 font-serif text-3xl text-white sm:text-4xl">
            Questions? Answers.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-ink-800 rounded-2xl border border-ink-800 bg-ink-900">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-white">
                {f.q}
                <span className="text-accent-soft transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-accent p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="font-serif text-3xl text-white sm:text-4xl">Hungry? Build your order.</h2>
            <p className="mt-2 max-w-lg text-white/85">Customise any dish, check the price, then send it to Koreyaki on WhatsApp.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/menu" className={cn(buttonVariants({ variant: "light", size: "lg" }))}>
              Explore menu
            </Link>
            <a href={whatsappLink("Hi Koreyaki! I'd like to place an order.")} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }))}>
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReservationForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState("2");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid phone number.");
    if (!date) return setError("Please choose a date.");

    const msg = [
      "Hi Koreyaki! I'd like to reserve a table.",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Date: ${date}`,
      `Time: ${time}`,
      `Guests: ${guests}`,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const field = "h-11 w-full rounded-xl border border-ink-700 bg-ink-950 px-4 text-sm text-white placeholder:text-ink-400 focus:border-accent focus:outline-none";

  return (
    <div id="reserve" className="scroll-mt-24 rounded-[2rem] border border-ink-800 bg-ink-950 p-6 sm:p-8">
      <h3 className="font-serif text-2xl text-white">Reserve a table</h3>
      <p className="mt-2 text-sm text-ink-400">
        Send your request on WhatsApp. The restaurant confirms your table. Walk-ins are welcome, subject to availability.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
        <label className="block sm:col-span-1">
          <span className="mb-1.5 block text-xs font-medium text-ink-300">Name</span>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-300">Phone</span>
          <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" inputMode="tel" autoComplete="tel" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-300">Date</span>
          <input className={field} type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-300">Time</span>
          <input className={field} type="time" value={time} onChange={(e) => setTime(e.target.value)} min="13:30" max="22:00" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-300">Guests</span>
          <select className={field} value={guests} onChange={(e) => setGuests(e.target.value)}>
            {["1", "2", "3", "4", "5", "6", "7-10", "10+"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-300">Occasion or notes</span>
          <input className={field} value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 200))} placeholder="Optional" />
        </label>

        {error && (
          <p role="alert" className="text-sm text-accent-soft sm:col-span-2">
            {error}
          </p>
        )}
        {sent && (
          <p role="status" className="text-sm text-whatsapp sm:col-span-2">
            WhatsApp opened with your request. Send it to confirm.
          </p>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" variant="whatsapp" size="lg" className="w-full">
            <MessageCircle className="h-4 w-4" /> Send request on WhatsApp
          </Button>
        </div>
      </form>
    </div>
  );
}
