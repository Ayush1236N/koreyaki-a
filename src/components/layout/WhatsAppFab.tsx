import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export default function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hi Koreyaki! I have a question about the menu.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Koreyaki on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-ink-950 shadow-xl transition hover:scale-105 focus-visible:outline-accent-soft"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
