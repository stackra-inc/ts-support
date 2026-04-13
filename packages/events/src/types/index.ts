/**
 * @fileoverview Types Index
 * @module @pixielity/events
 */

export type { EventDriver } from './event-driver.type';
export type { DispatcherConfig } from './dispatcher-config.type';

// ── Decorator types ─────────────────────────────────────────────────────────

export interface OnEventOptions {
  priority?: number;
  once?: boolean;
  channel?: string;
}

export interface OnEventMetadata {
  event: string;
  method: string;
  options: OnEventOptions;
}
