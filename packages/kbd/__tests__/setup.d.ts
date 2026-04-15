/**
 * Type declarations for jest-dom matchers in Vitest
 */

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

/**
 * Extend Vitest's Assertion interface with jest-dom matchers
 *
 * This allows TypeScript to recognize custom matchers like:
 * - toBeInTheDocument()
 * - toHaveTextContent()
 * - toHaveAttribute()
 * - And many more...
 */
declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
