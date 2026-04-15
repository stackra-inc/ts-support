/**
 * @fileoverview Vitest setup file for @abdokouta/kbd package
 *
 * This file configures the testing environment before running tests.
 * It extends Vitest's expect with jest-dom matchers and sets up cleanup.
 *
 * Setup Features:
 * - Jest-DOM Matchers: Adds custom matchers like toBeInTheDocument()
 * - Automatic Cleanup: Cleans up DOM after each test
 *
 * @module @abdokouta/kbd
 * @category Configuration
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/**
 * Cleanup after each test
 *
 * This ensures that the DOM is cleaned up after each test,
 * preventing test pollution and ensuring test isolation.
 */
afterEach(() => {
  cleanup();
});
