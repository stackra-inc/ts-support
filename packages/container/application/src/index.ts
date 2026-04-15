/**
 * @pixielity/application
 *
 * Application bootstrap layer for `@abdokouta/ts-container`.
 *
 * Provides `ApplicationContext.create(AppModule)` which:
 * 1. Scans the module tree (discovers all modules, providers, imports, exports)
 * 2. Instantiates all providers (resolves dependencies, creates instances)
 * 3. Runs lifecycle hooks (onModuleInit)
 *
 * The resulting ApplicationContext implements `IApplicationContext` (which
 * extends `ContainerResolver`), so it can be used standalone or passed to
 * `<ContainerProvider>` from `@abdokouta/ts-container/react`.
 *
 * @example
 * ```typescript
 * import 'reflect-metadata';
 * import { ApplicationContext } from '@pixielity/application';
 * import { AppModule } from './app.module';
 *
 * const app = await ApplicationContext.create(AppModule);
 *
 * // Use directly
 * const userService = app.get(UserService);
 *
 * // Or with React
 * import { ContainerProvider } from '@abdokouta/ts-container/react';
 *
 * ReactDOM.createRoot(root).render(
 *   <ContainerProvider context={app}>
 *     <App />
 *   </ContainerProvider>
 * );
 *
 * // Shutdown
 * await app.close();
 * ```
 *
 * @module @pixielity/application
 */

export { ApplicationContext } from './application-context';
export { bootstrapApp } from './bootstrap';
export type { BootstrapOptions } from './bootstrap';
export type { IApplicationContext } from './interfaces/application-context.interface';
