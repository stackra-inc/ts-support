/**
 * Performance Utilities
 *
 * Helper functions for optimizing performance, including
 * debouncing and throttling.
 *
 * @module utils/performance
 */

/**
 * Debounce function
 *
 * Creates a debounced function that delays invoking the provided function
 * until after the specified delay has elapsed since the last time it was invoked.
 *
 * Useful for expensive operations like API calls, search inputs, or resize handlers.
 *
 * @example
 * ```tsx
 * const handleSearch = debounce((query: string) => {
 *   // API call
 *   fetchResults(query);
 * }, 300);
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function
 *
 * Creates a throttled function that only invokes the provided function
 * at most once per specified time period.
 *
 * Useful for rate-limiting expensive operations like scroll handlers
 * or mouse move events.
 *
 * @example
 * ```tsx
 * const handleScroll = throttle(() => {
 *   // Update scroll position
 *   updateScrollPosition();
 * }, 100);
 *
 * window.addEventListener('scroll', handleScroll);
 * ```
 *
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
