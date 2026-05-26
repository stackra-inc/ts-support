/**
 * @fileoverview Unit tests for Collection, MapCollection, and SetCollection.
 *
 * Covers core operations, iteration, transformation, and set-theoretic
 * operations for all three collection types.
 *
 * @module @stackra/ts-support/tests/unit/collections
 */

import { describe, it, expect } from "vitest";
import { Collection, collect } from "@/collections";
import { MapCollection, collectMap } from "@/collections";
import { SetCollection, collectSet } from "@/collections";

// ============================================================================
// Collection (Array-based)
// ============================================================================

describe("Collection", () => {
  describe("construction", () => {
    it("creates from an array", () => {
      const c = new Collection([1, 2, 3]);
      expect(c.all()).toEqual([1, 2, 3]);
    });

    it("defaults to empty array", () => {
      const c = new Collection();
      expect(c.all()).toEqual([]);
    });

    it("creates via static make", () => {
      const c = Collection.make([1, 2]);
      expect(c.all()).toEqual([1, 2]);
    });

    it("creates via collect helper", () => {
      const c = collect([1, 2, 3]);
      expect(c.all()).toEqual([1, 2, 3]);
    });
  });

  describe("count / isEmpty / isNotEmpty", () => {
    it("counts items", () => {
      expect(collect([1, 2, 3]).count()).toBe(3);
    });

    it("isEmpty returns true for empty", () => {
      expect(collect([]).isEmpty()).toBe(true);
    });

    it("isNotEmpty returns true for non-empty", () => {
      expect(collect([1]).isNotEmpty()).toBe(true);
    });
  });

  describe("first / last", () => {
    it("returns first element", () => {
      expect(collect([1, 2, 3]).first()).toBe(1);
    });

    it("returns first matching element", () => {
      expect(collect([1, 2, 3]).first((n) => n > 1)).toBe(2);
    });

    it("returns last element", () => {
      expect(collect([1, 2, 3]).last()).toBe(3);
    });
  });

  describe("map / filter / reject", () => {
    it("maps items", () => {
      const result = collect([1, 2, 3]).map((n) => n * 2);
      expect(result.all()).toEqual([2, 4, 6]);
    });

    it("filters items", () => {
      const result = collect([1, 2, 3, 4]).filter((n) => n % 2 === 0);
      expect(result.all()).toEqual([2, 4]);
    });

    it("rejects items", () => {
      const result = collect([1, 2, 3, 4]).reject((n) => n % 2 === 0);
      expect(result.all()).toEqual([1, 3]);
    });
  });

  describe("reduce / sum / avg", () => {
    it("reduces to a single value", () => {
      const result = collect([1, 2, 3]).reduce((carry, n) => carry + n, 0);
      expect(result).toBe(6);
    });

    it("sums values", () => {
      expect(collect([1, 2, 3]).sum()).toBe(6);
    });

    it("averages values", () => {
      expect(collect([2, 4, 6]).avg()).toBe(4);
    });
  });

  describe("push / pop / shift / prepend", () => {
    it("pushes an item", () => {
      const c = collect([1, 2]);
      c.push(3);
      expect(c.all()).toEqual([1, 2, 3]);
    });

    it("pops the last item", () => {
      const c = collect([1, 2, 3]);
      expect(c.pop()).toBe(3);
    });

    it("shifts the first item", () => {
      const c = collect([1, 2, 3]);
      expect(c.shift()).toBe(1);
    });

    it("prepends an item", () => {
      const c = collect([2, 3]);
      c.prepend(1);
      expect(c.all()).toContain(1);
    });
  });

  describe("chunk / flatten / unique / reverse", () => {
    it("chunks the collection", () => {
      const result = collect([1, 2, 3, 4, 5]).chunk(2);
      expect(result.count()).toBe(3);
    });

    it("flattens nested arrays", () => {
      const result = collect([
        [1, 2],
        [3, 4],
      ]).flatten();
      expect(result.all()).toEqual([1, 2, 3, 4]);
    });

    it("removes duplicates", () => {
      const result = collect([1, 2, 2, 3, 3]).unique();
      expect(result.all()).toEqual([1, 2, 3]);
    });

    it("reverses the collection", () => {
      expect(collect([1, 2, 3]).reverse().all()).toEqual([3, 2, 1]);
    });
  });

  describe("where / whereIn / whereNotIn", () => {
    const items = [
      { id: 1, status: "active" },
      { id: 2, status: "inactive" },
      { id: 3, status: "active" },
    ];

    it("filters by key-value pair", () => {
      const result = collect(items).where("status", "active");
      expect(result.count()).toBe(2);
    });

    it("filters by whereIn", () => {
      const result = collect(items).whereIn("id", [1, 3]);
      expect(result.count()).toBe(2);
    });

    it("filters by whereNotIn", () => {
      const result = collect(items).whereNotIn("id", [2]);
      expect(result.count()).toBe(2);
    });
  });

  describe("sort / sortBy / sortByDesc", () => {
    it("sorts with custom comparator", () => {
      const result = collect([3, 1, 2]).sort((a, b) => a - b);
      expect(result.all()).toEqual([1, 2, 3]);
    });

    it("sorts by key", () => {
      const items = [{ n: 3 }, { n: 1 }, { n: 2 }];
      const result = collect(items).sortBy("n");
      expect(result.first()!.n).toBe(1);
    });

    it("sorts by key descending", () => {
      const items = [{ n: 1 }, { n: 3 }, { n: 2 }];
      const result = collect(items).sortByDesc("n");
      expect(result.first()!.n).toBe(3);
    });
  });

  describe("pipe / tap / toJson", () => {
    it("pipes through a callback", () => {
      const result = collect([1, 2, 3]).pipe((c) => c.count());
      expect(result).toBe(3);
    });

    it("taps without modifying", () => {
      let tapped = false;
      const c = collect([1, 2]).tap(() => {
        tapped = true;
      });
      expect(tapped).toBe(true);
      expect(c.all()).toEqual([1, 2]);
    });

    it("converts to JSON", () => {
      expect(collect([1, 2, 3]).toJson()).toBe("[1,2,3]");
    });
  });
});

