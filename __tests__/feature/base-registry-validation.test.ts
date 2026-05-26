/**
 * @fileoverview Feature test for BaseRegistry with complex validation scenarios.
 *
 * Tests real-world registry usage patterns including multi-field validation,
 * conditional validation, lifecycle hooks, and registry composition.
 *
 * @module @stackra/ts-support/tests/feature/base-registry-validation
 */

import { describe, it, expect } from "vitest";
import { BaseRegistry } from "@/registry";

// ── Test Types ──────────────────────────────────────────────────────────────

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
  version: number;
}

interface Plugin {
  id: string;
  name: string;
  dependencies: string[];
  enabled: boolean;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("BaseRegistry Complex Validation (Feature)", () => {
  // ── Multi-field validation ────────────────────────────────────────────

  describe("multi-field validation", () => {
    it("validates multiple fields on a theme object", () => {
      const registry = new BaseRegistry<Theme>({
        validateBeforeAdd: (_key, theme) => {
          if (!theme.name || theme.name.trim().length === 0) {
            return { valid: false, error: "Theme must have a name" };
          }
          if (!theme.colors.primary) {
            return { valid: false, error: "Theme must have a primary color" };
          }
          if (theme.version < 1) {
            return { valid: false, error: "Theme version must be >= 1" };
          }
          return { valid: true };
        },
      });

      // Valid theme
      registry.register("blue", {
        name: "Blue Theme",
        colors: { primary: "#0000ff", secondary: "#000088" },
        version: 1,
      });
      expect(registry.has("blue")).toBe(true);

      // Missing name
      expect(() =>
        registry.register("bad1", {
          name: "",
          colors: { primary: "#fff", secondary: "#000" },
          version: 1,
        }),
      ).toThrow("Theme must have a name");

      // Missing primary color
      expect(() =>
        registry.register("bad2", {
          name: "Bad",
          colors: { primary: "", secondary: "#000" },
          version: 1,
        }),
      ).toThrow("Theme must have a primary color");

      // Invalid version
      expect(() =>
        registry.register("bad3", {
          name: "Bad",
          colors: { primary: "#fff", secondary: "#000" },
          version: 0,
        }),
      ).toThrow("Theme version must be >= 1");
    });
  });

  // ── Key-based validation ──────────────────────────────────────────────

  describe("key-based validation", () => {
    it("validates the key format", () => {
      const registry = new BaseRegistry<string>({
        validateBeforeAdd: (key) => {
          const validKeyPattern = /^[a-z][a-z0-9-]*$/;
          if (!validKeyPattern.test(key)) {
            return {
              valid: false,
              error: `Key "${key}" must be lowercase kebab-case starting with a letter`,
            };
          }
          return { valid: true };
        },
      });

      registry.register("valid-key", "value");
      expect(registry.has("valid-key")).toBe(true);

      expect(() => registry.register("Invalid", "value")).toThrow("must be lowercase kebab-case");
      expect(() => registry.register("123-bad", "value")).toThrow("starting with a letter");
    });
  });

  // ── Dependency validation ─────────────────────────────────────────────

  describe("dependency validation", () => {
    it("validates plugin dependencies exist before registration", () => {
      const registry = new BaseRegistry<Plugin>({
        validateBeforeAdd: (key, plugin): { valid: boolean; error?: string } => {
          for (const dep of plugin.dependencies) {
            if (!registry.has(dep)) {
              return {
                valid: false,
                error: `Plugin "${key}" depends on "${dep}" which is not registered`,
              };
            }
          }
          return { valid: true };
        },
      });

      // Register base plugin (no dependencies)
      registry.register("core", {
        id: "core",
        name: "Core Plugin",
        dependencies: [],
        enabled: true,
      });

      // Register plugin with satisfied dependency
      registry.register("auth", {
        id: "auth",
        name: "Auth Plugin",
        dependencies: ["core"],
        enabled: true,
      });
      expect(registry.has("auth")).toBe(true);

      // Fail on unsatisfied dependency
      expect(() =>
        registry.register("analytics", {
          id: "analytics",
          name: "Analytics Plugin",
          dependencies: ["core", "tracking"],
          enabled: true,
        }),
      ).toThrow('depends on "tracking" which is not registered');
    });
  });

  // ── afterAdd hook for side effects ────────────────────────────────────

  describe("afterAdd hook for side effects", () => {
    it("tracks registration history", () => {
      const history: Array<{ key: string; timestamp: number }> = [];

      const registry = new BaseRegistry<string>({
        afterAdd: (key) => {
          history.push({ key, timestamp: Date.now() });
        },
      });

      registry.register("first", "value1");
      registry.register("second", "value2");
      registry.register("third", "value3");

      expect(history).toHaveLength(3);
      expect(history.map((h) => h.key)).toEqual(["first", "second", "third"]);
    });

    it("emits events on registration", () => {
      const events: Array<{ type: string; key: string }> = [];

      const registry = new BaseRegistry<Theme>({
        afterAdd: (key) => {
          events.push({ type: "theme.registered", key });
        },
      });

      registry.register("dark", {
        name: "Dark",
        colors: { primary: "#000", secondary: "#333" },
        version: 1,
      });

      expect(events).toEqual([{ type: "theme.registered", key: "dark" }]);
    });
  });

  // ── Default item with validation ──────────────────────────────────────

  describe("default item with validation", () => {
    it("returns default theme for unregistered keys", () => {
      const defaultTheme: Theme = {
        name: "Default",
        colors: { primary: "#ffffff", secondary: "#000000" },
        version: 1,
      };

      const registry = new BaseRegistry<Theme>({
        defaultItem: defaultTheme,
        validateBeforeAdd: (_key, theme) => ({
          valid: theme.version >= 1,
          error: "Invalid version",
        }),
      });

      // Unregistered key returns default
      expect(registry.get("nonexistent")).toEqual(defaultTheme);

      // Registered key returns actual
      const custom: Theme = {
        name: "Custom",
        colors: { primary: "#ff0000", secondary: "#880000" },
        version: 2,
      };
      registry.register("custom", custom);
      expect(registry.get("custom")).toEqual(custom);
    });
  });

  // ── Registry as a plugin system ───────────────────────────────────────

  describe("registry as a plugin system", () => {
    it("manages a full plugin lifecycle", () => {
      const loadOrder: string[] = [];

      const registry = new BaseRegistry<Plugin>({
        validateBeforeAdd: (key, plugin) => {
          if (!plugin.id || plugin.id !== key) {
            return { valid: false, error: "Plugin id must match registry key" };
          }
          if (!plugin.name) {
            return { valid: false, error: "Plugin must have a name" };
          }
          return { valid: true };
        },
        afterAdd: (key) => {
          loadOrder.push(key);
        },
      });

      // Register plugins
      registry.register("core", {
        id: "core",
        name: "Core",
        dependencies: [],
        enabled: true,
      });
      registry.register("ui", {
        id: "ui",
        name: "UI Framework",
        dependencies: ["core"],
        enabled: true,
      });
      registry.register("auth", {
        id: "auth",
        name: "Authentication",
        dependencies: ["core"],
        enabled: false,
      });

      // Verify state
      expect(registry.size()).toBe(3);
      expect(loadOrder).toEqual(["core", "ui", "auth"]);

      // Filter enabled plugins
      const enabled = registry.filter((plugin) => plugin.enabled);
      expect(enabled).toHaveLength(2);

      // Find a specific plugin
      const authPlugin = registry.find((plugin) => plugin.id === "auth");
      expect(authPlugin?.enabled).toBe(false);

      // Remove a plugin
      registry.remove("auth");
      expect(registry.size()).toBe(2);
      expect(registry.has("auth")).toBe(false);

      // Map to names
      const names = registry.map((plugin) => plugin.name);
      expect(names).toEqual(["Core", "UI Framework"]);
    });
  });

  // ── Uniqueness enforcement ────────────────────────────────────────────

  describe("uniqueness enforcement", () => {
    it("prevents duplicate names across different keys", () => {
      const usedNames = new Set<string>();

      const registry = new BaseRegistry<{ name: string; value: number }>({
        validateBeforeAdd: (_key, item) => {
          if (usedNames.has(item.name)) {
            return { valid: false, error: `Name "${item.name}" is already in use` };
          }
          return { valid: true };
        },
        afterAdd: (_key, item) => {
          usedNames.add(item.name);
        },
      });

      registry.register("a", { name: "Alpha", value: 1 });
      registry.register("b", { name: "Beta", value: 2 });

      expect(() => registry.register("c", { name: "Alpha", value: 3 })).toThrow(
        'Name "Alpha" is already in use',
      );
    });
  });
});
