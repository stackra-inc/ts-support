/**
 * @fileoverview Unit tests for the Arr static utility class.
 *
 * Covers dot-notation access, wildcards, structural helpers,
 * array helpers, and immutability guarantees.
 *
 * @module @stackra/ts-support/tests/unit/arr
 */

import { describe, it, expect } from "vitest";
import { Arr } from "@/arr";

describe("Arr", () => {
  // ── Dot-Notation Access ─────────────────────────────────────────────────

  describe("get", () => {
    it("gets a top-level value", () => {
      expect(Arr.get({ name: "Alice" }, "name")).toBe("Alice");
    });

    it("gets a nested value using dot notation", () => {
      const obj = { user: { address: { city: "NYC" } } };
      expect(Arr.get(obj, "user.address.city")).toBe("NYC");
    });

    it("returns fallback when path does not exist", () => {
      expect(Arr.get({ a: 1 }, "b", "default")).toBe("default");
    });

    it("returns fallback for deeply missing paths", () => {
      expect(Arr.get({ a: { b: 1 } }, "a.c.d", "nope")).toBe("nope");
    });

    it("returns undefined when no fallback and path missing", () => {
      expect(Arr.get({ a: 1 }, "b")).toBeUndefined();
    });

    it("returns the entire target when key is null", () => {
      const obj = { a: 1, b: 2 };
      expect(Arr.get(obj, null)).toEqual(obj);
    });

    it("handles wildcard plucking from arrays", () => {
      const data = { users: [{ name: "Alice" }, { name: "Bob" }] };
      expect(Arr.get(data, "users.*.name")).toEqual(["Alice", "Bob"]);
    });

    it("returns fallback when wildcard target is not an array", () => {
      expect(Arr.get({ users: "not-array" }, "users.*.name", [])).toEqual([]);
    });

    it("handles nested wildcard paths", () => {
      const data = {
        teams: [{ members: [{ name: "A" }, { name: "B" }] }, { members: [{ name: "C" }] }],
      };
      expect(Arr.get(data, "teams.*.members")).toEqual([
        [{ name: "A" }, { name: "B" }],
        [{ name: "C" }],
      ]);
    });

    it("returns value for keys containing dots when direct match exists", () => {
      const obj = { "a.b": "direct" };
      expect(Arr.get(obj, "a.b")).toBe("direct");
    });
  });

  describe("set", () => {
    it("sets a top-level value", () => {
      const result = Arr.set({} as Record<string, any>, "name", "Alice");
      expect(result.name).toBe("Alice");
    });

    it("sets a nested value using dot notation", () => {
      const result = Arr.set({} as Record<string, any>, "user.name", "Alice");
      expect(result.user.name).toBe("Alice");
    });

    it("does not mutate the original object", () => {
      const original = { a: { b: 1 } };
      const result = Arr.set(original, "a.b", 2);
      expect(original.a.b).toBe(1);
      expect(result.a.b).toBe(2);
    });

    it("creates intermediate objects", () => {
      const result = Arr.set({} as Record<string, any>, "a.b.c", "deep");
      expect(result.a.b.c).toBe("deep");
    });

    it("creates arrays for numeric segments", () => {
      const result = Arr.set({} as Record<string, any>, "items.0", "first");
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items[0]).toBe("first");
    });
  });

  describe("has", () => {
    it("returns true for existing top-level key", () => {
      expect(Arr.has({ name: "Alice" }, "name")).toBe(true);
    });

    it("returns true for existing nested key", () => {
      expect(Arr.has({ a: { b: { c: 1 } } }, "a.b.c")).toBe(true);
    });

    it("returns false for missing key", () => {
      expect(Arr.has({ a: 1 }, "b")).toBe(false);
    });

    it("returns false for partially missing nested key", () => {
      expect(Arr.has({ a: { b: 1 } }, "a.c")).toBe(false);
    });

    it("accepts an array of keys (all must exist)", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Arr.has(obj, ["a", "b"])).toBe(true);
      expect(Arr.has(obj, ["a", "d"])).toBe(false);
    });

    it("handles null/undefined intermediate values", () => {
      expect(Arr.has({ a: null }, "a.b")).toBe(false);
      expect(Arr.has({ a: undefined }, "a.b")).toBe(false);
    });
  });

  describe("forget", () => {
    it("removes a top-level key", () => {
      const result = Arr.forget({ a: 1, b: 2 }, "a");
      expect(result).toEqual({ b: 2 });
    });

    it("removes a nested key", () => {
      const result = Arr.forget({ a: { b: 1, c: 2 } }, "a.b");
      expect(result).toEqual({ a: { c: 2 } });
    });

    it("does not mutate the original", () => {
      const original = { a: 1, b: 2 };
      Arr.forget(original, "a");
      expect(original.a).toBe(1);
    });

    it("accepts an array of keys", () => {
      const result = Arr.forget({ a: 1, b: 2, c: 3 }, ["a", "c"]);
      expect(result).toEqual({ b: 2 });
    });
  });

  // ── Structural Helpers ──────────────────────────────────────────────────

  describe("only", () => {
    it("returns only the specified keys", () => {
      const obj = { id: 1, name: "Alice", email: "a@b.com", password: "x" };
      expect(Arr.only(obj, ["id", "name"])).toEqual({ id: 1, name: "Alice" });
    });

    it("ignores keys that do not exist", () => {
      expect(Arr.only({ a: 1 }, ["a", "b"])).toEqual({ a: 1 });
    });
  });

  describe("except", () => {
    it("returns the object without the specified keys", () => {
      const obj = { id: 1, name: "Alice", password: "x" };
      expect(Arr.except(obj, ["password"])).toEqual({ id: 1, name: "Alice" });
    });
  });

  describe("pluck", () => {
    it("plucks values from an array of objects", () => {
      const items = [{ name: "Alice" }, { name: "Bob" }];
      expect(Arr.pluck(items, "name")).toEqual(["Alice", "Bob"]);
    });

    it("plucks with a key for keyed result", () => {
      const items = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      expect(Arr.pluck(items, "name", "id")).toEqual({ "1": "Alice", "2": "Bob" });
    });
  });

  describe("groupBy", () => {
    it("groups items by a key", () => {
      const items = [
        { type: "fruit", name: "apple" },
        { type: "veggie", name: "carrot" },
        { type: "fruit", name: "banana" },
      ];
      const result = Arr.groupBy(items, "type");
      expect(result.fruit).toHaveLength(2);
      expect(result.veggie).toHaveLength(1);
    });
  });

  describe("keyBy", () => {
    it("keys items by a field", () => {
      const items = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const result = Arr.keyBy(items, "id");
      expect(result["1"]!.name).toBe("Alice");
      expect(result["2"]!.name).toBe("Bob");
    });
  });

  // ── Array Helpers ───────────────────────────────────────────────────────

  describe("first", () => {
    it("returns the first element without callback", () => {
      expect(Arr.first([1, 2, 3])).toBe(1);
    });

    it("returns the first matching element", () => {
      expect(Arr.first([1, 2, 3, 4], (n) => n > 2)).toBe(3);
    });

    it("returns fallback when no match", () => {
      expect(Arr.first([1, 2], (n) => n > 5, 99)).toBe(99);
    });

    it("returns fallback for empty array", () => {
      expect(Arr.first([], undefined, "default")).toBe("default");
    });
  });

  describe("last", () => {
    it("returns the last element without callback", () => {
      expect(Arr.last([1, 2, 3])).toBe(3);
    });

    it("returns the last matching element", () => {
      expect(Arr.last([1, 2, 3, 4], (n) => n < 3)).toBe(2);
    });

    it("returns fallback when no match", () => {
      expect(Arr.last([1, 2], (n) => n > 5, 99)).toBe(99);
    });
  });

  describe("flatten", () => {
    it("flattens nested arrays", () => {
      expect(
        Arr.flatten([
          [1, 2],
          [3, [4, 5]],
        ]),
      ).toEqual([1, 2, 3, 4, 5]);
    });

    it("respects depth parameter", () => {
      expect(
        Arr.flatten(
          [
            [1, [2]],
            [3, [4]],
          ],
          1,
        ),
      ).toEqual([1, [2], 3, [4]]);
    });
  });

  describe("wrap", () => {
    it("wraps a value in an array", () => {
      expect(Arr.wrap("hello")).toEqual(["hello"]);
    });

    it("returns arrays as-is", () => {
      expect(Arr.wrap([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("returns empty array for null", () => {
      expect(Arr.wrap(null)).toEqual([]);
    });

    it("returns empty array for undefined", () => {
      expect(Arr.wrap(undefined)).toEqual([]);
    });
  });

  describe("shuffle", () => {
    it("returns a new array (does not mutate)", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = Arr.shuffle(original);
      expect(original).toEqual([1, 2, 3, 4, 5]);
      expect(shuffled).toHaveLength(5);
    });

    it("contains all original elements", () => {
      const shuffled = Arr.shuffle([1, 2, 3, 4, 5]);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("sortBy", () => {
    it("sorts by a key ascending", () => {
      const items = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
      const sorted = Arr.sortBy(items, "name");
      expect(sorted[0]!.name).toBe("Alice");
      expect(sorted[2]!.name).toBe("Charlie");
    });

    it("sorts descending", () => {
      const items = [{ age: 20 }, { age: 30 }, { age: 10 }];
      const sorted = Arr.sortBy(items, "age", "desc");
      expect(sorted[0]!.age).toBe(30);
    });

    it("does not mutate the original", () => {
      const items = [{ n: 3 }, { n: 1 }, { n: 2 }];
      Arr.sortBy(items, "n");
      expect(items[0]!.n).toBe(3);
    });
  });

  describe("unique", () => {
    it("removes duplicates from primitives", () => {
      expect(Arr.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it("removes duplicates by key for objects", () => {
      const items = [
        { id: 1, name: "A" },
        { id: 1, name: "B" },
        { id: 2, name: "C" },
      ];
      expect(Arr.unique(items, "id")).toHaveLength(2);
    });
  });

  describe("chunk", () => {
    it("splits array into chunks", () => {
      expect(Arr.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("handles chunk size larger than array", () => {
      expect(Arr.chunk([1, 2], 5)).toEqual([[1, 2]]);
    });
  });

  describe("combine", () => {
    it("creates an object from keys and values", () => {
      expect(Arr.combine(["name", "age"], ["Alice", 30])).toEqual({
        name: "Alice",
        age: 30,
      });
    });
  });

  describe("random", () => {
    it("returns a single element by default", () => {
      const items = [1, 2, 3, 4, 5];
      const result = Arr.random(items);
      expect(items).toContain(result);
    });

    it("returns an array when count is specified", () => {
      const result = Arr.random([1, 2, 3, 4, 5], 2) as number[];
      expect(result).toHaveLength(2);
    });
  });

  // ── Type Checks ─────────────────────────────────────────────────────────

  describe("isArray", () => {
    it("returns true for arrays", () => {
      expect(Arr.isArray([1, 2, 3])).toBe(true);
    });

    it("returns false for non-arrays", () => {
      expect(Arr.isArray("hello")).toBe(false);
      expect(Arr.isArray({ a: 1 })).toBe(false);
    });
  });

  describe("isObject", () => {
    it("returns true for plain objects", () => {
      expect(Arr.isObject({ a: 1 })).toBe(true);
    });

    it("returns false for arrays", () => {
      expect(Arr.isObject([1, 2])).toBe(false);
    });

    it("returns false for null", () => {
      expect(Arr.isObject(null)).toBe(false);
    });
  });

  // ── Immutability ────────────────────────────────────────────────────────

  describe("immutability", () => {
    it("set does not mutate the original", () => {
      const original = { a: { b: 1 } };
      const result = Arr.set(original, "a.b", 99);
      expect(original.a.b).toBe(1);
      expect(result.a.b).toBe(99);
    });

    it("forget does not mutate the original", () => {
      const original = { a: 1, b: 2 };
      const result = Arr.forget(original, "a");
      expect("a" in original).toBe(true);
      expect("a" in result).toBe(false);
    });
  });
});
