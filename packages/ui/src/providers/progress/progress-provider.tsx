/**
 * Progress Provider Component
 *
 * Wraps the BProgress provider to show a progress bar during page navigation.
 * Built on top of @bprogress/next for Next.js App Router integration.
 * Automatically uses the current theme's primary color and progress settings.
 *
 * @module providers/progress-provider
 */

'use client';

// import { useTheme } from '@abdokouta/react-theming';
import type { ProgressProviderProps } from '@bprogress/react';
import { ProgressProvider as BProgressProvider } from '@bprogress/react';

/**
 * ProgressProvider Component
 *
 * Provides a global progress bar for page navigation in Next.js applications.
 * Automatically shows progress during route transitions using the theme's primary color
 * and progress configuration.
 *
 * @example
 * ```tsx
 * // In your root layout - uses theme settings automatically
 * import { ProgressProvider } from '@pixielity/heroui';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ProgressProvider>
 *           {children}
 *         </ProgressProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom color override
 * <ProgressProvider color="#ff0080" height="4px">
 *   {children}
 * </ProgressProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Configure via theme
 * const customTheme = createTheme({
 *   name: "Custom",
 *   primary: "#FF5733",
 *   progress: {
 *     height: "4px",
 *     delay: 100,
 *     stopDelay: 200,
 *   }
 * });
 * ```
 */
export function ProgressProvider({
  children,
  color,
  height,
  disableSameURL,
  startPosition,
  delay,
  stopDelay,
  ...rest
}: ProgressProviderProps) {
  // Use default progress config
  const progressConfig = {
    color: color || '#3b82f6',
    height: height || '3px',
    disableSameURL: disableSameURL ?? true,
    startPosition: startPosition ?? 0.3,
    delay: delay ?? 0,
    stopDelay: stopDelay ?? 200,
  };

  return (
    <BProgressProvider {...progressConfig} {...rest}>
      {children}
    </BProgressProvider>
  );
}
