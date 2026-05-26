/**
 * @fileoverview Unit tests for the BaseRegistry class.
 *
 * Covers validation hooks, lifecycle callbacks, CRUD operations,
 * default items, and collection interface methods.
 *
 * @module @stackra/ts-support/tests/unit/base-registry
 */

import { describe, it, expect, vi } from "vitest";
import { BaseRegistry } from "@/registry";

interface TestItem {
  name: string;
  value: number;
}

describe("BaseRegistry", () => {
  // ── Basic CRUD ────────────────────────────────────────────────────────

  describe("register / get", () => {
    it("registers and retrieves an item", () => {
      const registry = new BaseRegistry<TestItem>();
      registry.register("item1", { name: "first", value: 1 });
      expect(registry.get("item1")).toEqual({ name: "first", value: 1 });
    });

    it("overwrites existing items on re-register", () => {
      const registry = new BaseRegistry<TestItem>();
      registry.register("item1", { name: "first", value: 1 });
      registry.register("item1", { name: "updated", value: 2 });
      expect(registry.get("item1")).toEqual({ name: "updated", value: 2 });
    });

    it("returns undefined for missing keys (no default)", () => {
      const registry = new BaseRegistry<TestItem>();
      expect(registry.get("missing")).toBeUndefined();
    });
  });

  describe("defaultItem", () => {
    it("returns the default item when key is missing", () => {
      const defaultItem: TestItem = { name: "default", value: 0 };
      const registry = new BaseRegistry<TestItem>({ defaultItem });
      expect(registry.get("missing")).toEqual(defaultItem);
    });

    it("returns the actual item when key exists (not default)", () => {
      const defaultItem: TestItem = { name: "default", value: 0 };
      const registry = new BaseRegistry<TestItem>({ defaultItem });
      registry.register("real", { name: "real", value: 42 });
      expect(registry.get("real")).toEqual({ name: "real", value: 42 });
    });
  });

  // ── Validation ────────────────────────────────────────────────────────

  describe("validateBeforeAdd", () => {
    it("allows registration when validation passes", () => {
      const registry = new BaseRegistry<TestItem>({
        validateBeforeAdd: (_key, item) => ({
          valid: item.value > 0,
          error: "Value must be positive",
        }),
      });

      registry.register("good", { name: "good", value: 5 });
      expect(registry.get("good")).toEqual({ name: "good", value: 5 });
    });

    it("throws when validation fails", () => {
      const registry = new BaseRegistry<TestItem>({
        validateBeforeAdd: (_key, item) => ({
          valid: item.value > 0,
          error: "Value must be positive",
        }),
      });

      expect(() => registry.register("bad", { name: "bad", value: -1 })).toThrow(
        'Validation failed for key "bad": Value must be positive',
      );
    });

    it("throws with default error when no error message provided", () => {
      const registry = new BaseRegistry<TestItem>({
        validateBeforeAdd: () => ({ valid: false }),
      });

      expect(() => registry.register("x", { name: "x", value: 1 })).toThrow("Unknown error");
    });

    it("does not add the item when validation fails", () => {
      const registry = new BaseRegistry<TestItem>({
        validateBeforeAdd: () => ({ valid: false, error: "nope" }),
      });

      try {
        registry.register("x", { name: "x", value: 1 });
      } catch {
        // expected
      }

      expect(registry.has("x")).toBe(false);
    });
  });

  // ── afterAdd hook ─────────────────────────────────────────────────────

  describe("afterAdd", () => {
    it("calls afterAdd hook on successful registration", () => {
      const afterAdd = vi.fn();
      const registry = new BaseRegistry<TestItem>({ afterAdd });

      const item: TestItem = { name: "test", value: 1 };
      registry.register("key", item);

      expect(afterAdd).toHaveBeenCalledWith("key", item);
    });

    it("does not call afterAdd when validation fails", () => {
      const afterAdd = vi.fn();
      const registry = new BaseRegistry<TestItem>({
        validateBeforeAdd: () => ({ valid: false, error: "fail" }),
        afterAdd,
      });

      try {
        registry.register("key", { name: "test", value: 1 });
      } catch {
        // expected
      }

      expect(afterAdd).not.toHaveBeenCalled();
    });
  });

  // ── add (ICollection interface) ───────────────────────────────────────

  describe("add", () => {
    it("delegates to register (hooks still fire)", () => {
      const afterAdd = vi.fn();
      const registry = new BaseRegistry<TestItem>({ afterAdd });

      registry.add("key", { name: "test", value: 1 });
      expect(afterAdd).toHaveBeenCalled();
      expect(registry.get("key")).toEqual({ name: "test", value: 1 });
    });
  });

  // ── has / remove / clear / size / isEmpty ─────────────────────────────

  describe("has", () => {
    it("returns true for existing keys", () => {
      const registry = new BaseRegistry<string>();
      registry.register("a", "value");
      expect(registry.has("a")).toBe(true);
    });

    it("returns false for missing keys", () => {
      const registry = new BaseRegistry<string>();
      expect(registry.has("missing")).toBe(false);
    });
  });

  describe("remove", () => {
    it("removes an existing item", () => {
      const registry = new BaseRegistry<string>();
      registry.register("a", "value");
      expect(registry.remove("a")).toBe(true);
      expect(registry.has("a")).toBe(false);
    });

    it("returns false for non-existing key", () => {
      const registry = new BaseRegistry<string>();
      expect(registry.remove("missing")).toBe(false);
    });
  });

  describe("clear", () => {
    it("removes all items", () => {
      const registry = new BaseRegistry<string>();
      registry.register("a", "1");
      registry.register("b", "2");
      registry.clear();
      expect(registry.size()).toBe(0);
      expect(registry.isEmpty()).toBe(true);
    });
  });

  describe("size", () => {
    it("returns the number of items", () => {
      const registry = new BaseRegistry<string>();
      expect(registry.size()).toBe(0);
      registry.register("a", "1");
      expect(registry.size()).toBe(1);
      registry.register("b", "2");
      expect(registry.size()).toBe(2);
    });
  });

  describe("isEmpty", () => {
    it("returns true when empty", () => {
      expect(new BaseRegistry<string>().isEmpty()).toBe(true);
    });

    it("returns false when not empty", () => {
      const registry = new BaseRegistry<string>();
      registry.register("a", "1");
      expect(registry.isEmpty()).toBe(false);
    });
  });

  // ── getAll / getKeys / getAsRecord ────────────────────────────────────

  describe("getAll", () => {
    it("returns all values", () => {
      const registry = new BaseRegistry<string>();
      registry.register("a", "1");
      registry.register("b", "2");
      expect(registry.getAll()).toEqual(["1", "2"]);
    });
  });

  describe("getKeys", () => {
    it("returns all keys", () => {
      const registry = new BaseRegistry<string>();
      registry.register("a", "1");
      registry.register("b", "2");
      expect(registry.getKeys()).toEqual(["a", "b"]);
    });
  });

  describe("getAsRecord", () => {
    it("returns a plain object", () => {
      const registry = new BaseRegistry<string>();
      registry.register("a", "1");
      registry.register("b", "2");
      expect(registry.getAsRecord()).toEqual({ a: "1", b: "2" });
    });
  });

  // ── forEach / map / filter / find ─────────────────────────────────────

  describe("forEach", () => {
    it("iterates over all entries", () => {
      const registry = new BaseRegistry<number>();
      registry.register("a", 1);
      registry.register("b", 2);

      const entries: [string, number][] = [];
      registry.forEach((value, key) => entries.push([key, value]));

      expect(entries).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });
  });

  describe("map", () => {
    it("maps entries to new values", () => {
      const registry = new BaseRegistry<number>();
      registry.register("a", 1);
      registry.register("b", 2);

      const result = registry.map((value, key) => `${key}:${value}`);
      expect(result).toEqual(["a:1", "b:2"]);
    });
  });

  describe("filter", () => {
    it("filters entries by predicate", () => {
      const registry = new BaseRegistry<number>();
      registry.register("a", 1);
      registry.register("b", 2);
      registry.register("c", 3);

      const result = registry.filter((value) => value > 1);
      expect(result).toEqual([2, 3]);
    });
  });

  describe("find", () => {
    it("finds the first matching entry", () => {
      const registry = new BaseRegistry<number>();
      registry.register("a", 1);
      registry.register("b", 2);
      registry.register("c", 3);

      expect(registry.find((value) => value > 1)).toBe(2);
    });

    it("returns undefined when no match", () => {
      const registry = new BaseRegistry<number>();
      registry.register("a", 1);
      expect(registry.find((value) => value > 10)).toBeUndefined();
    });
  });
});
