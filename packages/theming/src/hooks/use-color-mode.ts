/**
 * @fileoverview useColorMode Hook
 *
 * Access and control the color mode (dark / light / system).
 *
 * @module @abdokouta/react-theming
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { mode, setMode, resolvedMode, isDark } = useColorMode();
 * ```
 */

'use client';

import { useThemeContext } from '@/contexts/theme.context';
import type { ColorMode } from '@/types/theme.types';

export interface UseColorModeReturn {
  /** Current mode setting (may be "system") */
  mode: ColorMode | undefined;
  /** Set the color mode */
  setMode: (mode: ColorMode) => void;
  /** Resolved mode — always "light" or "dark", never "system" */
  resolvedMode: 'light' | 'dark';
  /** Convenience: true when resolved mode is dark */
  isDark: boolean;
  /** Convenience: true when resolved mode is light */
  isLight: boolean;
  /** Toggle between dark and light */
  toggle: () => void;
}

export function useColorMode(): UseColorModeReturn {
  const { mode, setMode, resolvedMode } = useThemeContext();

  const toggle = () => setMode(resolvedMode === 'dark' ? 'light' : 'dark');

  return {
    mode,
    setMode,
    resolvedMode,
    isDark: resolvedMode === 'dark',
    isLight: resolvedMode === 'light',
    toggle,
  };
}
