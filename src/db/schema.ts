import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
  real,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Restaurant settings
export const restaurantSettings = pgTable("restaurant_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu categories
export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

// Ingredients
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  allergens: jsonb("allergens").$type<string[]>().default([]),
  description: text("description"),
});

// Menu items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 300 }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => menuCategories.id),
  basePrice: integer("base_price").notNull(),
  imageUrl: text("image_url"),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isChefsPick: boolean("is_chefs_pick").notNull().default(false),
  spiceLevel: integer("spice_level").default(0),
  defaultIngredients: jsonb("default_ingredients").$type<number[]>().default([]),
  allergens: jsonb("allergens").$type<string[]>().default([]),
  calories: integer("calories"),
  prepTimeMinutes: integer("prep_time_minutes").default(15),
  modelStatus: varchar("model_status", { length: 50 })
    .notNull()
    .default("IMAGE_FALLBACK"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customization groups
export const customizationGroups = pgTable("customization_groups", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  minSelect: integer("min_select").notNull().default(0),
  maxSelect: integer("max_select").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Customization options
export const customizationOptions = pgTable("customization_options", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => customizationGroups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  priceAdjustment: integer("price_adjustment").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  ingredientId: integer("ingredient_id").references(() => ingredients.id),
  sortOrder: integer("sort_order").notNull().default(0),
});

// 3D model assets
export const foodModelAssets = pgTable("food_model_assets", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id")
    .notNull()
    .unique()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  modelUrl: text("model_url"),
  previewImageUrl: text("preview_image_url"),
  cameraPositionX: real("camera_position_x").default(0),
  cameraPositionY: real("camera_position_y").default(2),
  cameraPositionZ: real("camera_position_z").default(5),
  cameraTargetX: real("camera_target_x").default(0),
  cameraTargetY: real("camera_target_y").default(0),
  cameraTargetZ: real("camera_target_z").default(0),
  minDistance: real("min_distance").default(2),
  maxDistance: real("max_distance").default(8),
  explodedDistance: real("exploded_distance").default(1.0),
  components: jsonb("components").$type<
    Array<{
      id: string;
      label: string;
      ingredientId?: number;
      position: [number, number, number];
      explodedPosition: [number, number, number];
      color?: string;
      optional?: boolean;
      linkedOptionIds?: number[];
    }>
  >(),
  status: varchar("status", { length: 50 }).notNull().default("IMAGE_FALLBACK"),
  licenseInfo: text("license_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderUuid: uuid("order_uuid")
    .notNull()
    .unique()
    .default(sql`gen_random_uuid()`),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 200 }),
  orderType: varchar("order_type", { length: 20 }).notNull(),
  deliveryAddress: text("delivery_address"),
  subtotal: integer("subtotal").notNull(),
  tax: integer("tax").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  fulfillmentSlot: timestamp("fulfillment_slot"),
  notes: text("notes"),
  externalOrderRef: varchar("external_order_ref", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id"),
  itemName: varchar("item_name", { length: 200 }).notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
  customizations: jsonb("customizations").$type<
    Array<{ groupName: string; optionName: string; priceAdjustment: number }>
  >(),
  specialInstructions: text("special_instructions"),
});

// AI conversations (anonymized)
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Promotions
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  discountValue: integer("discount_value").notNull(),
  minOrderValue: integer("min_order_value").default(0),
  maxDiscount: integer("max_discount"),
  isActive: boolean("is_active").notNull().default(true),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
});
