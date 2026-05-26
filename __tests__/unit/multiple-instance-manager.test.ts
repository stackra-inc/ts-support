/**
 * @fileoverview Unit tests for the MultipleInstanceManager abstract class.
 *
 * Covers sync/async resolution, caching, extend, error handling,
 * and lifecycle hooks.
 *
 * @module @stackra/ts-support/tests/unit/multiple-instance-manager
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MultipleInstanceManager } from "@/managers";

// ── Test Doubles ──────────────────────────────────────────────────────────

interface TestDriver {
  name: string;
  connected: boolean;
}

class TestManager extends MultipleInstanceManager<TestDriver> {
  private defaultName = "default";
  private configs: Record<string, Record<string, any>> = {};

  public getDefaultInstance(): string {
    return this.defaultName;
  }

  public setDefaultInstance(name: string): void {
    this.defaultName = name;
  }

  public getInstanceConfig(name: string): Record<string, any> | undefined {
    return this.configs[name];
  }

  public addConfig(name: string, config: Record<string, any>): void {
    this.configs[name] = config;
  }

  protected createDriver(driver: string, config: Record<string, any>): TestDriver {
    return { name: config.name ?? driver, connected: true };
  }

  protected async createDriverAsync(
    driver: string,
    config: Record<string, any>,
  ): Promise<TestDriver> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { name: config.name ?? driver, connected: true };
  }
}

class TestManagerWithHook extends TestManager {
  public hookCalls: Array<{ name: string; instance: TestDriver }> = [];

  protected override onInstanceCreated(name: string, instance: TestDriver): TestDriver {
    this.hookCalls.push({ name, instance });
    return { ...instance, name: `${instance.name}-configured` };
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("MultipleInstanceManager", () => {
  let manager: TestManager;

  beforeEach(() => {
    manager = new TestManager();
    manager.addConfig("default", { driver: "memory", name: "default-driver" });
    manager.addConfig("redis", { driver: "redis", name: "redis-driver" });
    manager.addConfig("no-driver", { host: "localhost" });
  });

  // ── Sync resolution ───────────────────────────────────────────────────

  describe("instance (sync)", () => {
    it("resolves the default instance", () => {
      const result = manager.instance();
      expect(result.name).toBe("default-driver");
      expect(result.connected).toBe(true);
    });

    it("resolves a named instance", () => {
      const result = manager.instance("redis");
      expect(result.name).toBe("redis-driver");
    });

    it("caches resolved instances", () => {
      const first = manager.instance("redis");
      const second = manager.instance("redis");
      expect(first).toBe(second);
    });

    it("throws for undefined instance config", () => {
      expect(() => manager.instance("unknown")).toThrow("Instance [unknown] is not defined.");
    });

    it("throws when config has no driver key", () => {
      expect(() => manager.instance("no-driver")).toThrow(
        'Instance [no-driver] does not specify a "driver".',
      );
    });
  });

  // ── Async resolution ──────────────────────────────────────────────────

  describe("instanceAsync", () => {
    it("resolves the default instance asynchronously", async () => {
      const result = await manager.instanceAsync();
      expect(result.name).toBe("default-driver");
      expect(result.connected).toBe(true);
    });

    it("resolves a named instance asynchronously", async () => {
      const result = await manager.instanceAsync("redis");
      expect(result.name).toBe("redis-driver");
    });

    it("caches async-resolved instances", async () => {
      const first = await manager.instanceAsync("redis");
      const second = await manager.instanceAsync("redis");
      expect(first).toBe(second);
    });

    it("deduplicates in-flight resolutions", async () => {
      const createSpy = vi.spyOn(manager as any, "createDriverAsync");

      const [first, second] = await Promise.all([
        manager.instanceAsync("redis"),
        manager.instanceAsync("redis"),
      ]);

      expect(first).toBe(second);
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it("returns cached sync instance without async resolution", async () => {
      manager.instance("redis");
      const createSpy = vi.spyOn(manager as any, "createDriverAsync");

      const result = await manager.instanceAsync("redis");
      expect(result.name).toBe("redis-driver");
      expect(createSpy).not.toHaveBeenCalled();
    });

    it("throws for undefined instance config", async () => {
      await expect(manager.instanceAsync("unknown")).rejects.toThrow(
        "Instance [unknown] is not defined.",
      );
    });

    it("throws when config has no driver key", async () => {
      await expect(manager.instanceAsync("no-driver")).rejects.toThrow(
        'Instance [no-driver] does not specify a "driver".',
      );
    });
  });

  // ── extend (custom creators) ──────────────────────────────────────────

  describe("extend", () => {
    it("registers a custom driver creator", () => {
      manager.extend("custom", (config) => ({
        name: `custom-${config.name}`,
        connected: false,
      }));

      manager.addConfig("my-custom", { driver: "custom", name: "test" });
      const result = manager.instance("my-custom");
      expect(result.name).toBe("custom-test");
      expect(result.connected).toBe(false);
    });

    it("custom creators take priority over built-in drivers", () => {
      manager.extend("memory", () => ({
        name: "custom-memory",
        connected: false,
      }));

      manager.forgetInstance("default");
      const result = manager.instance("default");
      expect(result.name).toBe("custom-memory");
    });

    it("returns this for chaining", () => {
      const result = manager.extend("a", () => ({ name: "a", connected: true }));
      expect(result).toBe(manager);
    });
  });

  // ── Cache management ──────────────────────────────────────────────────

  describe("forgetInstance", () => {
    it("removes a cached instance", () => {
      manager.instance("redis");
      expect(manager.hasInstance("redis")).toBe(true);

      manager.forgetInstance("redis");
      expect(manager.hasInstance("redis")).toBe(false);
    });

    it("accepts an array of names", () => {
      manager.instance("default");
      manager.instance("redis");

      manager.forgetInstance(["default", "redis"]);
      expect(manager.hasInstance("default")).toBe(false);
      expect(manager.hasInstance("redis")).toBe(false);
    });

    it("forgets the default instance when no name provided", () => {
      manager.instance();
      expect(manager.hasInstance("default")).toBe(true);

      manager.forgetInstance();
      expect(manager.hasInstance("default")).toBe(false);
    });

    it("returns this for chaining", () => {
      expect(manager.forgetInstance("redis")).toBe(manager);
    });
  });

  describe("purge", () => {
    it("removes all cached instances", () => {
      manager.instance("default");
      manager.instance("redis");

      manager.purge();
      expect(manager.getResolvedInstances()).toEqual([]);
    });
  });

  describe("hasInstance", () => {
    it("returns true for resolved instances", () => {
      manager.instance("redis");
      expect(manager.hasInstance("redis")).toBe(true);
    });

    it("returns false for unresolved instances", () => {
      expect(manager.hasInstance("redis")).toBe(false);
    });
  });

  describe("getResolvedInstances", () => {
    it("returns all resolved instance names", () => {
      manager.instance("default");
      manager.instance("redis");
      expect(manager.getResolvedInstances().sort()).toEqual(["default", "redis"]);
    });
  });

  // ── Lifecycle hook ────────────────────────────────────────────────────

  describe("onInstanceCreated", () => {
    it("is called after instance creation", () => {
      const hookManager = new TestManagerWithHook();
      hookManager.addConfig("default", { driver: "memory", name: "test" });

      const result = hookManager.instance("default");
      expect(hookManager.hookCalls).toHaveLength(1);
      expect(hookManager.hookCalls[0]!.name).toBe("default");
      expect(result.name).toBe("test-configured");
    });
  });

  // ── Default instance ──────────────────────────────────────────────────

  describe("getDefaultInstance / setDefaultInstance", () => {
    it("uses the default instance name", () => {
      const result = manager.instance();
      expect(result.name).toBe("default-driver");
    });

    it("changes the default instance", () => {
      manager.setDefaultInstance("redis");
      const result = manager.instance();
      expect(result.name).toBe("redis-driver");
    });
  });
});
