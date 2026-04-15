/**
 * @fileoverview useFocusTrap — traps Tab/Shift+Tab focus within the active drawer.
 *
 * Implements WAI-ARIA Dialog focus management:
 * - On mount, moves focus to the first focusable element
 * - Tab/Shift+Tab cycles within the drawer boundary
 * - On unmount, restores focus to the trigger element
 *
 * @module drawer-stack/hooks/use-focus-trap
 */

import { useEffect, useRef, useCallback } from 'react';
import type React from 'react';
import { FOCUSABLE_SELECTOR } from '@/constants';
import { isVisible } from '@/utils';

/**
 * Trap keyboard focus within a container element.
 *
 * @remarks
 * Focus trapping only applies to DOM elements within the container ref.
 * Elements rendered via React portals outside the container are not included
 * by default. Use the `portalContainers` parameter to include additional
 * DOM nodes in the focusable element query.
 *
 * @template T - The HTML element type for the container ref.
 * @param isActive - Whether this drawer is the topmost (active) one.
 * @param enabled - Master toggle (false disables the trap entirely).
 * @param portalContainers - Additional DOM containers to include in focus cycling.
 * @returns A ref to attach to the container element.
 *
 * @example
 * ```tsx
 * function DrawerPanel({ isActive }: { isActive: boolean }) {
 *   const focusTrapRef = useFocusTrap<HTMLDivElement>(isActive);
 *   return <div ref={focusTrapRef}>...</div>;
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  enabled = true,
  portalContainers?: React.RefObject<HTMLElement | null>[]
) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  /** Get all focusable elements within the container and portal containers. */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    const containers: (HTMLElement | null)[] = [containerRef.current];
    if (portalContainers) {
      for (const ref of portalContainers) {
        if (ref.current) containers.push(ref.current);
      }
    }

    const elements: HTMLElement[] = [];
    for (const container of containers) {
      if (!container) continue;
      const found = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      elements.push(
        ...Array.from(found).filter(
          (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && isVisible(el)
        )
      );
    }
    return elements;
  }, [portalContainers]);

  // Trap Tab / Shift+Tab within the container
  useEffect(() => {
    if (!isActive || !enabled) return;

    /** Check if an element is inside the main container or any portal container. */
    const isInAnyContainer = (el: HTMLElement): boolean => {
      if (containerRef.current?.contains(el)) return true;
      if (portalContainers) {
        for (const ref of portalContainers) {
          if (ref.current?.contains(el)) return true;
        }
      }
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement;
      if (e.shiftKey) {
        if (active === first || !isInAnyContainer(active)) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (active === last || !isInAnyContainer(active)) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, enabled, getFocusableElements, portalContainers]);

  // Auto-focus first element on activation + restore on deactivation
  useEffect(() => {
    if (!isActive || !enabled) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    const timer = requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0]?.focus();
      } else {
        containerRef.current?.focus();
      }
    });
    return () => {
      cancelAnimationFrame(timer);
      // Restore focus to the element that was focused before this trap activated
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) {
        prev.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [isActive, enabled, getFocusableElements]);

  return containerRef;
}
