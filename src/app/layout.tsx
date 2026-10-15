import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFab from "@/components/layout/WhatsAppFab";
import CartDrawer from "@/components/cart/CartDrawer";
import AIAssistant from "@/components/ai/AIAssistant";

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Koreyaki · Authentic Korean Food · Indiranagar, Bengaluru",
  description:
    "Authentic Korean food in Indiranagar, Bengaluru. Explore Koreyaki's menu in 3D, customise your dish, and send your order on WhatsApp.",
  openGraph: {
    title: "Koreyaki · Authentic Korean Food",
    description:
      "Korean fried chicken, ramen, bao buns, tteokbokki and bubble tea. Explore dishes in 3D and order on WhatsApp.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Noto+Serif+KR:wght@500;700&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppFab />
        <AIAssistant />
      </body>
    </html>
  );
}
