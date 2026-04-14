/**
 * @file pages/logger.tsx
 * @description Logger package showcase page.
 *
 * Demonstrates @abdokouta/ts-logger:
 *   - All log levels (debug, info, warn, error, fatal)
 *   - Contextual logging (withContext)
 *   - useLogger() React hook
 *   - Live log feed rendered in the UI
 */

import React, { useState, useCallback } from "react";
import { useLogger, LogLevel } from "@abdokouta/ts-logger";
import { Card, Chip, Separator, Button } from "@heroui/react";

import { title, subtitle } from "@/components/primitives";

/** A captured log entry for display in the UI. */
interface LogEntry {
  id: number;
  level: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const LEVEL_COLORS: Record<string, "default" | "accent" | "warning" | "danger" | "success"> = {
  debug: "default",
  info: "accent",
  warn: "warning",
  error: "danger",
  fatal: "danger",
};

export default function LoggerPage() {
  const logger = useLogger();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  let counter = 0;

  const capture = useCallback(
    (level: string, message: string, context?: Record<string, unknown>) => {
      setLogs((prev) => [
        {
          id: ++counter,
          level,
          message,
          context,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 49),
      ]);
    },
    [],
  );

  function logAllLevels() {
    logger.debug("Debug: detailed diagnostic information");
    logger.info("Info: application started successfully");
    logger.warn("Warn: deprecated API endpoint called");
    logger.error("Error: failed to fetch user data");
    logger.fatal("Fatal: database connection lost");

    capture("debug", "Debug: detailed diagnostic information");
    capture("info", "Info: application started successfully");
    capture("warn", "Warn: deprecated API endpoint called");
    capture("error", "Error: failed to fetch user data");
    capture("fatal", "Fatal: database connection lost");
  }

  function logWithContext() {
    const ctx = { userId: 42, requestId: "req-abc123", ip: "192.168.1.1" };

    logger.withContext(ctx).info("User authenticated", ctx);
    capture("info", "User authenticated", ctx);

    const orderCtx = { orderId: 789, amount: 99.99, currency: "USD" };

    logger.withContext(orderCtx).info("Order placed", orderCtx);
    capture("info", "Order placed", orderCtx);
  }

  function logPerformance() {
    const start = performance.now();
    const arr = Array.from({ length: 10_000 }, (_, i) => i * 2);
    const duration = Math.round(performance.now() - start);
    const ctx = { task: "array-generation", items: arr.length, durationMs: duration };

    logger.info("Task completed", ctx);
    capture("info", "Task completed", ctx);
  }

  function logError() {
    try {
      throw new Error("Simulated runtime error");
    } catch (err) {
      const ctx = {
        error: (err as Error).message,
        stack: (err as Error).stack?.split("\n")[1]?.trim(),
      };

      logger.error("Caught exception", ctx);
      capture("error", "Caught exception", ctx);
    }
  }

  function logFeatureFlag() {
    const flags = { darkMode: true, beta: false, analytics: true };

    logger.info("Feature flags evaluated", flags);
    capture("info", "Feature flags evaluated", flags);
  }

  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      {/* Header */}
      <div>
        <h1 className={title()}>Logger Package</h1>
        <p className={subtitle({ class: "mt-2" })}>
          @abdokouta/ts-logger — structured logging with channels and context
        </p>
      </div>

      {/* Log level reference */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Log Levels</h2>
          <p className="text-sm text-default-500">
            Five severity levels from least to most critical.
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            {(["debug", "info", "warn", "error", "fatal"] as const).map((level) => (
              <div
                key={level}
                className="flex items-center gap-2 rounded-lg border border-divider px-3 py-2"
              >
                <Chip color={LEVEL_COLORS[level]} size="sm" variant="soft">
                  {level}
                </Chip>
                <span className="text-xs text-default-500">
                  {LogLevel[level.toUpperCase() as keyof typeof LogLevel]}
                </span>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Action buttons */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Trigger Logs</h2>
          <p className="text-sm text-default-500">
            Click to emit logs — they appear in the feed below and in the browser console.
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            <Button variant="tertiary" onPress={logAllLevels}>
              All Levels
            </Button>
            <Button variant="secondary" onPress={logWithContext}>
              With Context
            </Button>
            <Button variant="tertiary" onPress={logPerformance}>
              Performance
            </Button>
            <Button variant="danger-soft" onPress={logError}>
              Error + Stack
            </Button>
            <Button variant="tertiary" onPress={logFeatureFlag}>
              Feature Flags
            </Button>
            <Button variant="outline" onPress={() => setLogs([])}>
              Clear Feed
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Live log feed */}
      <Card>
        <Card.Header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Live Log Feed</h2>
            <p className="text-sm text-default-500">{logs.length} entries (last 50 kept)</p>
          </div>
          <Chip color={logs.length > 0 ? "success" : "default"} size="sm" variant="primary">
            {logs.length > 0 ? "active" : "idle"}
          </Chip>
        </Card.Header>
        <Separator />
        <Card.Content>
          {logs.length === 0 ? (
            <p className="text-center text-sm text-default-400 py-8">
              No logs yet — click a button above to emit some.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg bg-default-50 border border-divider p-3 font-mono text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Chip color={LEVEL_COLORS[log.level] ?? "default"} size="sm" variant="soft">
                      {log.level}
                    </Chip>
                    <span className="text-default-400">{log.timestamp}</span>
                  </div>
                  <p className="text-foreground">{log.message}</p>
                  {log.context && (
                    <pre className="mt-1 text-default-500 text-xs overflow-x-auto">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </section>
  );
}
