// @ts-nocheck
/**
 * @fileoverview DrawerContainer — renders stack entries as layered drawer panels.
 *
 * Responsive rendering:
 * - Desktop (≥768px): right-edge side panels with peek offsets
 * - Mobile (<768px): Vaul-style bottom sheets (full height, elastic drag,
 *   background scaling, nested displacement)
 *
 * @module drawer-stack/components/drawer-container
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDrawerStack } from '@/hooks';
import { useIsMobile } from '@/hooks';
import { usePreventScroll } from '@/hooks';
import { useFocusTrap } from '@/hooks';
import { useDrawerDrag } from '@/hooks';
import { DrawerPositionContext, DrawerIdContext } from '@/contexts/drawer-stack';
import { DRAWER_DEFAULTS } from '@/constants';
import { ENTER_MS, EXIT_MS, EASE, PEEK_PX } from '@/constants';
import type { DrawerEntry } from '@/interfaces';

// ─── Internal types & helpers ──────────────────────────────────────

interface VisualEntry {
  entry: DrawerEntry;
  isLeaving: boolean;
}

/** Vaul-style dampen for elastic rubber-band feel. */
function dampenValue(v: number) {
  return 8 * (Math.log(v + 1) - 2);
}

/** Vaul constants */
const VAUL_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const VAUL_DURATION = '500ms';
const NESTED_DISPLACEMENT = 16;
const WINDOW_TOP_OFFSET = 26;

/** Browser maximum z-index value. */
const MAX_Z_INDEX = 2147483647;

/**
 * Compute a clamped z-index for a drawer at the given stack index.
 */
function computeZIndex(index: number): number {
  const raw = DRAWER_DEFAULTS.BASE_Z_INDEX + index * DRAWER_DEFAULTS.Z_INDEX_STEP;
  return Math.min(raw, MAX_Z_INDEX);
}

// ─── Defensive wrapper access ──────────────────────────────────────

let wrapperWarned = false;

/**
 * Safely query the [data-drawer-wrapper] element.
 * Logs a dev-mode warning once if the element is missing.
 */
function getDrawerWrapper(): HTMLElement | null {
  const wrapper = document.querySelector('[data-drawer-wrapper]') as HTMLElement | null;
  if (!wrapper && !wrapperWarned) {
    wrapperWarned = true;
    try {
      // Dev-mode warning — stripped in production by bundlers
      if (typeof console !== 'undefined') {
        console.warn(
          '[DrawerStack] No element with `data-drawer-wrapper` attribute found. ' +
            'Add `data-drawer-wrapper` to your app wrapper element to enable background scaling on mobile.'
        );
      }
    } catch {}
  }
  return wrapper;
}

// ─── Desktop Panel ─────────────────────────────────────────────────

