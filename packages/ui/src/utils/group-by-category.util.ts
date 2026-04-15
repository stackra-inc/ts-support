/**
 * @fileoverview groupByCategory — groups actions by their category field.
 *
 * Returns a Map preserving category order from the categories array.
 *
 * @module command-dock/utils/group-by-category
 */

import type { DockAction } from '@/interfaces';
import type { DockCategory } from '@/interfaces';

/**
 * Group actions by their `category` field, ordered by the categories array.
 *
 * @param actions - Visible actions to group.
 * @param categories - Category definitions determining group order.
 * @returns Map of category id → actions in that category.
 */
export function groupByCategory(
  actions: DockAction[],
  categories: DockCategory[]
): Map<string, DockAction[]> {
  const grouped = new Map<string, DockAction[]>();

  // Initialize groups in category order
  for (const cat of categories) {
    grouped.set(cat.id, []);
  }

  // Distribute actions
  for (const action of actions) {
    if (action.primary) continue; // primary is shown separately
    const group = grouped.get(action.category);
    if (group) {
      group.push(action);
    }
  }

  // Remove empty groups
  for (const [key, value] of grouped) {
    if (value.length === 0) grouped.delete(key);
  }

  return grouped;
}
