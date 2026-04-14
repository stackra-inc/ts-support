/**
 * @file pages/config.tsx
 * @description Config package showcase page.
 *
 * Demonstrates @abdokouta/ts-config:
 *   - Reading typed values (string, number, boolean, array, JSON)
 *   - Default values when a key is missing
 *   - Feature flags pattern
 *   - Live env var display
 */

import { useInject } from "@abdokouta/ts-container-react";
import { ConfigService } from "@abdokouta/ts-config";
import { Card, Chip, Separator } from "@heroui/react";

import { title, subtitle } from "@/components/primitives";

/** A single config entry shown in the UI. */
interface ConfigEntry {
  key: string;
  value: unknown;
  type: string;
  source: "env" | "default";
}

/** Derive a display type label from a JS value. */
function typeLabel(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";

  return typeof value;
}

export default function ConfigPage() {
  const config = useInject(ConfigService);

  const entries: ConfigEntry[] = [
    {
      key: "VITE_APP_NAME",
      value: config.get("VITE_APP_NAME", "Pixielity Vite"),
      type: "string",
      source: config.get("VITE_APP_NAME") ? "env" : "default",
    },
    {
      key: "VITE_APP_VERSION",
      value: config.get("VITE_APP_VERSION", "1.0.0"),
      type: "string",
      source: config.get("VITE_APP_VERSION") ? "env" : "default",
    },
    {
      key: "VITE_API_URL",
      value: config.get("VITE_API_URL", "https://api.example.com"),
      type: "string",
      source: config.get("VITE_API_URL") ? "env" : "default",
    },
    {
      key: "VITE_DEBUG",
      value: config.get("VITE_DEBUG", false),
      type: "boolean",
      source: config.get("VITE_DEBUG") !== undefined ? "env" : "default",
    },
    {
      key: "VITE_MAX_RETRIES",
      value: config.get("VITE_MAX_RETRIES", 3),
      type: "number",
      source: config.get("VITE_MAX_RETRIES") !== undefined ? "env" : "default",
    },
  ];

  const featureFlags = [
    { key: "VITE_FEATURE_DARK_MODE", label: "Dark Mode", default: true },
    { key: "VITE_FEATURE_ANALYTICS", label: "Analytics", default: false },
    { key: "VITE_FEATURE_BETA", label: "Beta Features", default: false },
  ];

  return (
    <section className="flex flex-col gap-8 py-8 md:py-10">
      {/* Header */}
      <div>
        <h1 className={title()}>Config Package</h1>
        <p className={subtitle({ class: "mt-2" })}>
          @abdokouta/ts-config — environment-aware configuration with typed access
        </p>
      </div>

      {/* Config entries */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Environment Variables</h2>
          <p className="text-sm text-default-500">
            Values read via ConfigService. Defaults shown when env var is not set.
          </p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <div
                key={entry.key}
                className="flex items-center justify-between rounded-lg border border-divider px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <code className="text-xs font-mono text-accent">{entry.key}</code>
                  <Chip color="default" size="sm" variant="soft">
                    {typeLabel(entry.value)}
                  </Chip>
                  <Chip
                    color={entry.source === "env" ? "success" : "warning"}
                    size="sm"
                    variant="soft"
                  >
                    {entry.source}
                  </Chip>
                </div>
                <span className="text-sm font-mono text-foreground">{String(entry.value)}</span>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Feature flags */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-1">
          <h2 className="text-lg font-semibold">Feature Flags</h2>
          <p className="text-sm text-default-500">Boolean config values used as feature toggles.</p>
        </Card.Header>
        <Separator />
        <Card.Content>
          <div className="flex flex-wrap gap-3">
            {featureFlags.map((flag) => {
              const enabled = config.get(flag.key, flag.default) as boolean;

              return (
                <div
                  key={flag.key}
                  className="flex items-center gap-2 rounded-lg border border-divider px-4 py-2"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${enabled ? "bg-success" : "bg-default-300"}`}
                  />
                  <span className="text-sm">{flag.label}</span>
                  <Chip color={enabled ? "success" : "default"} size="sm" variant="soft">
                    {enabled ? "on" : "off"}
                  </Chip>
                </div>
              );
            })}
          </div>
        </Card.Content>
      </Card>

      {/* Code snippet */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">How It Works</h2>
        </Card.Header>
        <Separator />
        <Card.Content>
          <pre className="overflow-x-auto rounded-lg bg-default-100 p-4 text-xs font-mono text-foreground">
            {`// In your AppModule:
ConfigModule.forRoot({ driver: 'env', isGlobal: true })

// In any component:
const config = useInject(ConfigService);
const apiUrl = config.get('VITE_API_URL', 'https://api.example.com');
const debug  = config.get('VITE_DEBUG', false);`}
          </pre>
        </Card.Content>
      </Card>
    </section>
  );
}
