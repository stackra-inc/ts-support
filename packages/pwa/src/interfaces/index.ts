/**
 * @fileoverview Barrel export for all PWA interfaces.
 * @module pwa/interfaces
 */

// ─── Core PWA ──────────────────────────────────────────────────────
export type { PwaConfig } from './pwa-config.interface';
export type { PwaContextValue } from './pwa-context-value.interface';

// ─── App Shell ─────────────────────────────────────────────────────
export type { AppShellConfig } from './app-shell-config.interface';

// ─── Install Prompt ────────────────────────────────────────────────
export type { InstallPromptConfig } from './install-prompt-config.interface';
export type { InstallPromptContextValue } from './install-prompt-context-value.interface';

// ─── Update Prompt ─────────────────────────────────────────────────
export type { UpdatePromptConfig } from './update-prompt-config.interface';
export type { UpdatePromptContextValue } from './update-prompt-context-value.interface';

// ─── Offline / Network ─────────────────────────────────────────────
export type { NetworkStatus } from './network-status.interface';

// ─── Splash Screen ─────────────────────────────────────────────────
export type { SplashScreenConfig } from './splash-screen-config.interface';

// ─── Pull to Refresh ───────────────────────────────────────────────
export type { PullToRefreshConfig } from './pull-to-refresh-config.interface';
export type { UsePullToRefreshReturn } from './use-pull-to-refresh-return.interface';

// ─── Onboarding ────────────────────────────────────────────────────
export type { OnboardingConfig } from './onboarding-config.interface';
export type { OnboardingContextValue } from './onboarding-context.interface';
export type { OnboardingStepConfig } from './onboarding-step.interface';

// ─── Vite Plugin ────────────────────────────────────────────────────
export type { ManifestIcon } from './manifest-icon.interface';
export type { ManifestOptions } from './manifest-options.interface';
export type { RuntimeCachingEntry } from './runtime-caching-entry.interface';
export type { VitePwaPluginOptions } from './vite-pwa-plugin-options.interface';

// ─── Module Options (unified config) ───────────────────────────────
export type { PwaModuleOptions, OfflineIndicatorConfig } from './pwa-module-options.interface';
