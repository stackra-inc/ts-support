/**
 * Class Name Utilities
 *
 * Utilities for conditionally joining class names together.
 *
 * @module utils/cn
 */

/**
 * Type for class name values
 */
type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Conditionally join class names together
 *
 * A simple utility for combining class names. Filters out falsy values
 * and flattens arrays.
 *
 * @example
 * ```tsx
 * clsx('btn', isActive && 'btn-active', ['btn-primary', 'btn-lg'])
 * // Returns: 'btn btn-active btn-primary btn-lg'
 * ```
 *
 * @param classes - Class names to combine
 * @returns Combined class name string
 */
export function clsx(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter((x) => typeof x === 'string' && x.length > 0)
    .join(' ');
}

/**
 * Alias for clsx with better naming for Tailwind usage
 *
 * Commonly used pattern in Tailwind projects for combining
 * conditional class names.
 *
 * @example
 * ```tsx
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   isPrimary ? 'primary-class' : 'secondary-class'
 * )}>
 * ```
 *
 * @param classes - Class names to combine
 * @returns Combined class name string
 */
export function cn(...classes: ClassValue[]): string {
  return clsx(...classes);
}
