/**
 * @fileoverview Laravel-style number utility class.
 *
 * Provides static methods for common number operations: formatting,
 * clamping, abbreviation, ordinals, percentages, and more.
 *
 * ## Laravel Parity
 *
 * | Laravel                                  | Stackra                                  |
 * |------------------------------------------|------------------------------------------|
 * | `Number::format(1234567.89)`             | `Num.format(1234567.89)`                 |
 * | `Number::abbreviate(1_000_000)`          | `Num.abbreviate(1_000_000)`              |
 * | `Number::ordinal(1)`                     | `Num.ordinal(1)`                         |
 * | `Number::percentage(75.5)`               | `Num.percentage(75.5)`                   |
 * | `Number::currency(1234.56, 'USD')`       | `Num.currency(1234.56, 'USD')`           |
 * | `Number::fileSize(1024)`                 | `Num.fileSize(1024)`                     |
 * | `Number::forHumans(1234567)`             | `Num.forHumans(1234567)`                 |
 * | `Number::clamp(5, 1, 10)`               | `Num.clamp(5, 1, 10)`                   |
 *
 * @module num/num
 * @category Numbers
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Abbreviation suffixes for large numbers.
 * Used by `abbreviate()` and `forHumans()`.
 */
const ABBREVIATIONS: Array<{ threshold: number; suffix: string; divisor: number }> = [
  { threshold: 1e15, suffix: "Q", divisor: 1e15 },
  { threshold: 1e12, suffix: "T", divisor: 1e12 },
  { threshold: 1e9, suffix: "B", divisor: 1e9 },
  { threshold: 1e6, suffix: "M", divisor: 1e6 },
  { threshold: 1e3, suffix: "K", divisor: 1e3 },
];

/**
 * File size units in ascending order.
 * Used by `fileSize()`.
 */
const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

// ============================================================================
// Num Class
// ============================================================================

/**
 * Laravel-style number utility class.
 *
 * All methods are static and pure — no side effects, no mutations.
 *
 * @example
 * ```typescript
 * import { Num } from '@stackra/ts-support';
 *
 * Num.format(1234567.89);           // '1,234,567.89'
 * Num.abbreviate(1_500_000);        // '1.5M'
 * Num.ordinal(3);                   // '3rd'
 * Num.percentage(75.5);             // '75.50%'
 * Num.currency(49.99, 'USD');       // '$49.99'
 * Num.fileSize(1536);               // '1.50 KB'
 * Num.clamp(15, 1, 10);            // 10
 * ```
 */
export class Num {
  // ── Formatting ──────────────────────────────────────────────────────────

  /**
   * Format a number with grouped thousands and decimal places.
   *
   * Uses `Intl.NumberFormat` for locale-aware formatting.
   *
   * @param value    - The number to format
   * @param decimals - Number of decimal places (default: `0`)
   * @param locale   - BCP 47 locale string (default: `'en-US'`)
   * @returns The formatted number string
   *
   * @example
   * ```typescript
   * Num.format(1234567.89);        // '1,234,568'
   * Num.format(1234567.89, 2);     // '1,234,567.89'
   * Num.format(1234.5, 2, 'de');   // '1.234,50'
   * ```
   */
  static format(value: number, decimals: number = 0, locale: string = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Abbreviate a number with a suffix (K, M, B, T, Q).
   *
   * @param value     - The number to abbreviate
   * @param precision - Decimal places in the abbreviated form (default: `0`)
   * @returns The abbreviated string
   *
   * @example
   * ```typescript
   * Num.abbreviate(1_000);         // '1K'
   * Num.abbreviate(1_500_000, 1);  // '1.5M'
   * Num.abbreviate(999);           // '999'
   * ```
   */
  static abbreviate(value: number, precision: number = 0): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    for (const { threshold, suffix, divisor } of ABBREVIATIONS) {
      if (absValue >= threshold) {
        const abbreviated = absValue / divisor;
        return sign + abbreviated.toFixed(precision) + suffix;
      }
    }

    return sign + absValue.toString();
  }

  /**
   * Format a number as a human-readable string with word suffixes.
   *
   * Similar to `abbreviate()` but uses full words: thousand, million, etc.
   *
   * @param value     - The number to format
   * @param precision - Decimal places (default: `0`)
   * @returns The human-readable string
   *
   * @example
   * ```typescript
   * Num.forHumans(1_000);         // '1 thousand'
   * Num.forHumans(1_500_000, 1);  // '1.5 million'
   * Num.forHumans(2_300_000_000); // '2 billion'
   * ```
   */
  static forHumans(value: number, precision: number = 0): string {
    const words: Record<string, string> = {
      K: "thousand",
      M: "million",
      B: "billion",
      T: "trillion",
      Q: "quadrillion",
    };

    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    for (const { threshold, suffix, divisor } of ABBREVIATIONS) {
      if (absValue >= threshold) {
        const abbreviated = absValue / divisor;
        return sign + abbreviated.toFixed(precision) + " " + words[suffix];
      }
    }

    return sign + absValue.toString();
  }

  /**
   * Get the ordinal suffix for a number (1st, 2nd, 3rd, 4th, ...).
   *
   * @param value - The number
   * @returns The number with its ordinal suffix
   *
   * @example
   * ```typescript
   * Num.ordinal(1);   // '1st'
   * Num.ordinal(2);   // '2nd'
   * Num.ordinal(3);   // '3rd'
   * Num.ordinal(11);  // '11th'
   * Num.ordinal(21);  // '21st'
   * ```
   */
  static ordinal(value: number): string {
    const abs = Math.abs(value);
    const lastTwo = abs % 100;
    const lastOne = abs % 10;

    /* 11th, 12th, 13th are special cases */
    if (lastTwo >= 11 && lastTwo <= 13) {
      return value + "th";
    }

    switch (lastOne) {
      case 1:
        return value + "st";
      case 2:
        return value + "nd";
      case 3:
        return value + "rd";
      default:
        return value + "th";
    }
  }

