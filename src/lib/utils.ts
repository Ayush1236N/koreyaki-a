import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Display only. Prices are stored as integer paise and never computed with floats. */
export function formatPrice(paise: number): string {
  return inr.format(paise / 100);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/*
  Business details. Sourced from koreyaki.co (address, hours, FAQ),
  EazyDiner (rating) and the restaurant's published contact details.
  Verify the phone/WhatsApp/email before launch.
*/
export const RESTAURANT_INFO = {
  name: "Koreyaki",
  address:
    "11th Main Road, HAL 2nd Stage, Appareddipalya, Indiranagar, Bengaluru, Karnataka 560008",
  area: "Indiranagar, Bengaluru",
  hours: "1:30 PM – 10:30 PM",
  hoursNote: "Open every day",
  phoneDisplay: "+91 95918 11065",
  phoneTel: "+919591811065",
  whatsappNumber: "919591811065",
  email: "info@koreyaki.in",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Koreyaki+Indiranagar+Bengaluru",
  zomatoUrl: "https://www.zomato.com/bangalore/restaurants/koreyaki",
  swiggyUrl: "https://www.swiggy.com/city/bangalore/korean-cuisine-restaurants",
  eazydinerUrl: "https://www.eazydiner.com/bengaluru/koreyaki-indiranagar-east-bengaluru-699818",
  rating: { value: 4.1, count: 712, source: "EazyDiner" },
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
