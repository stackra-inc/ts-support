/**
 * MultipleInstanceManager — Advanced Tests
 *
 * Tests advanced manager patterns: async resolution, deduplication,
 * custom creators, cache management, lifecycle hooks.
 *
 * @module __tests__/unit/multiple-instance-manager-advanced
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MultipleInstanceManager } from "@/managers";

// ── Test Implementation ───────────────────────────────────────────────────

interface TestConnection {
  name: string;
  connected: boolean;
}

class TestManager extends MultipleInstanceManager<TestConnection> {
  private _default = "primary";
  private _configs: Record<string, Record<string, any>> = {
    primary: { driver: "memory", host: "localhost" },
    secondary: { driver: "redis", host: "redis.local" },
    async: { driver: "async-redis", host: "async.local" },
  };

  getDefaultInstance(): string {
    return this._default;
  }

  setDefaultInstance(name: string): void {
    this._default = name;
  }

  getInstanceConfig(name: string): Record<string, any> | undefined {
    return this._configs[name];
  }

  protected createDriver(driver: string, config: Record<string, any>): TestConnection {
    if (driver === "async-redis") {
      throw new Error("Use instanceAsync() for async drivers");
    }
    return { name: `${driver}@${config.host}`, connected: true };
  }

  protected async createDriverAsync(
    driver: string,
    config: Record<string, any>,
  ): Promise<TestConnection> {
    await new Promise((r) => setTimeout(r, 50));
    return { name: `${driver}@${config.host}`, connected: true };
  }

  // Expose for testing
  addConfig(name: string, config: Record<string, any>) {
    this._configs[name] = config;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("MultipleInstanceManager — Advanced", () => {
  let manager: TestManager;

  beforeEach(() => {
    manager = new TestManager();
  });

  describe("Sync Resolution", () => {
    it("should resolve default instance", () => {
      const instance = manager.instance();
      expect(instance.name).toBe("memory@localhost");
      expect(instance.connected).toBe(true);
    });

    it("should resolve named instance", () => {
      const instance = manager.instance("secondary");
      expect(instance.name).toBe("redis@redis.local");
    });

    it("should cache resolved instances", () => {
      const first = manager.instance("primary");
      const second = manager.instance("primary");
      expect(first).toBe(second); // Same reference
    });

    it("should throw for undefined instance", () => {
      expect(() => manager.instance("nonexistent")).toThrow(
        "Instance [nonexistent] is not defined",
      );
    });
  });

  describe("Async Resolution", () => {
    it("should resolve instance asynchronously", async () => {
      const instance = await manager.instanceAsync("async");
      expect(instance.name).toBe("async-redis@async.local");
      expect(instance.connected).toBe(true);
    });

    it("should cache async-resolved instances", async () => {
      const first = await manager.instanceAsync("async");
      const second = await manager.instanceAsync("async");
      expect(first).toBe(second);
    });

    it("should deduplicate concurrent async resolutions", async () => {
      const createSpy = vi.spyOn(manager as any, "createDriverAsync");

      // Fire multiple concurrent requests
      const [r1, r2, r3] = await Promise.all([
        manager.instanceAsync("async"),
        manager.instanceAsync("async"),
        manager.instanceAsync("async"),
      ]);

      // Should only create once despite 3 concurrent calls
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(r1).toBe(r2);
      expect(r2).toBe(r3);
    });

    it("should return cached instance without async call", async () => {
      // First call creates
      await manager.instanceAsync("primary");

      const createSpy = vi.spyOn(manager as any, "createDriverAsync");

      // Second call returns from cache
      await manager.instanceAsync("primary");
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe("Custom Creators (extend)", () => {
    it("should use custom creator when registered", () => {
      manager.addConfig("custom", { driver: "custom-driver", host: "custom.local" });
      manager.extend("custom-driver", (config) => ({
        name: `custom:${config.host}`,
        connected: true,
      }));

      const instance = manager.instance("custom");
      expect(instance.name).toBe("custom:custom.local");
    });

    it("should allow chaining extend calls", () => {
      const result = manager
        .extend("driver-a", () => ({ name: "a", connected: true }))
        .extend("driver-b", () => ({ name: "b", connected: true }));

      expect(result).toBe(manager);
    });

    it("should prioritize custom creators over built-in", () => {
      manager.extend("memory", (config) => ({
        name: `custom-memory@${config.host}`,
        connected: true,
      }));

      // Purge cache to force re-creation
      manager.purge();

      const instance = manager.instance("primary");
      expect(instance.name).toBe("custom-memory@localhost");
    });
  });

  describe("Cache Management", () => {
    it("should forget specific instance", () => {
      manager.instance("primary");
      expect(manager.hasInstance("primary")).toBe(true);

      manager.forgetInstance("primary");
      expect(manager.hasInstance("primary")).toBe(false);
    });

    it("should forget multiple instances", () => {
      manager.instance("primary");
      manager.instance("secondary");

      manager.forgetInstance(["primary", "secondary"]);

      expect(manager.hasInstance("primary")).toBe(false);
      expect(manager.hasInstance("secondary")).toBe(false);
    });

    it("should purge all instances", () => {
      manager.instance("primary");
      manager.instance("secondary");

      manager.purge();

      expect(manager.getResolvedInstances()).toEqual([]);
    });

    it("should re-create instance after forget", () => {
      const first = manager.instance("primary");
      manager.forgetInstance("primary");
      const second = manager.instance("primary");

      // New instance (different reference)
      expect(first).not.toBe(second);
      // But same config
      expect(first.name).toBe(second.name);
    });
  });

  describe("Introspection", () => {
    it("should check if instance is resolved", () => {
      expect(manager.hasInstance("primary")).toBe(false);
      manager.instance("primary");
      expect(manager.hasInstance("primary")).toBe(true);
    });

    it("should list resolved instance names", () => {
      manager.instance("primary");
      manager.instance("secondary");

      expect(manager.getResolvedInstances()).toEqual(["primary", "secondary"]);
    });
  });

  describe("Default Instance", () => {
    it("should use default when no name provided", () => {
      const instance = manager.instance();
      expect(instance.name).toContain("localhost");
    });

    it("should allow changing default at runtime", () => {
      manager.setDefaultInstance("secondary");
      const instance = manager.instance();
      expect(instance.name).toContain("redis.local");
    });
  });

  describe("Error Handling", () => {
    it("should throw when config has no driver key", () => {
      manager.addConfig("no-driver", { host: "localhost" });
      expect(() => manager.instance("no-driver")).toThrow('does not specify a "driver"');
    });

    it("should throw for undefined instance config", () => {
      expect(() => manager.instance("ghost")).toThrow("Instance [ghost] is not defined");
    });

    it("should throw async for undefined instance", async () => {
      await expect(manager.instanceAsync("ghost")).rejects.toThrow(
        "Instance [ghost] is not defined",
      );
    });
  });
});