// ============================================================================
// MapCollection
// ============================================================================

describe("MapCollection", () => {
  describe("construction", () => {
    it("creates from entries", () => {
      const m = new MapCollection([
        ["a", 1],
        ["b", 2],
      ]);
      expect(m.get("a")).toBe(1);
    });

    it("creates from a record", () => {
      const m = new MapCollection({ a: 1, b: 2 });
      expect(m.get("a")).toBe(1);
    });

    it("creates via static make", () => {
      const m = MapCollection.make({ x: 10 });
      expect(m.get("x")).toBe(10);
    });

    it("creates via collectMap helper", () => {
      const m = collectMap({ a: 1 });
      expect(m.get("a")).toBe(1);
    });
  });

  describe("get / set / has / delete", () => {
    it("sets and gets values", () => {
      const m = new MapCollection<string, number>();
      m.set("key", 42);
      expect(m.get("key")).toBe(42);
    });

    it("returns default value for missing keys", () => {
      const m = new MapCollection<string, number>();
      expect(m.get("missing", 99)).toBe(99);
    });

    it("checks key existence", () => {
      const m = new MapCollection({ a: 1 });
      expect(m.has("a")).toBe(true);
      expect(m.has("b")).toBe(false);
    });

    it("deletes keys", () => {
      const m = new MapCollection({ a: 1 });
      expect(m.delete("a")).toBe(true);
      expect(m.has("a")).toBe(false);
    });
  });

  describe("size / isEmpty / isNotEmpty / clear", () => {
    it("reports size", () => {
      expect(new MapCollection({ a: 1, b: 2 }).size()).toBe(2);
    });

    it("isEmpty for empty map", () => {
      expect(new MapCollection().isEmpty()).toBe(true);
    });

    it("isNotEmpty for non-empty map", () => {
      expect(new MapCollection({ a: 1 }).isNotEmpty()).toBe(true);
    });

    it("clears all entries", () => {
      const m = new MapCollection({ a: 1, b: 2 });
      m.clear();
      expect(m.isEmpty()).toBe(true);
    });
  });

  describe("keys / values / all", () => {
    it("returns all keys", () => {
      const m = new MapCollection({ a: 1, b: 2 });
      expect(m.keys()).toEqual(["a", "b"]);
    });

    it("returns all values", () => {
      const m = new MapCollection({ a: 1, b: 2 });
      expect(m.values()).toEqual([1, 2]);
    });

    it("returns all entries", () => {
      const m = new MapCollection({ a: 1 });
      expect(m.all()).toEqual([["a", 1]]);
    });
  });

  describe("each / mapValues / filter", () => {
    it("iterates with each", () => {
      const entries: [string, number][] = [];
      new MapCollection({ a: 1, b: 2 }).each((v, k) => {
        entries.push([k as string, v]);
      });
      expect(entries).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });

    it("maps values", () => {
      const result = new MapCollection({ a: 1, b: 2 }).mapValues((v) => v * 10);
      expect(result.get("a")).toBe(10);
      expect(result.get("b")).toBe(20);
    });

    it("filters entries", () => {
      const result = new MapCollection({ a: 1, b: 2, c: 3 }).filter((v) => v > 1);
      expect(result.size()).toBe(2);
      expect(result.has("a")).toBe(false);
    });
  });

  describe("every / some / first / last", () => {
    it("every returns true when all pass", () => {
      expect(new MapCollection({ a: 2, b: 4 }).every((v) => v % 2 === 0)).toBe(true);
    });

    it("some returns true when any passes", () => {
      expect(new MapCollection({ a: 1, b: 2 }).some((v) => v > 1)).toBe(true);
    });

    it("first returns first value", () => {
      expect(new MapCollection({ a: 1, b: 2 }).first()).toBe(1);
    });

    it("last returns last value", () => {
      expect(new MapCollection({ a: 1, b: 2 }).last()).toBe(2);
    });
  });

  describe("merge / only / except / flip", () => {
    it("merges another map", () => {
      const m = new MapCollection({ a: 1 });
      m.merge({ b: 2 });
      expect(m.get("b")).toBe(2);
    });

    it("returns only specified keys", () => {
      const result = new MapCollection({ a: 1, b: 2, c: 3 }).only(["a", "c"]);
      expect(result.size()).toBe(2);
    });

    it("returns all except specified keys", () => {
      const result = new MapCollection({ a: 1, b: 2, c: 3 }).except(["b"]);
      expect(result.size()).toBe(2);
      expect(result.has("b")).toBe(false);
    });

    it("flips keys and values", () => {
      const result = new MapCollection({ a: "x", b: "y" }).flip();
      expect(result.get("x")).toBe("a");
    });
  });

  describe("reduce / toObject / toJson", () => {
    it("reduces to a single value", () => {
      const sum = new MapCollection({ a: 1, b: 2 }).reduce((carry, v) => carry + v, 0);
      expect(sum).toBe(3);
    });

    it("converts to plain object", () => {
      expect(new MapCollection({ a: 1 }).toObject()).toEqual({ a: 1 });
    });

    it("converts to JSON", () => {
      expect(new MapCollection({ a: 1 }).toJson()).toBe('{"a":1}');
    });
  });
});

