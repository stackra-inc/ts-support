/**
 * Settings Configuration
 *
 * Default configuration for the settings package.
 *
 * @module @abdokouta/ts-settings
 */

import type { SettingsModuleOptions } from "@abdokouta/ts-settings";

export const defaultSettingsConfig: SettingsModuleOptions = {
  default: "memory",
  stores: {
    memory: { driver: "memory" },
  },
};
