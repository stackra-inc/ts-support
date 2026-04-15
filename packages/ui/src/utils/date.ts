/**
 * Date Utilities
 *
 * Helper functions for formatting and manipulating dates.
 *
 * @module utils/date
 */

/**
 * Format a date using Intl.DateTimeFormat
 *
 * Provides consistent date formatting across the application.
 *
 * @example
 * ```tsx
 * formatDate(new Date(), 'en-US', { dateStyle: 'long' })
 * // Returns: "January 1, 2024"
 * ```
 *
 * @param date - Date to format
 * @param locale - Locale string (e.g., 'en-US', 'fr-FR')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 *
 * Uses Intl.RelativeTimeFormat for internationalized relative time strings.
 *
 * @example
 * ```tsx
 * const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
 * formatRelativeTime(yesterday)
 * // Returns: "1 day ago"
 * ```
 *
 * @param date - Date to format
 * @param locale - Locale string
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date, locale = 'en-US'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  // Define time units in seconds
  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  // Find the appropriate unit
  for (const { unit, seconds } of units) {
    const value = Math.floor(Math.abs(diffInSeconds) / seconds);
    if (value >= 1) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      return rtf.format(diffInSeconds < 0 ? -value : value, unit);
    }
  }

  return 'just now';
}
