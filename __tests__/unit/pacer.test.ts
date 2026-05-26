/**
 * Pacer Tests
 *
 * Tests timing control utilities: throttle, debounce, rate limiting.
 * These are re-exported from the pacer module.
 *
 * @module __tests__/unit/pacer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle, debounce } from "@/pacer";

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Pacer — Timing Control", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("throttle()", () => {
    it("should execute immediately on first call", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100 });

      throttled();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should not execute again within the throttle window", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100, trailing: false });

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should execute again after the throttle window", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100 });

      throttled();
      vi.advanceTimersByTime(101);
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should pass arguments to the throttled function", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100 });

      throttled("hello", 42);

      expect(fn).toHaveBeenCalledWith("hello", 42);
    });
  });

  describe("debounce()", () => {
    it("should not execute immediately", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced();

      expect(fn).not.toHaveBeenCalled();
    });

    it("should execute after the delay", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced();
      vi.advanceTimersByTime(101);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on subsequent calls", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced();
      vi.advanceTimersByTime(50);
      debounced(); // Reset timer

      // After reset, fn should not have been called yet
      expect(fn).not.toHaveBeenCalled();

      // Advance past the new wait window
      vi.advanceTimersByTime(101);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should only execute once for rapid calls", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced();
      debounced();
      debounced();
      debounced();
      debounced();

      vi.advanceTimersByTime(101);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should pass the latest arguments", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced("first");
      debounced("second");
      debounced("third");

      vi.advanceTimersByTime(101);

      expect(fn).toHaveBeenCalledWith("third");
    });
  });
});
