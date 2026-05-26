/**
 * BaseRegistry — Advanced Tests
 *
 * Tests advanced registry patterns: validation hooks, lifecycle callbacks,
 * collection interface methods, filtering, mapping, and iteration.
 *
 * @module __tests__/unit/base-registry-advanced
 */

import { describe, it, expect, vi } from "vitest";
import { BaseRegistry } from "@/registry";

// ── Tests ─────────────────────────────────────────────────────────────────

interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
}

describe("BaseRegistry — Advanced", () => {
  describe("Validation Hooks", () => {
    it("should reject registration when validation fails", () => {
      const registry = new BaseRegistry<Plugin>({
        validateBeforeAdd: (key, item) => {
          if (!item.name) return { valid: false, error: "Name is required" };
          return { valid: true };
        },
      });

      expect(() => registry.register("bad", { name: "", version: "1.0", enabled: true })).toThrow(
        "Name is required",
      );
    });

    it("should allow registration when validation passes", () => {
      const registry = new BaseRegistry<Plugin>({
        validateBeforeAdd: (key, item) => {
          if (!item.name) return { valid: false, error: "Name is required" };
          return { valid: true };
        },
      });

      registry.register("good", { name: "MyPlugin", version: "1.0", enabled: true });
      expect(registry.get("good")?.name).toBe("MyPlugin");
    });

    it("should validate key uniqueness pattern", () => {
      const registry = new BaseRegistry<Plugin>({
        validateBeforeAdd: (key) => {
          if (key.includes(" ")) return { valid: false, error: "Key cannot contain spaces" };
          return { valid: true };
        },
      });

      expect(() =>
        registry.register("bad key", { name: "Plugin", version: "1.0", enabled: true }),
      ).toThrow("Key cannot contain spaces");
    });

    it("should include key in error message", () => {
      const registry = new BaseRegistry<Plugin>({
        validateBeforeAdd: () => ({ valid: false, error: "Always fails" }),
      });

      expect(() =>
        registry.register("test-key", { name: "P", version: "1.0", enabled: true }),
      ).toThrow('Validation failed for key "test-key"');
    });
  });

  describe("Lifecycle Callbacks", () => {
    it("should call afterAdd hook on successful registration", () => {
      const afterAdd = vi.fn();
      const registry = new BaseRegistry<Plugin>({ afterAdd });

      const plugin = { name: "MyPlugin", version: "1.0", enabled: true };
      registry.register("my-plugin", plugin);

      expect(afterAdd).toHaveBeenCalledWith("my-plugin", plugin);
    });

    it("should not call afterAdd when validation fails", () => {
      const afterAdd = vi.fn();
      const registry = new BaseRegistry<Plugin>({
        validateBeforeAdd: () => ({ valid: false, error: "fail" }),
        afterAdd,
      });

      expect(() =>
        registry.register("key", { name: "P", version: "1.0", enabled: true }),
      ).toThrow();
      expect(afterAdd).not.toHaveBeenCalled();
    });
  });

  describe("Collection Interface — forEach", () => {
    it("should iterate over all entries", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("a", { name: "A", version: "1.0", enabled: true });
      registry.register("b", { name: "B", version: "2.0", enabled: false });

      const entries: Array<[string, Plugin]> = [];
      registry.forEach((value, key) => entries.push([key, value]));

      expect(entries).toHaveLength(2);
      expect(entries[0][0]).toBe("a");
      expect(entries[1][0]).toBe("b");
    });
  });

  describe("Collection Interface — map", () => {
    it("should map entries to new values", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("a", { name: "Alpha", version: "1.0", enabled: true });
      registry.register("b", { name: "Beta", version: "2.0", enabled: false });

      const names = registry.map((value) => value.name);
      expect(names).toEqual(["Alpha", "Beta"]);
    });

    it("should include key in map callback", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("key1", { name: "A", version: "1.0", enabled: true });

      const result = registry.map((value, key) => `${key}:${value.name}`);
      expect(result).toEqual(["key1:A"]);
    });
  });

  describe("Collection Interface — filter", () => {
    it("should filter entries by predicate", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("a", { name: "A", version: "1.0", enabled: true });
      registry.register("b", { name: "B", version: "2.0", enabled: false });
      registry.register("c", { name: "C", version: "3.0", enabled: true });

      const enabled = registry.filter((value) => value.enabled);
      expect(enabled).toHaveLength(2);
      expect(enabled[0].name).toBe("A");
      expect(enabled[1].name).toBe("C");
    });

    it("should filter by key", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("plugin-a", { name: "A", version: "1.0", enabled: true });
      registry.register("theme-b", { name: "B", version: "2.0", enabled: true });
      registry.register("plugin-c", { name: "C", version: "3.0", enabled: true });

      const plugins = registry.filter((_, key) => key.startsWith("plugin-"));
      expect(plugins).toHaveLength(2);
    });
  });

  describe("Collection Interface — find", () => {
    it("should find first matching entry", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("a", { name: "A", version: "1.0", enabled: false });
      registry.register("b", { name: "B", version: "2.0", enabled: true });
      registry.register("c", { name: "C", version: "3.0", enabled: true });

      const found = registry.find((value) => value.enabled);
      expect(found?.name).toBe("B");
    });

    it("should return undefined when no match", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("a", { name: "A", version: "1.0", enabled: false });

      const found = registry.find((value) => value.version === "99.0");
      expect(found).toBeUndefined();
    });
  });

  describe("Bulk Operations", () => {
    it("should clear all entries", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("a", { name: "A", version: "1.0", enabled: true });
      registry.register("b", { name: "B", version: "2.0", enabled: true });

      registry.clear();

      expect(registry.size()).toBe(0);
      expect(registry.isEmpty()).toBe(true);
    });

    it("should report correct size", () => {
      const registry = new BaseRegistry<Plugin>();
      expect(registry.size()).toBe(0);

      registry.register("a", { name: "A", version: "1.0", enabled: true });
      expect(registry.size()).toBe(1);

      registry.register("b", { name: "B", version: "2.0", enabled: true });
      expect(registry.size()).toBe(2);

      registry.remove("a");
      expect(registry.size()).toBe(1);
    });

    it("should return all keys", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("alpha", { name: "A", version: "1.0", enabled: true });
      registry.register("beta", { name: "B", version: "2.0", enabled: true });

      expect(registry.getKeys()).toEqual(["alpha", "beta"]);
    });

    it("should return all values", () => {
      const registry = new BaseRegistry<Plugin>();
      const a = { name: "A", version: "1.0", enabled: true };
      const b = { name: "B", version: "2.0", enabled: true };
      registry.register("a", a);
      registry.register("b", b);

      expect(registry.getAll()).toEqual([a, b]);
    });

    it("should convert to record", () => {
      const registry = new BaseRegistry<Plugin>();
      const a = { name: "A", version: "1.0", enabled: true };
      registry.register("alpha", a);

      expect(registry.getAsRecord()).toEqual({ alpha: a });
    });
  });

  describe("Default Item Behavior", () => {
    it("should return default for any missing key", () => {
      const defaultPlugin: Plugin = { name: "Default", version: "0.0", enabled: false };
      const registry = new BaseRegistry<Plugin>({ defaultItem: defaultPlugin });

      expect(registry.get("anything")).toEqual(defaultPlugin);
      expect(registry.get("random-key")).toEqual(defaultPlugin);
    });

    it("should prefer registered item over default", () => {
      const defaultPlugin: Plugin = { name: "Default", version: "0.0", enabled: false };
      const registry = new BaseRegistry<Plugin>({ defaultItem: defaultPlugin });

      const custom = { name: "Custom", version: "1.0", enabled: true };
      registry.register("custom", custom);

      expect(registry.get("custom")).toEqual(custom);
    });
  });

  describe("Remove Operations", () => {
    it("should remove existing key and return true", () => {
      const registry = new BaseRegistry<Plugin>();
      registry.register("a", { name: "A", version: "1.0", enabled: true });

      expect(registry.remove("a")).toBe(true);
      expect(registry.has("a")).toBe(false);
    });

    it("should return false for non-existent key", () => {
      const registry = new BaseRegistry<Plugin>();
      expect(registry.remove("nonexistent")).toBe(false);
    });
  });
});
