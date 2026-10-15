import Link from "next/link";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { RESTAURANT_INFO, whatsappLink } from "@/lib/utils";
import { CATEGORIES } from "@/lib/menu-data";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-800 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-semibold text-white">Koreyaki</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-400">
            Authentic Korean food in Indiranagar, Bengaluru. Explore, customise and order with confidence.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-100">Menu</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/menu" className="text-ink-400 hover:text-white">
                Full menu
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/menu?category=${c.slug}`} className="text-ink-400 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-100">Order</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={whatsappLink("Hi Koreyaki! I'd like to place an order.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink-400 hover:text-white">
                Order on WhatsApp <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <a href={RESTAURANT_INFO.zomatoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink-400 hover:text-white">
                Zomato <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              <a href={RESTAURANT_INFO.swiggyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink-400 hover:text-white">
                Swiggy <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-100">Visit</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-400">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
              <a href={RESTAURANT_INFO.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {RESTAURANT_INFO.address}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
              <span>
                {RESTAURANT_INFO.hoursNote}, {RESTAURANT_INFO.hours}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
              <a href={`tel:${RESTAURANT_INFO.phoneTel}`} className="hover:text-white">
                {RESTAURANT_INFO.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
              <a href={`mailto:${RESTAURANT_INFO.email}`} className="hover:text-white">
                {RESTAURANT_INFO.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Koreyaki. All rights reserved.</p>
          <p>
            Food photography: Pexels contributors (see credits on each dish). Prices in INR; taxes and delivery are confirmed by the
            restaurant.
          </p>
        </div>
      </div>
    </footer>
  );
}