// ============================================================================
// SetCollection
// ============================================================================

describe("SetCollection", () => {
  describe("construction", () => {
    it("creates from an iterable", () => {
      const s = new SetCollection([1, 2, 3]);
      expect(s.all()).toEqual([1, 2, 3]);
    });

    it("deduplicates on creation", () => {
      const s = new SetCollection([1, 1, 2, 2, 3]);
      expect(s.size()).toBe(3);
    });

    it("creates via static make", () => {
      const s = SetCollection.make([1, 2]);
      expect(s.size()).toBe(2);
    });

    it("creates via collectSet helper", () => {
      const s = collectSet([1, 2, 3]);
      expect(s.size()).toBe(3);
    });
  });

  describe("add / has / delete / clear", () => {
    it("adds items", () => {
      const s = new SetCollection<number>();
      s.add(1).add(2);
      expect(s.has(1)).toBe(true);
      expect(s.has(2)).toBe(true);
    });

    it("contains is alias for has", () => {
      const s = new SetCollection([1, 2]);
      expect(s.contains(1)).toBe(true);
    });

    it("deletes items", () => {
      const s = new SetCollection([1, 2, 3]);
      expect(s.delete(2)).toBe(true);
      expect(s.has(2)).toBe(false);
    });

    it("clears all items", () => {
      const s = new SetCollection([1, 2, 3]);
      s.clear();
      expect(s.isEmpty()).toBe(true);
    });
  });

  describe("size / count / isEmpty / isNotEmpty", () => {
    it("reports size", () => {
      expect(new SetCollection([1, 2, 3]).size()).toBe(3);
      expect(new SetCollection([1, 2, 3]).count()).toBe(3);
    });

    it("isEmpty for empty set", () => {
      expect(new SetCollection().isEmpty()).toBe(true);
    });

    it("isNotEmpty for non-empty set", () => {
      expect(new SetCollection([1]).isNotEmpty()).toBe(true);
    });
  });

  describe("each / map / filter", () => {
    it("iterates with each", () => {
      const items: number[] = [];
      new SetCollection([1, 2, 3]).each((item) => {
        items.push(item);
      });
      expect(items).toEqual([1, 2, 3]);
    });

    it("maps items", () => {
      const result = new SetCollection([1, 2, 3]).map((n) => n * 2);
      expect(result.all()).toEqual([2, 4, 6]);
    });

    it("filters items", () => {
      const result = new SetCollection([1, 2, 3, 4]).filter((n) => n % 2 === 0);
      expect(result.all()).toEqual([2, 4]);
    });
  });

  describe("every / some / first / last", () => {
    it("every returns true when all pass", () => {
      expect(new SetCollection([2, 4, 6]).every((n) => n % 2 === 0)).toBe(true);
    });

    it("some returns true when any passes", () => {
      expect(new SetCollection([1, 2, 3]).some((n) => n > 2)).toBe(true);
    });

    it("first returns first item", () => {
      expect(new SetCollection([10, 20, 30]).first()).toBe(10);
    });

    it("last returns last item", () => {
      expect(new SetCollection([10, 20, 30]).last()).toBe(30);
    });
  });

  // ── Set-Theoretic Operations ──────────────────────────────────────────

  describe("union", () => {
    it("returns the union of two sets", () => {
      const a = new SetCollection([1, 2, 3]);
      const b = new SetCollection([3, 4, 5]);
      const result = a.union(b);
      expect(result.all().sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it("accepts arrays", () => {
      const result = new SetCollection([1, 2]).union([2, 3]);
      expect(result.all().sort()).toEqual([1, 2, 3]);
    });
  });

  describe("intersect", () => {
    it("returns the intersection", () => {
      const a = new SetCollection([1, 2, 3]);
      const b = new SetCollection([2, 3, 4]);
      const result = a.intersect(b);
      expect(result.all().sort()).toEqual([2, 3]);
    });
  });

  describe("diff", () => {
    it("returns items in this set but not the other", () => {
      const a = new SetCollection([1, 2, 3]);
      const b = new SetCollection([2, 3, 4]);
      const result = a.diff(b);
      expect(result.all()).toEqual([1]);
    });
  });

  describe("symmetricDiff", () => {
    it("returns items in either set but not both", () => {
      const a = new SetCollection([1, 2, 3]);
      const b = new SetCollection([2, 3, 4]);
      const result = a.symmetricDiff(b);
      expect(result.all().sort()).toEqual([1, 4]);
    });
  });

  describe("isSubsetOf / isSupersetOf", () => {
    it("identifies subsets", () => {
      const a = new SetCollection([1, 2]);
      const b = new SetCollection([1, 2, 3, 4]);
      expect(a.isSubsetOf(b)).toBe(true);
      expect(b.isSubsetOf(a)).toBe(false);
    });

    it("identifies supersets", () => {
      const a = new SetCollection([1, 2, 3, 4]);
      const b = new SetCollection([1, 2]);
      expect(a.isSupersetOf(b)).toBe(true);
      expect(b.isSupersetOf(a)).toBe(false);
    });
  });

  describe("merge", () => {
    it("merges another set into this one", () => {
      const s = new SetCollection([1, 2]);
      s.merge([3, 4]);
      expect(s.all().sort()).toEqual([1, 2, 3, 4]);
    });

    it("merges a SetCollection", () => {
      const s = new SetCollection([1, 2]);
      s.merge(new SetCollection([2, 3]));
      expect(s.size()).toBe(3);
    });
  });

  describe("reduce / toArray / toJson / toSet", () => {
    it("reduces to a single value", () => {
      const sum = new SetCollection([1, 2, 3]).reduce((carry, n) => carry + n, 0);
      expect(sum).toBe(6);
    });

    it("converts to array", () => {
      expect(new SetCollection([1, 2]).toArray()).toEqual([1, 2]);
    });

    it("converts to JSON", () => {
      expect(new SetCollection([1, 2]).toJson()).toBe("[1,2]");
    });

    it("converts to native Set", () => {
      const result = new SetCollection([1, 2]).toSet();
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(2);
    });
  });
});
