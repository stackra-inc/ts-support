/**
 * @fileoverview Feature test for a concrete MultipleInstanceManager subclass lifecycle.
 *
 * Tests the full lifecycle of a real-world manager implementation including
 * sync/async resolution, custom drivers, caching, purging, and hooks.
 *
 * @module @stackra/ts-support/tests/feature/multiple-instance-manager-lifecycle
 */

import { describe, it, expect } from "vitest";
import { MultipleInstanceManager } from "@/managers";

// ── Concrete Implementation ─────────────────────────────────────────────────

interface IConnection {
  host: string;
  port: number;
  connected: boolean;
  driver: string;
}

/**
 * Simulates a database connection manager with multiple named connections.
 */
class DatabaseManager extends MultipleInstanceManager<IConnection> {
  private defaultConnection = "primary";
  private readonly connectionConfigs: Record<string, Record<string, any>> = {
    primary: { driver: "postgres", host: "localhost", port: 5432 },
    replica: { driver: "postgres", host: "replica.local", port: 5432 },
    analytics: { driver: "clickhouse", host: "analytics.local", port: 8123 },
    async_only: { driver: "redis", host: "redis.local", port: 6379 },
  };

  public createdConnections: string[] = [];

  public getDefaultInstance(): string {
    return this.defaultConnection;
  }

  public setDefaultInstance(name: string): void {
    this.defaultConnection = name;
  }

  public getInstanceConfig(name: string): Record<string, any> | undefined {
    return this.connectionConfigs[name];
  }

  protected createDriver(driver: string, config: Record<string, any>): IConnection {
    if (driver === "redis") {
      throw new Error("Redis requires async initialization");
    }

    this.createdConnections.push(config.host);
    return {
      host: config.host,
      port: config.port,
      connected: true,
      driver,
    };
  }

  protected async createDriverAsync(
    driver: string,
    config: Record<string, any>,
  ): Promise<IConnection> {
    // Simulate async connection establishment
    await new Promise((resolve) => setTimeout(resolve, 20));
    this.createdConnections.push(config.host);
    return {
      host: config.host,
      port: config.port,
      connected: true,
      driver,
    };
  }

  protected override onInstanceCreated(name: string, instance: IConnection): IConnection {
    return { ...instance, driver: `${instance.driver}@${name}` };
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MultipleInstanceManager Lifecycle (Feature)", () => {
  it("resolves the default connection on first access", () => {
    const manager = new DatabaseManager();
    const conn = manager.instance();

    expect(conn.host).toBe("localhost");
    expect(conn.port).toBe(5432);
    expect(conn.connected).toBe(true);
    expect(conn.driver).toBe("postgres@primary");
  });

  it("resolves named connections independently", () => {
    const manager = new DatabaseManager();
    const primary = manager.instance("primary");
    const replica = manager.instance("replica");

    expect(primary.host).toBe("localhost");
    expect(replica.host).toBe("replica.local");
    expect(primary).not.toBe(replica);
  });

  it("caches connections across multiple accesses", () => {
    const manager = new DatabaseManager();
    const first = manager.instance("primary");
    const second = manager.instance("primary");

    expect(first).toBe(second);
    expect(manager.createdConnections).toHaveLength(1);
  });

  it("supports changing the default connection at runtime", () => {
    const manager = new DatabaseManager();
    manager.setDefaultInstance("replica");

    const conn = manager.instance();
    expect(conn.host).toBe("replica.local");
  });

  it("throws for sync access to async-only drivers", () => {
    const manager = new DatabaseManager();
    expect(() => manager.instance("async_only")).toThrow("Redis requires async initialization");
  });

  it("resolves async-only drivers via instanceAsync", async () => {
    const manager = new DatabaseManager();
    const conn = await manager.instanceAsync("async_only");

    expect(conn.host).toBe("redis.local");
    expect(conn.port).toBe(6379);
    expect(conn.connected).toBe(true);
  });

  it("deduplicates concurrent async resolutions", async () => {
    const manager = new DatabaseManager();

    const [conn1, conn2, conn3] = await Promise.all([
      manager.instanceAsync("async_only"),
      manager.instanceAsync("async_only"),
      manager.instanceAsync("async_only"),
    ]);

    expect(conn1).toBe(conn2);
    expect(conn2).toBe(conn3);
    // Only one actual connection was created
    expect(manager.createdConnections.filter((h) => h === "redis.local")).toHaveLength(1);
  });

  it("supports custom driver registration via extend", () => {
    const manager = new DatabaseManager();
    manager.extend("sqlite", (config) => ({
      host: config.path ?? ":memory:",
      port: 0,
      connected: true,
      driver: "sqlite",
    }));

    // Manually add a config that uses the custom driver
    (manager as any).connectionConfigs = {
      ...(manager as any).connectionConfigs,
      local: { driver: "sqlite", path: "/tmp/test.db" },
    };

    const conn = manager.instance("local");
    expect(conn.host).toBe("/tmp/test.db");
    expect(conn.driver).toBe("sqlite@local");
  });

  it("forgets and re-creates instances", () => {
    const manager = new DatabaseManager();
    const first = manager.instance("primary");
    expect(manager.hasInstance("primary")).toBe(true);

    manager.forgetInstance("primary");
    expect(manager.hasInstance("primary")).toBe(false);

    const second = manager.instance("primary");
    expect(second).not.toBe(first);
    expect(manager.createdConnections).toHaveLength(2);
  });

  it("purges all cached instances", () => {
    const manager = new DatabaseManager();
    manager.instance("primary");
    manager.instance("replica");
    manager.instance("analytics");

    expect(manager.getResolvedInstances()).toHaveLength(3);

    manager.purge();
    expect(manager.getResolvedInstances()).toHaveLength(0);
  });

  it("applies onInstanceCreated hook to all instances", () => {
    const manager = new DatabaseManager();
    const primary = manager.instance("primary");
    const replica = manager.instance("replica");

    expect(primary.driver).toBe("postgres@primary");
    expect(replica.driver).toBe("postgres@replica");
  });

  it("full lifecycle: create → use → forget → re-create → purge", async () => {
    const manager = new DatabaseManager();

    // Phase 1: Create connections
    const primary = manager.instance("primary");
    await manager.instanceAsync("async_only");
    expect(manager.getResolvedInstances().sort()).toEqual(["async_only", "primary"]);

    // Phase 2: Use cached connections
    expect(manager.instance("primary")).toBe(primary);

    // Phase 3: Forget one
    manager.forgetInstance("primary");
    expect(manager.hasInstance("primary")).toBe(false);
    expect(manager.hasInstance("async_only")).toBe(true);

    // Phase 4: Re-create
    const newPrimary = manager.instance("primary");
    expect(newPrimary).not.toBe(primary);

    // Phase 5: Purge all
    manager.purge();
    expect(manager.getResolvedInstances()).toHaveLength(0);
  });
});
