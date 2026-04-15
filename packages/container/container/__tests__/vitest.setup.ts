/**
 * @fileoverview Vitest setup file for @abdokouta/ts-container package
 *
 * @module @abdokouta/ts-container
 * @category Configuration
 */

import { vi } from 'vitest';

vi.mock('inversiland', async () => {
  const actual = await vi.importActual('inversiland');
  return {
    ...actual,
    Injectable: () => (target: any) => target,
    Inject: () => (_target: any, _propertyKey: string, _parameterIndex: number) => {},
    Module: (_metadata: any) => (target: any) => target,
  };
});
