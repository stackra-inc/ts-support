/**
 * @fileoverview Vitest setup file for @abdokouta/config package
 *
 * This file configures the testing environment before running tests.
 * It sets up container mocking for dependency injection tests.
 *
 * Setup Features:
 * - Container mocking for DI tests
 *
 * @module @abdokouta/config
 * @category Configuration
 */

import { vi } from 'vitest';

/**
 * Mock @abdokouta/ts-container decorators
 *
 * This ensures that decorator metadata doesn't interfere with tests
 * and allows us to test module behavior in isolation.
 */
vi.mock('@abdokouta/ts-container', () => {
  return {
    Injectable: () => (target: any) => target,
    Inject: () => (_target: any, _propertyKey: string, _parameterIndex: number) => {},
    Module: (_metadata: any) => (target: any) => target,
    DynamicModule: class {},
  };
});
