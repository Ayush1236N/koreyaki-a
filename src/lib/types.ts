export interface Category {
  slug: string;
  name: string;
  description: string;
}

export interface CustomizationOption {
  name: string;
  priceAdjustment: number; // paise; 0 until the restaurant confirms add-on prices
  isDefault?: boolean;
}

export interface CustomizationGroup {
  slug: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MenuItem {
  slug: string;
  name: string;
  description: string;
  category: string;
  basePrice: number; // paise (1/100 INR) – integer, never floating point
  image: string;
  imageCredit?: string;
  badge?: string;
  isAvailable: boolean;
  customization: CustomizationGroup[];
}

export interface SelectedOption {
  groupSlug: string;
  groupName: string;
  optionName: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string;
  menuItemSlug: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
  addedAt: number;
}

export interface ModelComponent {
  id: string;
  label: string;
  position: [number, number, number];
  explodedPosition: [number, number, number];
  color?: string;
  optional?: boolean;
  hiddenByDefault?: boolean;
  linkedOptionIds?: number[];
}

export interface ModelConfig {
  menuItemSlug: string;
  /** Real GLB in /public/models. Null means the procedural build view is used. */
  modelUrl: string | null;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  minDistance: number;
  maxDistance: number;
  explodedDistance: number;
  components: ModelComponent[];
}

/* ---------- Checkout / order API contract ---------- */

export interface CheckoutSelection {
  groupSlug: string;
  optionName: string;
}

export interface CheckoutLineInput {
  menuItemSlug: string;
  quantity: number;
  selections: CheckoutSelection[];
  specialInstructions?: string;
}

export interface CheckoutRequest {
  customerName: string;
  customerPhone: string;
  orderType: "pickup" | "delivery";
  deliveryAddress?: string;
  notes?: string;
  items: CheckoutLineInput[];
}

export interface CheckoutLine {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  options: string;
}

export interface CheckoutResponse {
  reference: string;
  orderId: string;
  lines: CheckoutLine[];
  subtotal: number;
  total: number;
  currency: "INR";
}
