import type { Category, CustomizationGroup, CustomizationOption, MenuItem } from "./types";

/*
  VERIFIED MENU
  Names, descriptions and base prices come from koreyaki.co's published menu
  (homepage listing). Photos are real food photography from Pexels (free to use,
  attribution kept in imageCredit). Replace with Koreyaki's own photography when
  available by editing `image` below.

  Add-on prices are NOT published, so every priceAdjustment is 0 until the
  restaurant confirms them. Taxes and delivery charges are not configured either
  (see pricing.ts → PRICING_RULES).
*/

export const CATEGORIES: Category[] = [
  { slug: "k-sides", name: "K-Sides", description: "Tteokbokki, dumplings and corn dogs" },
  { slug: "bao-buns", name: "Bao Buns", description: "Soft steamed bao" },
  { slug: "fried-chicken", name: "Fried Chicken", description: "Korean fried chicken" },
  { slug: "rice-ramen", name: "Rice & Ramen", description: "Kimbap, fried rice and ramen" },
  { slug: "boba-tea", name: "Boba Tea", description: "Bubble tea, milkshakes and fizzy boba" },
];

export function photoUrl(id: number, width = 1200, height = 900): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=${height}&w=${width}`;
}

export const SITE_PHOTOS = {
  hero: { url: photoUrl(5773971, 1600, 1100), credit: "Luis Becerra / Pexels" },
  story: { url: photoUrl(38631739, 1200, 1500), credit: "Prateek Lall / Pexels" },
};

const photo = (id: number, credit: string) => ({
  image: photoUrl(id),
  imageCredit: `${credit} / Pexels`,
});

const opt = (name: string, isDefault = false): CustomizationOption => ({
  name,
  priceAdjustment: 0,
  isDefault,
});

const SPICE: CustomizationGroup = {
  slug: "spice",
  name: "Spice level",
  minSelect: 1,
  maxSelect: 1,
  options: [opt("Mild"), opt("Medium", true), opt("Spicy")],
};

const GLAZE: CustomizationGroup = {
  slug: "glaze",
  name: "Glaze",
  minSelect: 1,
  maxSelect: 1,
  options: [
    opt("Original", true),
    opt("Yangnyeom (sweet & spicy)"),
    opt("Soy garlic"),
    opt("Honey butter (gangjeong)"),
    opt("Sweet sticky"),
  ],
};

const SUGAR: CustomizationGroup = {
  slug: "sugar",
  name: "Sugar level",
  minSelect: 1,
  maxSelect: 1,
  options: [opt("0%"), opt("25%"), opt("50%", true), opt("75%"), opt("100%")],
};

const ICE: CustomizationGroup = {
  slug: "ice",
  name: "Ice level",
  minSelect: 1,
  maxSelect: 1,
  options: [opt("No ice"), opt("Less ice"), opt("Normal ice", true), opt("Extra ice")],
};

export const MENU_ITEMS: MenuItem[] = [
  {
    slug: "korean-fried-chicken",
    name: "Korean Fried Chicken",
    description: "Crispy Korean fried chicken coated in signature seasonings and bold house flavors.",
    category: "fried-chicken",
    basePrice: 24900,
    badge: "Best Seller",
    isAvailable: true,
    customization: [GLAZE],
    ...photo(5774006, "Luis Becerra"),
  },
  {
    slug: "katsu-ramen",
    name: "Katsu Ramen",
    description: "Hearty ramen topped with crispy katsu and rich Korean-style broth.",
    category: "rice-ramen",
    basePrice: 41900,
    badge: "Chef's Pick",
    isAvailable: true,
    customization: [SPICE],
    ...photo(39551175, "Jahra Tasfia Reza"),
  },
  {
    slug: "korean-ramen",
    name: "Korean Ramen",
    description: "Rich Korean ramen served with flavorful broth and carefully selected toppings.",
    category: "rice-ramen",
    basePrice: 34900,
    badge: "Signature",
    isAvailable: true,
    customization: [SPICE],
    ...photo(10359939, "FOX"),
  },
  {
    slug: "kimchi-fried-rice",
    name: "Kimchi Fried Rice",
    description: "Traditional kimchi fried rice packed with authentic Korean flavors and spices.",
    category: "rice-ramen",
    basePrice: 29900,
    badge: "Popular",
    isAvailable: true,
    customization: [SPICE],
    ...photo(24738523, "Nadin Sh"),
  },
  {
    slug: "kimbap",
    name: "Kimbap",
    description: "Fresh seaweed rice rolls filled with vegetables and signature ingredients.",
    category: "rice-ramen",
    basePrice: 39900,
    badge: "Signature",
    isAvailable: true,
    customization: [],
    ...photo(32196398, "Theodore Nguyen"),
  },
  {
    slug: "bao-buns",
    name: "Bao Buns",
    description: "Soft steamed bao buns filled with delicious Korean-inspired fillings.",
    category: "bao-buns",
    basePrice: 29900,
    badge: "Chef's Pick",
    isAvailable: true,
    customization: [],
    ...photo(30708197, "Anil Sharma"),
  },
  {
    slug: "tteokbokki",
    name: "Tteokbokki",
    description: "Korean rice cakes cooked in a sweet and spicy gochujang sauce.",
    category: "k-sides",
    basePrice: 24900,
    badge: "Popular",
    isAvailable: true,
    customization: [SPICE],
    ...photo(36964127, "Gu Ko"),
  },
  {
    slug: "dumplings",
    name: "Dumplings",
    description: "Steamed dumplings served with a savory dipping sauce.",
    category: "k-sides",
    basePrice: 22000,
    badge: "Best Seller",
    isAvailable: true,
    customization: [],
    ...photo(8093788, "Mikhail Nilov"),
  },
  {
    slug: "corn-dogs",
    name: "Corn Dogs",
    description: "Golden Korean-style corn dogs with a crispy outer coating.",
    category: "k-sides",
    basePrice: 22000,
    isAvailable: true,
    customization: [],
    ...photo(24738518, "Nadin Sh"),
  },
  {
    slug: "boba-tea",
    name: "Boba Tea",
    description: "Classic bubble tea available in a variety of refreshing flavors.",
    category: "boba-tea",
    basePrice: 22000,
    badge: "Refreshing",
    isAvailable: true,
    customization: [SUGAR, ICE],
    ...photo(6412830, "RDNE Stock project"),
  },
  {
    slug: "milkshake-boba",
    name: "Milkshake Boba",
    description: "Creamy milkshake blended with chewy boba pearls.",
    category: "boba-tea",
    basePrice: 23900,
    badge: "Popular",
    isAvailable: true,
    customization: [SUGAR],
    ...photo(39948188, "Mike C"),
  },
  {
    slug: "fizzy-boba",
    name: "Fizzy Boba",
    description: "Sparkling fruit drink with refreshing boba pearls and vibrant flavors.",
    category: "boba-tea",
    basePrice: 23900,
    badge: "Signature",
    isAvailable: true,
    customization: [SUGAR],
    ...photo(12987520, "Srattha Nualsate"),
  },
];

export function getMenuItem(slug: string): MenuItem | undefined {
  return MENU_ITEMS.find((m) => m.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
