import React from 'react';
import { Kbd } from '@heroui/react';

import type { RefineKbdProps } from '@/types';
import { getKeyMapping, isKeyValue } from '@/utils/key-mappings.util';

/**
 * RefineKbd Component
 *
 * A wrapper component around HeroUI's Kbd component that provides a simplified API
 * for displaying keyboard shortcuts in refine applications.
 *
 * This component automatically handles the rendering of keyboard key combinations
 * with proper symbols, accessibility attributes, and styling.
 *
 * @example
 * Basic usage with modifier keys:
 * ```tsx
 * <RefineKbd keys={["command", "K"]} />
 * ```
 *
 * @example
 * Multiple keys with custom separator:
 * ```tsx
 * <RefineKbd
 *   keys={["ctrl", "shift", "P"]}
 *   separator=" + "
 * />
 * ```
 *
 * @example
 * Light variant:
 * ```tsx
 * <RefineKbd
 *   keys={["alt", "F4"]}
 *   variant="light"
 * />
 * ```
 *
 * @param props - Component props
 * @returns A rendered keyboard shortcut display
 *
 * @category Components
 * @public
 */
export const RefineKbd: React.FC<RefineKbdProps> = ({
  keys,
  variant = 'default',
  separator = '+',
  className,
}) => {
  // If no keys provided, return null
  if (!keys || keys.length === 0) {
    return null;
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}
    >
      {keys.map((key, index) => {
        const keyMapping = getKeyMapping(key);
        const isModifier = isKeyValue(key);

        return (
          <React.Fragment key={`${key}-${index}`}>
            <Kbd variant={variant}>
              {isModifier ? (
                <Kbd.Abbr keyValue={key as any} title={keyMapping.title}>
                  {keyMapping.symbol}
                </Kbd.Abbr>
              ) : (
                <Kbd.Content>{keyMapping.symbol}</Kbd.Content>
              )}
            </Kbd>
            {index < keys.length - 1 && <span style={{ margin: '0 0.125rem' }}>{separator}</span>}
          </React.Fragment>
        );
      })}
    </span>
  );
};

// Add display name for better debugging
RefineKbd.displayName = 'RefineKbd';
