/**
 * bootstrapApp — convenience factory for creating an ApplicationContext.
 *
 * |--------------------------------------------------------------------------
 * | Handles the full bootstrap sequence:
 * |   1. Creates the ApplicationContext from the root module
 * |   2. Exposes it on window.__APP_CONTEXT__ in dev mode
 * |   3. Returns the context ready for ContainerProvider
 * |--------------------------------------------------------------------------
 *
 * @example
 * ```tsx
 * // main.tsx
 * import { bootstrapApp } from '@abdokouta/ts-application';
 * import { ContainerProvider } from '@abdokouta/ts-container-react';
 * import { AppModule } from './app.module';
 *
 * const app = await bootstrapApp(AppModule);
 *
 * ReactDOM.createRoot(root).render(
 *   <ContainerProvider context={app}>
 *     <App />
 *   </ContainerProvider>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // With options
 * const app = await bootstrapApp(AppModule, {
 *   debug: true,
 *   globalName: '__MY_APP__',
 *   onReady: (ctx) => console.log('App ready!', ctx),
 * });
 * ```
 *
 * @module @abdokouta/ts-application
 */

import type { Type } from '@abdokouta/ts-container';
import { ApplicationContext } from './application-context';

/**
 * Options for bootstrapApp().
 */
export interface BootstrapOptions {
  /**
   * Expose the context on window for debugging.
   * Defaults to true in development (import.meta.env.DEV or NODE_ENV !== 'production').
   */
  debug?: boolean;

  /**
   * The global variable name to expose the context on.
   * @default '__APP_CONTEXT__'
   */
  globalName?: string;

  /**
   * Callback fired after the context is created and ready.
   * Use for logging, analytics, or additional setup.
   */
  onReady?: (app: ApplicationContext) => void | Promise<void>;
}

/**
 * Bootstrap the DI container from a root module.
 *
 * Creates an ApplicationContext, optionally exposes it for debugging,
 * and returns it ready for use with ContainerProvider.
 *
 * @param rootModule - The root module class (your AppModule)
 * @param options - Optional bootstrap configuration
 * @returns The bootstrapped ApplicationContext
 */
export async function bootstrapApp(
  rootModule: Type<any>,
  options: BootstrapOptions = {}
): Promise<ApplicationContext> {
  const { debug, globalName = '__APP_CONTEXT__', onReady } = options;

  /*
  |--------------------------------------------------------------------------
  | Create the application context.
  |--------------------------------------------------------------------------
  |
  | This scans the module tree, resolves all providers, and calls
  | onModuleInit() lifecycle hooks.
  |
  */
  const app = await ApplicationContext.create(rootModule);

  /*
  |--------------------------------------------------------------------------
  | Debug: expose on window.
  |--------------------------------------------------------------------------
  |
  | In development, the context is available at window.__APP_CONTEXT__
  | (or a custom name) for debugging in the browser console.
  |
  */
  const isDev =
    debug ?? (typeof process !== 'undefined' ? process.env?.NODE_ENV !== 'production' : true);

  if (isDev && typeof window !== 'undefined') {
    (window as any)[globalName] = app;
  }

  /*
  |--------------------------------------------------------------------------
  | onReady callback.
  |--------------------------------------------------------------------------
  */
  if (onReady) {
    await onReady(app);
  }

  return app;
}
