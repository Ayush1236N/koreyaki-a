import type { CartItem, CustomizationGroup, MenuItem, SelectedOption } from "./types";
import { getMenuItem } from "./menu-data";

/*
  Single source of truth for pricing rules. The same module runs in the browser
  (live preview) and on the server (validation). The server always re-prices.

  Taxes, delivery and promotions are NOT configured for Koreyaki yet. They are
  deliberately null so no rate or fee is invented. Set them here once the
  restaurant confirms its rules.
*/
export const PRICING_RULES = {
  taxRateBasisPoints: null as number | null,
  deliveryFeePaise: null as number | null,
  currency: "INR" as const,
};

export function defaultSelections(item: MenuItem): SelectedOption[] {
  const out: SelectedOption[] = [];
  for (const group of item.customization) {
    const defaults = group.options.filter((o) => o.isDefault);
    const picks =
      defaults.length > 0 ? defaults : group.minSelect > 0 && group.options[0] ? [group.options[0]] : [];
    for (const o of picks) {
      out.push({
        groupSlug: group.slug,
        groupName: group.name,
        optionName: o.name,
        priceAdjustment: o.priceAdjustment,
      });
    }
  }
  return out;
}

/** A dish can be added in one tap when every required group already has a default. */
export function canQuickAdd(item: MenuItem): boolean {
  return item.customization.every((g) => g.minSelect === 0 || g.options.some((o) => o.isDefault));
}

export function unitPriceFor(basePrice: number, options: SelectedOption[]): number {
  return basePrice + options.reduce((sum, o) => sum + o.priceAdjustment, 0);
}

export function groupRequirementText(g: CustomizationGroup): string {
  if (g.minSelect === g.maxSelect) return `Choose ${g.minSelect}`;
  if (g.maxSelect === 1) return "Choose one";
  return `Choose ${g.minSelect}–${g.maxSelect}`;
}

export function selectionError(item: MenuItem, selections: { groupSlug: string }[]): string | null {
  for (const g of item.customization) {
    const count = selections.filter((s) => s.groupSlug === g.slug).length;
    if (count < g.minSelect) return `Choose at least ${g.minSelect} for ${g.name}`;
  }
  return null;
}

/**
 * Validates customer-submitted selections against the item's configuration and
 * rebuilds the option list using CONFIG prices. Client-submitted prices are ignored.
 */
export function normalizeSelections(
  item: MenuItem,
  input: { groupSlug: string; optionName: string }[]
): { ok: true; options: SelectedOption[] } | { ok: false; error: string } {
  const unknown = input.find((s) => !item.customization.some((g) => g.slug === s.groupSlug));
  if (unknown) return { ok: false, error: `Invalid customization for ${item.name}` };

  const out: SelectedOption[] = [];
  for (const group of item.customization) {
    const picks = input.filter((s) => s.groupSlug === group.slug);
    const names = picks.map((p) => p.optionName);
    if (new Set(names).size !== names.length) {
      return { ok: false, error: `Duplicate option in ${group.name} for ${item.name}` };
    }
    if (names.length < group.minSelect || names.length > group.maxSelect) {
      return { ok: false, error: `${groupRequirementText(group)} for ${group.name} on ${item.name}` };
    }
    for (const name of names) {
      const cfg = group.options.find((o) => o.name === name);
      if (!cfg) return { ok: false, error: `"${name}" is not available for ${item.name}` };
      out.push({
        groupSlug: group.slug,
        groupName: group.name,
        optionName: cfg.name,
        priceAdjustment: cfg.priceAdjustment,
      });
    }
  }
  return { ok: true, options: out };
}

/** Re-prices a cart line from current menu data (used for cart/checkout revalidation). */
export function priceCart(items: CartItem[]) {
  const lines = items.map((ci) => {
    const menu = getMenuItem(ci.menuItemSlug);
    const repriced = menu
      ? (() => {
          const res = normalizeSelections(
            menu,
            ci.selectedOptions.map((s) => ({ groupSlug: s.groupSlug, optionName: s.optionName }))
          );
          return res.ok ? res.options : null;
        })()
      : null;
    const unitPrice = menu && repriced ? unitPriceFor(menu.basePrice, repriced) : ci.unitPrice;
    const available = !!menu && menu.isAvailable && repriced !== null;
    return {
      cartItem: ci,
      menu,
      unitPrice,
      lineTotal: unitPrice * ci.quantity,
      available,
      priceChanged: unitPrice !== ci.unitPrice,
    };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const blocking = lines.some((l) => !l.available);
  return { lines, subtotal, blocking };
}
