/**
 * @fileoverview Validation result interface for registry operations.
 *
 * @module @stackra/ts-support
 * @category Interfaces
 */

/**
 * Validation result for registry operations
 *
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   valid: false,
 *   error: 'Item name cannot be empty'
 * };
 * ```
 */
export interface ValidationResult {
  /**
   * Whether the validation passed
   */
  valid: boolean;

  /**
   * Error message if validation failed
   */
  error?: string;
}
