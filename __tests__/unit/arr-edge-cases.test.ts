/**
 * Arr Edge Cases Tests
 *
 * Tests edge cases and boundary conditions for Arr utility methods:
 * deep nesting, empty inputs, type coercion, large arrays.
 *
 * @module __tests__/unit/arr-edge-cases
 */

import { describe, it, expect } from "vitest";
import { Arr } from "@/arr";

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Arr — Edge Cases", () => {
  describe("get() — Deep Access", () => {
    it("should access deeply nested values (5+ levels)", () => {
      const obj = { a: { b: { c: { d: { e: { f: "deep" } } } } } };
      expect(Arr.get(obj, "a.b.c.d.e.f")).toBe("deep");
    });

    it("should return fallback for partially existing paths", () => {
      const obj = { a: { b: { c: 1 } } };
      expect(Arr.get(obj, "a.b.c.d.e", "fallback")).toBe("fallback");
    });

    it("should handle array index access via dot notation", () => {
      const obj = { items: ["zero", "one", "two"] };
      expect(Arr.get(obj, "items.1")).toBe("one");
    });

    it("should handle null values in path", () => {
      const obj = { a: { b: null } };
      expect(Arr.get(obj, "a.b.c", "default")).toBe("default");
    });

    it("should handle undefined values in path", () => {
      const obj = { a: { b: undefined } };
      expect(Arr.get(obj, "a.b.c", "default")).toBe("default");
    });

    it("should return 0 and false without using fallback", () => {
      const obj = { zero: 0, falsy: false, empty: "" };
      expect(Arr.get(obj, "zero", "fallback")).toBe(0);
      expect(Arr.get(obj, "falsy", "fallback")).toBe(false);
      expect(Arr.get(obj, "empty", "fallback")).toBe("");
    });
  });

  describe("set() — Deep Setting", () => {
    it("should create nested structure when setting deep path", () => {
      const obj = {};
      const result = Arr.set(obj, "a.b.c", "value");
      expect((result as any).a.b.c).toBe("value");
    });

    it("should overwrite existing values", () => {
      const obj = { a: { b: "old" } };
      const result = Arr.set(obj, "a.b", "new");
      expect(result.a.b).toBe("new");
    });

    it("should handle setting on arrays", () => {
      const obj = { items: ["a", "b", "c"] };
      const result = Arr.set(obj, "items.1", "B");
      expect(result.items[1]).toBe("B");
    });
  });

  describe("has() — Existence Check", () => {
    it("should check single key existence", () => {
      const obj = { a: { b: 1 } };
      expect(Arr.has(obj, "a.b")).toBe(true);
      expect(Arr.has(obj, "a.c")).toBe(false);
    });

    it("should check multiple keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Arr.has(obj, ["a", "b"])).toBe(true);
      expect(Arr.has(obj, ["a", "d"])).toBe(false);
    });

    it("should return true for null/undefined values (key exists)", () => {
      const obj = { a: null, b: undefined };
      expect(Arr.has(obj, "a")).toBe(true);
    });
  });

  describe("forget() — Key Removal", () => {
    it("should remove a nested key", () => {
      const obj = { a: { b: 1, c: 2 } };
      const result = Arr.forget(obj, "a.b");
      expect(result.a).toEqual({ c: 2 });
    });

    it("should handle removing non-existent keys gracefully", () => {
      const obj = { a: 1 };
      expect(() => Arr.forget(obj, "b.c.d")).not.toThrow();
    });

    it("should remove multiple keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = Arr.forget(obj, ["a", "c"]);
      expect(result).toEqual({ b: 2 });
    });
  });

  describe("only() / except()", () => {
    it("only: should pick specified keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(Arr.only(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
    });

    it("only: should handle missing keys gracefully", () => {
      const obj = { a: 1, b: 2 };
      expect(Arr.only(obj, ["a", "z"])).toEqual({ a: 1 });
    });

    it("except: should exclude specified keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Arr.except(obj, ["b"])).toEqual({ a: 1, c: 3 });
    });

    it("except: should handle missing keys gracefully", () => {
      const obj = { a: 1, b: 2 };
      expect(Arr.except(obj, ["z"])).toEqual({ a: 1, b: 2 });
    });
  });

  describe("pluck() — Value Extraction", () => {
    it("should pluck values from array of objects", () => {
      const items = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];
      expect(Arr.pluck(items, "name")).toEqual(["Alice", "Bob", "Charlie"]);
    });

    it("should pluck nested values", () => {
      const items = [{ user: { name: "Alice" } }, { user: { name: "Bob" } }];
      expect(Arr.pluck(items, "user.name")).toEqual(["Alice", "Bob"]);
    });

    it("should handle missing keys in some items", () => {
      const items = [{ name: "Alice" }, { age: 30 }, { name: "Charlie" }];
      const result = Arr.pluck(items, "name");
      expect(result).toContain("Alice");
      expect(result).toContain("Charlie");
    });
  });

  describe("groupBy() / keyBy()", () => {
    it("groupBy: should group items by key value", () => {
      const items = [
        { type: "fruit", name: "apple" },
        { type: "veggie", name: "carrot" },
        { type: "fruit", name: "banana" },
      ];
      const grouped = Arr.groupBy(items, "type");
      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.veggie).toHaveLength(1);
    });

    it("keyBy: should key items by specified field", () => {
      const items = [
        { id: "a", name: "Alice" },
        { id: "b", name: "Bob" },
      ];
      const keyed = Arr.keyBy(items, "id");
      expect(keyed.a.name).toBe("Alice");
      expect(keyed.b.name).toBe("Bob");
    });
  });

  describe("first() / last()", () => {
    it("first: should return first element", () => {
      expect(Arr.first([1, 2, 3])).toBe(1);
    });

    it("first: should return first matching element with predicate", () => {
      expect(Arr.first([1, 2, 3, 4], (n) => n > 2)).toBe(3);
    });

    it("first: should return undefined for empty array", () => {
      expect(Arr.first([])).toBeUndefined();
    });

    it("last: should return last element", () => {
      expect(Arr.last([1, 2, 3])).toBe(3);
    });

    it("last: should return last matching element with predicate", () => {
      expect(Arr.last([1, 2, 3, 4], (n) => n < 3)).toBe(2);
    });
  });

  describe("flatten()", () => {
    it("should flatten nested arrays", () => {
      expect(Arr.flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it("should flatten deeply nested arrays", () => {
      expect(Arr.flatten([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5]);
    });

    it("should respect depth parameter", () => {
      expect(Arr.flatten([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]);
    });

    it("should handle empty arrays", () => {
      expect(Arr.flatten([])).toEqual([]);
    });
  });

  describe("chunk()", () => {
    it("should split array into chunks", () => {
      expect(Arr.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("should handle chunk size larger than array", () => {
      expect(Arr.chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it("should handle chunk size of 1", () => {
      expect(Arr.chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it("should handle empty array", () => {
      expect(Arr.chunk([], 3)).toEqual([]);
    });
  });

  describe("unique()", () => {
    it("should remove duplicate primitives", () => {
      expect(Arr.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it("should remove duplicates by key", () => {
      const items = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 1, name: "Alice Duplicate" },
      ];
      expect(Arr.unique(items, "id")).toHaveLength(2);
    });
  });

  describe("wrap()", () => {
    it("should wrap non-array value in array", () => {
      expect(Arr.wrap("hello")).toEqual(["hello"]);
    });

    it("should return array as-is", () => {
      expect(Arr.wrap([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("should return empty array for null", () => {
      expect(Arr.wrap(null)).toEqual([]);
    });

    it("should return empty array for undefined", () => {
      expect(Arr.wrap(undefined)).toEqual([]);
    });
  });

  describe("sortBy()", () => {
    it("should sort by string key", () => {
      const items = [
        { name: "Charlie", age: 30 },
        { name: "Alice", age: 25 },
        { name: "Bob", age: 28 },
      ];
      const sorted = Arr.sortBy(items, "name");
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Bob");
      expect(sorted[2].name).toBe("Charlie");
    });

    it("should sort by numeric key", () => {
      const items = [
        { name: "A", priority: 3 },
        { name: "B", priority: 1 },
        { name: "C", priority: 2 },
      ];
      const sorted = Arr.sortBy(items, "priority");
      expect(sorted[0].name).toBe("B");
      expect(sorted[1].name).toBe("C");
      expect(sorted[2].name).toBe("A");
    });

    it("should not mutate original array", () => {
      const items = [{ v: 3 }, { v: 1 }, { v: 2 }];
      const sorted = Arr.sortBy(items, "v");
      expect(items[0].v).toBe(3); // Original unchanged
      expect(sorted[0].v).toBe(1);
    });
  });

  describe("combine()", () => {
    it("should combine keys and values arrays", () => {
      expect(Arr.combine(["a", "b", "c"], [1, 2, 3])).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should handle mismatched lengths (extra keys)", () => {
      const result = Arr.combine(["a", "b", "c"], [1, 2]);
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });
  });

  describe("Type Guards", () => {
    it("isArray: should detect arrays", () => {
      expect(Arr.isArray([])).toBe(true);
      expect(Arr.isArray([1, 2, 3])).toBe(true);
      expect(Arr.isArray("not array")).toBe(false);
      expect(Arr.isArray({})).toBe(false);
      expect(Arr.isArray(null)).toBe(false);
    });

    it("isObject: should detect plain objects", () => {
      expect(Arr.isObject({})).toBe(true);
      expect(Arr.isObject({ a: 1 })).toBe(true);
      expect(Arr.isObject([])).toBe(false);
      expect(Arr.isObject(null)).toBe(false);
      expect(Arr.isObject("string")).toBe(false);
    });
  });
});
