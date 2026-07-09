/**
 * Helper utilities for standardizing sorting across the application.
 */

/**
 * Sorts an array of strings alphabetically, case-insensitive, with natural numeric sorting.
 */
export function sortAlphabetically(arr: string[]): string[] {
  return [...arr].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * Removes duplicates and sorts an array of strings alphabetically.
 */
export function sortUniqueAlphabetically(arr: (string | null | undefined)[]): string[] {
  const unique = Array.from(new Set(arr.filter((item): item is string => Boolean(item))));
  return sortAlphabetically(unique);
}

/**
 * Sorts an array of objects based on a specific string property alphabetically.
 */
export function sortObjectsAlphabetically<T>(arr: T[], key: keyof T): T[] {
  return [...arr].sort((a, b) => {
    const valA = String(a[key] || '');
    const valB = String(b[key] || '');
    return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Custom specific order for Item Conditions.
 */
const CONDITION_ORDER = [
  'Mint',
  'Near Mint',
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Played',
  'Poor',
  'Damaged'
];

/**
 * Sorts an array of conditions based on the strict custom order.
 */
export function sortConditions(arr: string[]): string[] {
  return [...arr].sort((a, b) => {
    const indexA = CONDITION_ORDER.indexOf(a);
    const indexB = CONDITION_ORDER.indexOf(b);
    // If not found in the custom array, push to bottom and sort alphabetically
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

/**
 * Custom specific order for Availability.
 */
const AVAILABILITY_ORDER = [
  'Available',
  'Reserved',
  'Sold',
  'Archived'
];

/**
 * Sorts an array of availability statuses based on the strict custom order.
 */
export function sortAvailability(arr: string[]): string[] {
  return [...arr].sort((a, b) => {
    const indexA = AVAILABILITY_ORDER.indexOf(a);
    const indexB = AVAILABILITY_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

/**
 * Custom specific order for Status (Blog/Content).
 */
const STATUS_ORDER = [
  'Draft',
  'Published',
  'Archived'
];

/**
 * Sorts an array of statuses based on the strict custom order.
 */
export function sortStatus(arr: string[]): string[] {
  return [...arr].sort((a, b) => {
    const indexA = STATUS_ORDER.indexOf(a);
    const indexB = STATUS_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}
