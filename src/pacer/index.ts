/**
 * Pacer — Timing Control Utilities
 *
 * Re-exports from `@tanstack/pacer` for debouncing, throttling,
 * rate limiting, and queuing function execution.
 *
 * These are framework-agnostic utilities that work in any environment.
 * For React-specific hooks, use `@tanstack/react-pacer` directly.
 *
 * @module @stackra/ts-support/pacer
 *
 * @example
 * ```typescript
 * import { Throttler, Debouncer, RateLimiter, Queue } from "@stackra/ts-support";
 *
 * // Throttle API calls to max 1 per second
 * const throttled = new Throttler(fetchData, { wait: 1000 });
 * throttled.maybeExecute(params);
 *
 * // Debounce search input
 * const debounced = new Debouncer(search, { wait: 300 });
 * debounced.maybeExecute(query);
 *
 * // Rate limit to 10 requests per minute
 * const limiter = new RateLimiter(sendRequest, {
 *   limit: 10,
 *   window: 60_000,
 * });
 * limiter.maybeExecute(payload);
 * ```
 */
export {
  Throttler,
  Debouncer,
  RateLimiter,
  Queuer,
  AsyncThrottler,
  AsyncDebouncer,
  AsyncRateLimiter,
  AsyncQueuer,
  throttle,
  debounce,
  rateLimit,
  queue,
  asyncThrottle,
  asyncDebounce,
  asyncRateLimit,
  asyncQueue,
} from "@tanstack/pacer";
