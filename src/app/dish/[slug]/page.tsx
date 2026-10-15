import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DishDetail from "@/components/menu/DishDetail";
import { getMenuItem, MENU_ITEMS } from "@/lib/menu-data";
import { formatPrice } from "@/lib/utils";

export function generateStaticParams() {
  return MENU_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getMenuItem(slug);
  if (!item) return { title: "Dish not found · Koreyaki" };
  return {
    title: `${item.name} · Koreyaki`,
    description: `${item.description} From ${formatPrice(item.basePrice)}. Customise and order from Koreyaki, Indiranagar.`,
    openGraph: { images: [item.image] },
  };
}

export default async function DishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getMenuItem(slug);
  if (!item) notFound();
  return <DishDetail slug={slug} />;
}
