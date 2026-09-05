import type { GroupedVariants, ProductVariant } from '@/lib/types';

/**
 * Groups a flat list of variant rows (one row per attribute value, e.g.
 * { attribute_name: 'Size', attribute_value: 'M' }) into a map of
 * attribute_name -> attribute rows, sorted by display_order.
 *
 * Example output: { Size: [...rows for S/M/L], Color: [...rows for Brown/Black] }
 */
export function groupVariants(variants: ProductVariant[]): GroupedVariants {
  const grouped: GroupedVariants = {};

  for (const variant of variants) {
    if (!grouped[variant.attribute_name]) {
      grouped[variant.attribute_name] = [];
    }
    grouped[variant.attribute_name].push(variant);
  }

  for (const attributeName of Object.keys(grouped)) {
    grouped[attributeName].sort((a, b) => a.display_order - b.display_order);
  }

  return grouped;
}

/**
 * Given the customer's selected value per attribute (e.g. { Size: 'M', Color: 'Brown' })
 * and the product's flat variant list, resolves the specific variant_id for each
 * selected attribute. One product_variants row exists per attribute value, so a
 * selection across N attributes resolves to up to N variant_ids.
 *
 * Returns null if any selected attribute/value combination has no matching row
 * (e.g. stale selection, or the product has no variants for that attribute) —
 * callers should treat this as "selection invalid, don't allow add to cart".
 */
export function resolveVariantIds(variants: ProductVariant[], selections: Record<string, string>): string[] | null {
  const variantIds: string[] = [];

  for (const [attributeName, attributeValue] of Object.entries(selections)) {
    const match = variants.find(v => v.attribute_name === attributeName && v.attribute_value === attributeValue);
    if (!match) {
      return null;
    }
    variantIds.push(match.id);
  }

  return variantIds;
}

/**
 * Stock for a given selection = the minimum stock_quantity across the resolved
 * variant rows (e.g. if Size M has 3 left and Color Brown has 10 left across all
 * sizes, the binding constraint is 3). Returns null if the selection doesn't
 * resolve to real variant rows.
 */
export function getSelectionStock(variants: ProductVariant[], selections: Record<string, string>): number | null {
  const variantIds = resolveVariantIds(variants, selections);
  if (!variantIds) return null;

  const stocks = variantIds.map(id => variants.find(v => v.id === id)!.stock_quantity);
  return Math.min(...stocks);
}

/**
 * True once the customer has picked a value for every attribute the product offers.
 */
export function isSelectionComplete(grouped: GroupedVariants, selections: Record<string, string>): boolean {
  return Object.keys(grouped).every(attributeName => Boolean(selections[attributeName]));
}
