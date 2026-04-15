/**
 * @fileoverview ModeSwitcher Component
 *
 * Toggle button cycling through light / dark / system modes.
 *
 * @module @abdokouta/react-theming
 * @category Components
 */

'use client';

import React, { createElement } from 'react';
import { Button } from '@heroui/react';
import { useColorMode } from '@/hooks/use-color-mode';
import type { ColorMode } from '@/types/theme.types';

export interface ModeSwitcherProps {
  /** Show label next to icon. @default false */
  showLabel?: boolean;
  className?: string;
}

const MODE_CYCLE: ColorMode[] = ['light', 'dark', 'system'];

const MODE_ICONS: Record<ColorMode, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
};

const MODE_LABELS: Record<ColorMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * ModeSwitcher
 *
 * Cycles light → dark → system on each press.
 * Use `ModeSelector` for an explicit dropdown.
 */
export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ showLabel = false, className }) => {
  const { mode, setMode } = useColorMode();
  const currentMode = mode || 'system';

  const next = () => {
    const idx = MODE_CYCLE.indexOf(currentMode);
    setMode(MODE_CYCLE[(idx + 1) % MODE_CYCLE.length]);
  };

  return createElement(
    Button,
    {
      variant: 'ghost',
      size: 'sm',
      onPress: next,
      'aria-label': `Switch color mode (current: ${currentMode})`,
      className,
    },
    MODE_ICONS[currentMode],
    showLabel ? ` ${MODE_LABELS[currentMode]}` : null
  );
};

ModeSwitcher.displayName = 'ModeSwitcher';
