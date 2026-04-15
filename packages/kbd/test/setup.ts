/**
 * Test setup file for vitest
 *
 * This file is automatically loaded before running tests.
 * It configures the testing environment and imports necessary utilities.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Cleanup after each test to prevent memory leaks and test pollution
 */
afterEach(() => {
  cleanup();
});