function DesktopPanel({
  entry,
  index,
  isActive,
  stackSize,
  isLeaving,
  peekOffset,
  onDismiss,
}: {
  entry: DrawerEntry;
  index: number;
  isActive: boolean;
  stackSize: number;
  isLeaving: boolean;
  peekOffset: number;
  onDismiss: () => Promise<boolean> | boolean;
}) {
  const [entered, setEntered] = useState(false);
  const afterOpenCalledRef = useRef(false);
  const w = entry.config.width ?? DRAWER_DEFAULTS.WIDTH;
  const ws = typeof w === 'number' ? `${w}px` : w;
  const z = computeZIndex(index);
  const isInteractive = isActive && !isLeaving;

  const focusTrapRef = useFocusTrap<HTMLDivElement>(isInteractive);
  const { dragRef, dragHandlers } = useDrawerDrag({
    enabled: isInteractive && entry.config.closeOnEscape !== false,
    onDismiss,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      (focusTrapRef as { current: HTMLDivElement | null }).current = node;
      (dragRef as { current: HTMLDivElement | null }).current = node;
    },
    [focusTrapRef, dragRef]
  );

  useEffect(() => {
    if (isLeaving) return;
    let r2: number;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [isLeaving]);

  // Fire onAfterOpen exactly once after enter animation completes
  useEffect(() => {
    if (entered && !isLeaving && !afterOpenCalledRef.current) {
      afterOpenCalledRef.current = true;
      entry.config.onAfterOpen?.();
    }
  }, [entered, isLeaving, entry.config]);

  const isRtl = entry.config.direction === 'rtl';
  const OFF_SCREEN = isRtl ? 'translateX(calc(-100% - 16px))' : 'translateX(calc(100% + 16px))';
  let tx: string, transition: string;
  if (isLeaving) {
    tx = OFF_SCREEN;
    transition = `transform ${EXIT_MS}ms ${EASE}`;
  } else if (entered) {
    tx = peekOffset > 0 ? `translateX(${isRtl ? '' : '-'}${peekOffset}px)` : 'translateX(0)';
    transition = `transform ${ENTER_MS}ms ${EASE}`;
  } else {
    tx = OFF_SCREEN;
    transition = `transform ${ENTER_MS}ms ${EASE}`;
  }

  const labelId = `drawer-label-${entry.config.id}`;
  const edgeClass = isRtl ? 'left-0' : 'right-0';
  const gripEdgeClass = isRtl
    ? 'absolute right-0 top-0 bottom-0 w-3 z-10 flex items-center justify-center group/grip cursor-grab active:cursor-grabbing'
    : 'absolute left-0 top-0 bottom-0 w-3 z-10 flex items-center justify-center group/grip cursor-grab active:cursor-grabbing';
  const gripBarClass = isRtl
    ? 'absolute inset-y-4 right-0 w-[3px] rounded-full bg-accent/0 group-hover/grip:bg-accent/30 transition-colors duration-200'
    : 'absolute inset-y-4 left-0 w-[3px] rounded-full bg-accent/0 group-hover/grip:bg-accent/30 transition-colors duration-200';

  return (
    <div
      ref={setRefs}
      role="dialog"
      dir={isRtl ? 'rtl' : undefined}
      aria-modal={isInteractive ? 'true' : undefined}
      aria-labelledby={labelId}
      aria-hidden={!isInteractive ? 'true' : undefined}
      tabIndex={isInteractive ? -1 : undefined}
      data-drawer-id={entry.config.id}
      data-drawer-active={isInteractive ? 'true' : 'false'}
      className={`fixed inset-y-0 ${edgeClass} m-2 h-[calc(100%-16px)] rounded-xl overflow-hidden bg-background flex flex-col shadow-xl`}
      style={{
        width: ws,
        zIndex: z,
        transform: tx,
        transition,
        pointerEvents: isInteractive ? 'auto' : 'none',
        touchAction: isInteractive ? 'none' : undefined,
      }}
      {...(isInteractive ? dragHandlers : {})}
    >
      {isInteractive && (
        <div className={gripEdgeClass} aria-hidden="true">
          <div className="flex flex-col gap-1 opacity-0 group-hover/grip:opacity-100 transition-opacity duration-200">
            <div className="w-1 h-1 rounded-full bg-muted/40" />
            <div className="w-1 h-1 rounded-full bg-muted/40" />
            <div className="w-1 h-1 rounded-full bg-muted/40" />
          </div>
          <div className={gripBarClass} />
        </div>
      )}
      <DrawerIdContext.Provider value={entry.config.id}>
        <DrawerPositionContext.Provider value={{ index, stackSize, isActive: isInteractive }}>
          <span id={labelId} className="sr-only">
            {(entry.config.metadata?.label as string) ?? `Panel ${entry.config.id}`}
          </span>
          <div className="flex-1 min-h-0 overflow-hidden">{entry.component}</div>
        </DrawerPositionContext.Provider>
      </DrawerIdContext.Provider>
      {!isActive && !isLeaving && (
        <div
          className="absolute inset-0 bg-black/30 pointer-events-none rounded-xl"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ─── Vaul-style Mobile Bottom Sheet ────────────────────────────────

function MobilePanel({
  entry,
  index,
  isActive,
  stackSize,
  isLeaving,
  onDismiss,
}: {
  entry: DrawerEntry;
  index: number;
  isActive: boolean;
  stackSize: number;
  isLeaving: boolean;
  onDismiss: () => void;
}) {
  const [entered, setEntered] = useState(false);
  const afterOpenCalledRef = useRef(false);
  const z = computeZIndex(index);
  const isInteractive = isActive && !isLeaving;
  const isNested = !isActive && !isLeaving;

  const focusTrapRef = useFocusTrap<HTMLDivElement>(isInteractive);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef(0);
  const isDragging = useRef(false);
  const isAllowedToDrag = useRef(false);
  const dragStartTime = useRef(0);

  // ── Snap points (Feature 1) ──
  const snapPoints = entry.config.snapPoints;
  const hasSnap = snapPoints && snapPoints.length > 0;
  const activeSnapIndex = useRef(0);

  /** Full sheet height in px (viewport minus safe-area offset). */
  const getFullHeight = useCallback(() => {
    return window.innerHeight - 14; // matches the CSS calc
  }, []);

  /** Height in px for a given snap-point fraction. */
  // @ts-expect-error unused
  const __snapHeight = useCallback(
    (fraction: number) => getFullHeight() * fraction,
    [getFullHeight]
  );

  const isRtl = entry.config.direction === 'rtl';

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      (focusTrapRef as { current: HTMLDivElement | null }).current = node;
      (panelRef as { current: HTMLDivElement | null }).current = node;
    },
    [focusTrapRef]
  );

  // ── Pointer-based drag (touch + mouse) ──

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isInteractive) return;
      const target = e.target as HTMLElement;
      if (
        target.closest('input, textarea, button, [role="button"], select, a, [data-drag-exclude]')
      )
        return;
      // Don't drag if scrollable content isn't at top
      let el = target;
      while (el && el !== panelRef.current) {
        if (el.scrollHeight > el.clientHeight && el.scrollTop > 0) return;
        // Horizontal scroll detection
        if (el.scrollWidth > el.clientWidth && el.scrollLeft > 0) return;
        el = el.parentElement as HTMLElement;
      }
      isDragging.current = true;
      isAllowedToDrag.current = false;
      pointerStart.current = e.pageY;
      dragStartTime.current = Date.now();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isInteractive]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current || !panelRef.current) return;
      const delta = e.pageY - pointerStart.current;

      if (!isAllowedToDrag.current) {
        if (Math.abs(delta) < 8) return;
        if (delta < 0 && !hasSnap) {
          isDragging.current = false;
          return;
        }
        isAllowedToDrag.current = true;
        panelRef.current.style.transition = 'none';
      }

      // Down: direct translate. Up: damped elastic rubber-band.
      const translateY = delta > 0 ? delta : dampenValue(Math.abs(delta)) * -1;
      panelRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;

      // Interactive background scale during drag
      const height = panelRef.current.offsetHeight;
      const pct = Math.max(0, Math.min(delta / height, 1));
      const wrapper = getDrawerWrapper();
      if (wrapper) {
        const baseScale = (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
        const scaleValue = Math.min(baseScale + pct * (1 - baseScale), 1);
        const borderRadius = Math.max(0, 8 - pct * 8);
        const translateUp = Math.max(0, 14 - pct * 14);
        wrapper.style.transition = 'none';
        wrapper.style.transform = `scale(${scaleValue}) translate3d(0, ${translateUp}px, 0)`;
        wrapper.style.borderRadius = `${borderRadius}px`;
      }
    },
    [hasSnap]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current || !panelRef.current) return;
      isDragging.current = false;
      if (!isAllowedToDrag.current) {
        isAllowedToDrag.current = false;
        return;
      }
      isAllowedToDrag.current = false;

      const delta = e.pageY - pointerStart.current;
      const velocity = Math.abs(delta) / (Date.now() - dragStartTime.current);

      const t = `transform ${VAUL_DURATION} ${VAUL_EASE}`;
      const tAll = `transform ${VAUL_DURATION} ${VAUL_EASE}, border-radius ${VAUL_DURATION} ${VAUL_EASE}`;
      const wrapper = getDrawerWrapper();

      // ── Snap-point logic ──
      if (hasSnap && snapPoints) {
        const full = getFullHeight();
        const currentSnapFraction = snapPoints[activeSnapIndex.current] ?? snapPoints[0]!;
        const currentH = full * currentSnapFraction!;
        // The drag delta translates to a new effective height
        const newH = currentH - delta; // dragging down reduces height
        const newFraction = newH / full;

        // Dismiss if below 15% of viewport
        if (newFraction < 0.15) {
          panelRef.current.style.transition = t;
          panelRef.current.style.transform = '';
          if (wrapper) wrapper.style.transition = tAll;
          onDismiss();
          return;
        }

        // Find nearest snap point
        let closestIdx = 0;
        let closestDist = Math.abs(snapPoints[0]! - newFraction);
        for (let i = 1; i < snapPoints.length; i++) {
          const dist = Math.abs(snapPoints[i]! - newFraction);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        }

        activeSnapIndex.current = closestIdx;
        const targetH = full * snapPoints[closestIdx]!;
        panelRef.current.style.transition = `transform ${VAUL_DURATION} ${VAUL_EASE}, height 300ms ${VAUL_EASE}`;
        panelRef.current.style.transform = 'translate3d(0, 0, 0)';
        panelRef.current.style.height = `${targetH}px`;
        panelRef.current.addEventListener(
          'transitionend',
          () => {
            if (panelRef.current) panelRef.current.style.transition = '';
          },
          { once: true }
        );
        if (wrapper) {
          const baseScale = (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
          wrapper.style.transition = tAll;
          wrapper.style.transform = `scale(${baseScale}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`;
          wrapper.style.borderRadius = '8px';
        }
        return;
      }

      // ── Default (no snap points) ──
      const height = panelRef.current.offsetHeight;
      const shouldClose = delta > height * 0.25 || velocity > 0.4;

      if (shouldClose) {
        panelRef.current.style.transition = t;
        panelRef.current.style.transform = '';
        if (wrapper) wrapper.style.transition = tAll;
        onDismiss();
      } else {
        // Snap back
        panelRef.current.style.transition = t;
        panelRef.current.style.transform = '';
        panelRef.current.addEventListener(
          'transitionend',
          () => {
            if (panelRef.current) panelRef.current.style.transition = '';
          },
          { once: true }
        );
        if (wrapper) {
          const baseScale = (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
          wrapper.style.transition = tAll;
          wrapper.style.transform = `scale(${baseScale}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`;
          wrapper.style.borderRadius = '8px';
        }
      }
    },
    [onDismiss, hasSnap, snapPoints, getFullHeight]
  );

  // Enter animation
  useEffect(() => {
    if (isLeaving) return;
    let r2: number;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [isLeaving]);

  // Fire onAfterOpen exactly once after enter animation completes
  useEffect(() => {
    if (entered && !isLeaving && !afterOpenCalledRef.current) {
      afterOpenCalledRef.current = true;
      entry.config.onAfterOpen?.();
    }
  }, [entered, isLeaving, entry.config]);

  // Set initial snap-point height after enter
  useEffect(() => {
    if (!hasSnap || !snapPoints || !panelRef.current || !entered || isLeaving) return;
    activeSnapIndex.current = 0;
    const h = getFullHeight() * snapPoints[0]!;
    panelRef.current.style.height = `${h}px`;
  }, [hasSnap, snapPoints, entered, isLeaving, getFullHeight]);

  // ResizeObserver for mobile bottom sheet dynamic content (Feature 3: animated height)
  useEffect(() => {
    if (!entry.config.observeResize || !contentRef.current || !panelRef.current) return;

    const el = contentRef.current;
    const panel = panelRef.current;
    const observer = new ResizeObserver(() => {
      const contentHeight = el.scrollHeight;
      const availableHeight = el.clientHeight;
      el.style.overflowY = contentHeight > availableHeight ? 'auto' : 'hidden';

      // Animated height transition for content changes
      panel.style.transition = `height 300ms ${VAUL_EASE}`;
      panel.addEventListener(
        'transitionend',
        () => {
          panel.style.transition = '';
        },
        { once: true }
      );
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [entry.config.observeResize]);

  // Nested displacement — scale down when another drawer is on top
  useEffect(() => {
    if (!panelRef.current || isLeaving) return;
    const el = panelRef.current;
    if (isNested && entered) {
      const scale = (window.innerHeight - NESTED_DISPLACEMENT) / window.innerHeight;
      el.style.transition = `transform ${VAUL_DURATION} ${VAUL_EASE}`;
      el.style.transform = `scale(${scale}) translate3d(0, -${NESTED_DISPLACEMENT}px, 0)`;
    } else if (isActive && entered && !isDragging.current) {
      el.style.transition = `transform ${VAUL_DURATION} ${VAUL_EASE}`;
      el.style.transform = 'translate3d(0, 0, 0)';
    }
  }, [isNested, isActive, entered, isLeaving]);

  let ty: string, transition: string;
  if (isLeaving) {
    ty = 'translate3d(0, 100%, 0)';
    transition = `transform ${VAUL_DURATION} ${VAUL_EASE}`;
  } else if (entered && isNested) {
    const scale = (window.innerHeight - NESTED_DISPLACEMENT) / window.innerHeight;
    ty = `scale(${scale}) translate3d(0, -${NESTED_DISPLACEMENT}px, 0)`;
    transition = `transform ${VAUL_DURATION} ${VAUL_EASE}`;
  } else if (entered) {
    ty = 'translate3d(0, 0, 0)';
    transition = `transform ${VAUL_DURATION} ${VAUL_EASE}`;
  } else {
    ty = 'translate3d(0, 100%, 0)';
    transition = `transform ${VAUL_DURATION} ${VAUL_EASE}`;
  }

  // Compute initial height — use first snap point if available, else full height
  const initialHeight =
    hasSnap && snapPoints
      ? `${getFullHeight() * snapPoints[0]!}px`
      : 'calc(100vh - env(safe-area-inset-top, 0px) - 14px)';

  const labelId = `drawer-label-${entry.config.id}`;

  return (
    <div
      ref={setRefs}
      role="dialog"
      dir={isRtl ? 'rtl' : undefined}
      aria-modal={isInteractive ? 'true' : undefined}
      aria-labelledby={labelId}
      aria-hidden={!isInteractive ? 'true' : undefined}
      tabIndex={isInteractive ? -1 : undefined}
      data-drawer-id={entry.config.id}
      data-drawer-active={isInteractive ? 'true' : 'false'}
      className="fixed inset-x-0 bottom-0 rounded-t-[10px] overflow-hidden bg-background flex flex-col"
      style={{
        height: initialHeight,
        maxHeight: '97vh',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: z,
        transform: ty,
        transition,
        pointerEvents: isInteractive ? 'auto' : 'none',
        touchAction: 'none',
        willChange: 'transform',
      }}
      onPointerDown={isInteractive ? onPointerDown : undefined}
      onPointerMove={isInteractive ? onPointerMove : undefined}
      onPointerUp={isInteractive ? onPointerUp : undefined}
    >
      <DrawerIdContext.Provider value={entry.config.id}>
        <DrawerPositionContext.Provider value={{ index, stackSize, isActive: isInteractive }}>
          <span id={labelId} className="sr-only">
            {(entry.config.metadata?.label as string) ?? `Panel ${entry.config.id}`}
          </span>
          <div ref={contentRef} className="flex-1 min-h-0 overflow-hidden">
            {entry.component}
          </div>
        </DrawerPositionContext.Provider>
      </DrawerIdContext.Provider>
      {isNested && (
        <div
          className="absolute inset-0 bg-black/30 pointer-events-none rounded-t-[10px]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ─── Main Container ────────────────────────────────────────────────

export function DrawerContainer(): React.JSX.Element | null {
  const { stack, isOpen, activeDrawer, operations, enableKeyboardNavigation } = useDrawerStack();
  const isMobile = useIsMobile();

  const [visual, setVisual] = useState<VisualEntry[]>([]);
  const prevStackRef = useRef<ReadonlyArray<DrawerEntry>>([]);
  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Sync visual entries with stack
  useEffect(() => {
    prevStackRef.current = stack;
    setVisual((oldVisual) => {
      const currById = new Map(stack.map((e) => [e.config.id, e]));
      const next: VisualEntry[] = [];
      for (const entry of stack) next.push({ entry, isLeaving: false });
      for (const ve of oldVisual) {
        const stillInStack = currById.has(ve.entry.config.id);
        if (!stillInStack && !ve.isLeaving) {
          next.push({ entry: ve.entry, isLeaving: true });
          const id = ve.entry.instanceId;
          if (!exitTimers.current.has(id)) {
            const closeCb = ve.entry.config.onAfterClose;
            exitTimers.current.set(
              id,
              setTimeout(() => {
                exitTimers.current.delete(id);
                closeCb?.();
                setVisual((v) => v.filter((x) => x.entry.instanceId !== id));
              }, 550)
            );
          }
        } else if (ve.isLeaving) {
          if (!next.some((n) => n.entry.instanceId === ve.entry.instanceId)) next.push(ve);
        }
      }
      return next;
    });
  }, [stack]);

  useEffect(
    () => () => {
      for (const t of exitTimers.current.values()) clearTimeout(t);
      exitTimers.current.clear();
    },
    []
  );

  const hasAny = visual.length > 0;
  usePreventScroll(hasAny);

  // ── Vaul-style background scale (mobile only) ──
  useEffect(() => {
    if (!isMobile) return;
    const wrapper = getDrawerWrapper();
    if (!wrapper) return;

    if (isOpen) {
      const scale = (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
      wrapper.style.transformOrigin = 'top';
      wrapper.style.transitionProperty = 'transform, border-radius';
      wrapper.style.transitionDuration = VAUL_DURATION;
      wrapper.style.transitionTimingFunction = VAUL_EASE;
      wrapper.style.transform = `scale(${scale}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`;
      wrapper.style.borderRadius = '8px';
      wrapper.style.overflow = 'hidden';
      document.body.style.background = 'black';
    } else {
      wrapper.style.transitionProperty = 'transform, border-radius';
      wrapper.style.transitionDuration = VAUL_DURATION;
      wrapper.style.transitionTimingFunction = VAUL_EASE;
      wrapper.style.transform = '';
      wrapper.style.borderRadius = '';
      wrapper.style.overflow = '';
      const t = setTimeout(() => {
        document.body.style.removeProperty('background');
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMobile]);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (e.defaultPrevented) return; // Respect nested handlers (modals, popovers)
      if (activeDrawer?.config.closeOnEscape === false) return;
      e.preventDefault();
      e.stopPropagation();
      void operations.pop();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, activeDrawer, operations]);

  // Keyboard navigation: Ctrl+Tab cycling, Ctrl+Shift+Tab reverse, Ctrl+1..9 direct access
  useEffect(() => {
    if (!enableKeyboardNavigation || !isOpen || stack.length < 2) return;

    const handler = (e: KeyboardEvent) => {
      // Ctrl+Tab / Ctrl+Shift+Tab — cycle drawers
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        const currentIdx = stack.length - 1;

        if (e.shiftKey) {
          // Previous: wrap to end if at start
          const prevIdx = currentIdx === 0 ? stack.length - 1 : currentIdx - 1;
          operations.bringToTop(stack[prevIdx].config.id);
        } else {
          // Next: bring the bottom-most to top to cycle
          const nextIdx = 0;
          operations.bringToTop(stack[nextIdx].config.id);
        }
        return;
      }

      // Ctrl+1..9 — direct access
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const pos = parseInt(e.key, 10); // 1-based
        if (pos <= stack.length) {
          operations.bringToTop(stack[pos - 1].config.id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [enableKeyboardNavigation, isOpen, stack, operations]);

  // Focus restoration
  const triggerRef = useRef<Element | null>(null);
  useEffect(() => {
    if (isOpen && stack.length > 0) triggerRef.current = stack[stack.length - 1].triggerElement;
    if (!isOpen && visual.every((v) => v.isLeaving) && triggerRef.current) {
      (triggerRef.current as HTMLElement).focus?.();
      triggerRef.current = null;
    }
  }, [isOpen, stack, visual]);

  // Screen reader
  useEffect(() => {
    if (!isOpen) return;
    const el = document.getElementById('drawer-stack-live');
    if (el && activeDrawer)
      el.textContent = `${(activeDrawer.config.metadata?.label as string) ?? activeDrawer.config.id} panel opened`;
  }, [isOpen, activeDrawer]);

  if (!hasAny) return null;

  const activeEntries = visual.filter((v) => !v.isLeaving);
  const activeCount = activeEntries.length;

  // Desktop peek offsets
  const peekOffsets = new Map<string, number>();
  if (!isMobile) {
    for (let i = 0; i < activeCount; i++) {
      if (i === activeCount - 1) {
        peekOffsets.set(activeEntries[i].entry.instanceId, 0);
      } else {
        let offset = 0;
        for (let j = activeCount - 1; j > i; j--) {
          const myW = (activeEntries[j - 1]?.entry.config.width ?? DRAWER_DEFAULTS.WIDTH) as number;
          const aboveW = (activeEntries[j].entry.config.width ?? DRAWER_DEFAULTS.WIDTH) as number;
          offset += PEEK_PX + Math.max(0, aboveW - myW);
        }
        peekOffsets.set(activeEntries[i].entry.instanceId, offset);
      }
    }
  }

  return (
    <>
      <div
        id="drawer-stack-live"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-all"
        style={{
          zIndex: DRAWER_DEFAULTS.BASE_Z_INDEX - 1,
          opacity: isOpen ? 1 : 0,
          backgroundColor: isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
          backdropFilter: isOpen && !isMobile ? 'blur(4px)' : 'blur(0px)',
          WebkitBackdropFilter: isOpen && !isMobile ? 'blur(4px)' : 'blur(0px)',
          transitionDuration: VAUL_DURATION,
          transitionTimingFunction: VAUL_EASE,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={() => void operations.pop()}
        aria-hidden="true"
      />

      {/* Panels */}
      {visual.map((ve, visualIndex) => {
        const activeIndex = activeEntries.indexOf(ve);
        const idx = ve.isLeaving ? visual.length + visualIndex : activeIndex;
        const isActivePanel = !ve.isLeaving && activeIndex === activeCount - 1;

        if (isMobile) {
          return (
            <MobilePanel
              key={ve.entry.instanceId}
              entry={ve.entry}
              index={idx}
              isActive={isActivePanel}
              stackSize={activeCount}
              isLeaving={ve.isLeaving}
              onDismiss={() => void operations.pop()}
            />
          );
        }
        return (
          <DesktopPanel
            key={ve.entry.instanceId}
            entry={ve.entry}
            index={idx}
            isActive={isActivePanel}
            stackSize={activeCount}
            isLeaving={ve.isLeaving}
            peekOffset={peekOffsets.get(ve.entry.instanceId) ?? 0}
            onDismiss={() => operations.pop()}
          />
        );
      })}
    </>
  );
}