  /**
   * Format a number as a percentage.
   *
   * @param value     - The number (e.g., `75.5` for 75.50%)
   * @param precision - Decimal places (default: `2`)
   * @param locale    - BCP 47 locale string (default: `'en-US'`)
   * @returns The formatted percentage string
   *
   * @example
   * ```typescript
   * Num.percentage(75.5);       // '75.50%'
   * Num.percentage(100, 0);     // '100%'
   * Num.percentage(0.5, 1);     // '0.5%'
   * ```
   */
  static percentage(value: number, precision: number = 2, locale: string = "en-US"): string {
    return (
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(value) + "%"
    );
  }

  /**
   * Format a number as currency.
   *
   * Uses `Intl.NumberFormat` with `style: 'currency'` for locale-aware
   * currency formatting.
   *
   * @param value    - The amount
   * @param currency - ISO 4217 currency code (default: `'USD'`)
   * @param locale   - BCP 47 locale string (default: `'en-US'`)
   * @returns The formatted currency string
   *
   * @example
   * ```typescript
   * Num.currency(49.99);                // '$49.99'
   * Num.currency(1234.56, 'EUR', 'de'); // '1.234,56 €'
   * Num.currency(99, 'GBP');            // '£99.00'
   * ```
   */
  static currency(value: number, currency: string = "USD", locale: string = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  }

  /**
   * Format a byte count as a human-readable file size.
   *
   * @param bytes     - The byte count
   * @param precision - Decimal places (default: `2`)
   * @returns The formatted file size string
   *
   * @example
   * ```typescript
   * Num.fileSize(0);            // '0 B'
   * Num.fileSize(1024);         // '1.00 KB'
   * Num.fileSize(1536);         // '1.50 KB'
   * Num.fileSize(1_073_741_824); // '1.00 GB'
   * ```
   */
  static fileSize(bytes: number, precision: number = 2): string {
    if (bytes === 0) return "0 B";

    const absBytes = Math.abs(bytes);
    const sign = bytes < 0 ? "-" : "";
    const exponent = Math.min(
      Math.floor(Math.log(absBytes) / Math.log(1024)),
      FILE_SIZE_UNITS.length - 1,
    );
    const size = absBytes / Math.pow(1024, exponent);

    return sign + size.toFixed(precision) + " " + FILE_SIZE_UNITS[exponent];
  }

  // ── Math Helpers ────────────────────────────────────────────────────────

  /**
   * Clamp a number between a minimum and maximum value.
   *
   * @param value - The number to clamp
   * @param min   - Minimum allowed value
   * @param max   - Maximum allowed value
   * @returns The clamped value
   *
   * @example
   * ```typescript
   * Num.clamp(5, 1, 10);   // 5
   * Num.clamp(-5, 1, 10);  // 1
   * Num.clamp(15, 1, 10);  // 10
   * ```
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generate a random integer between min and max (inclusive).
   *
   * @param min - Minimum value (default: `0`)
   * @param max - Maximum value (default: `100`)
   * @returns A random integer in the range [min, max]
   *
   * @example
   * ```typescript
   * Num.random(1, 10);  // e.g., 7
   * Num.random();       // e.g., 42 (0–100)
   * ```
   */
  static random(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ── Inspection ──────────────────────────────────────────────────────────

  /**
   * Determine if a value is a valid, finite number.
   *
   * Returns `false` for `NaN`, `Infinity`, `-Infinity`, and non-number types.
   *
   * @param value - The value to check
   * @returns `true` if the value is a finite number
   *
   * @example
   * ```typescript
   * Num.isNumber(42);        // true
   * Num.isNumber(3.14);      // true
   * Num.isNumber(NaN);       // false
   * Num.isNumber(Infinity);  // false
   * Num.isNumber('42');      // false
   * ```
   */
  static isNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
  }

  /**
   * Determine if a value is an integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is an integer
   *
   * @example
   * ```typescript
   * Num.isInteger(42);    // true
   * Num.isInteger(3.14);  // false
   * ```
   */
  static isInteger(value: unknown): value is number {
    return Number.isInteger(value);
  }

  /**
   * Determine if a number is even.
   *
   * @param value - The number to check
   * @returns `true` if the number is even
   */
  static isEven(value: number): boolean {
    return value % 2 === 0;
  }

  /**
   * Determine if a number is odd.
   *
   * @param value - The number to check
   * @returns `true` if the number is odd
   */
  static isOdd(value: number): boolean {
    return value % 2 !== 0;
  }

  /**
   * Determine if a number is positive (greater than zero).
   *
   * @param value - The number to check
   * @returns `true` if the number is positive
   */
  static isPositive(value: number): boolean {
    return value > 0;
  }

  /**
   * Determine if a number is negative (less than zero).
   *
   * @param value - The number to check
   * @returns `true` if the number is negative
   */
  static isNegative(value: number): boolean {
    return value < 0;
  }

  /**
   * Determine if a number falls within a range (inclusive).
   *
   * @param value - The number to check
   * @param min   - Range minimum
   * @param max   - Range maximum
   * @returns `true` if min ≤ value ≤ max
   *
   * @example
   * ```typescript
   * Num.between(5, 1, 10);   // true
   * Num.between(0, 1, 10);   // false
   * Num.between(10, 1, 10);  // true
   * ```
   */
  static between(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
}
