/**
 * @fileoverview DrawerStepper — step indicator for multi-step drawer flows.
 *
 * 3 variants: dots, numbered, progress.
 *
 * Slot positions:
 * - `drawer.stepper.before`
 * - `drawer.stepper.after`
 *
 * @module drawer-stack/components/drawer-stepper
 */

import React from 'react';
import { Slot } from '@/components/slot';
import { DRAWER_SLOTS } from '@/constants';

export interface DrawerStepperStep {
  label?: string;
}

export interface DrawerStepperProps {
  current: number;
  steps: number | DrawerStepperStep[];
  /** @default "dots" */
  variant?: 'dots' | 'numbered' | 'progress';
  className?: string;
}

export function DrawerStepper({
  current,
  steps,
  variant = 'dots',
  className,
}: DrawerStepperProps): React.JSX.Element {
  const total = typeof steps === 'number' ? steps : steps.length;
  const stepConfigs =
    typeof steps === 'number'
      ? Array.from({ length: steps }, (_, i) => ({ label: `Step ${i + 1}` }))
      : steps;

  const inner = (() => {
    if (variant === 'progress') {
      const pct = total > 1 ? ((current + 1) / total) * 100 : 100;
      return (
        <div className={`shrink-0 px-5 py-2.5 border-b border-separator ${className ?? ''}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Step {current + 1} of {total}
            </span>
            <span className="text-[10px] font-bold text-accent">{Math.round(pct)}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    }

    if (variant === 'numbered') {
      return (
        <div className={`shrink-0 px-5 py-3 border-b border-separator ${className ?? ''}`}>
          <div className="flex items-center gap-1">
            {stepConfigs.map((step, i) => {
              const isActive = i === current;
              const isDone = i < current;
              return (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`size-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${isActive ? 'bg-accent text-white' : isDone ? 'bg-accent/20 text-accent' : 'bg-muted/10 text-muted'}`}
                    >
                      {isDone ? (
                        <svg
                          className="size-2.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    {step.label && (
                      <span
                        className={`text-[10px] font-bold hidden sm:inline ${isActive ? 'text-foreground' : isDone ? 'text-accent' : 'text-muted'}`}
                      >
                        {step.label}
                      </span>
                    )}
                  </div>
                  {i < total - 1 && (
                    <div
                      className={`flex-1 h-px min-w-3 mx-1 ${i < current ? 'bg-accent/40' : 'bg-muted/15'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`shrink-0 flex items-center justify-center gap-1.5 py-2 border-b border-separator ${className ?? ''}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-200 ${i === current ? 'w-4 h-1.5 bg-accent' : i < current ? 'size-1.5 bg-accent/40' : 'size-1.5 bg-muted/20'}`}
          />
        ))}
      </div>
    );
  })();

  return (
    <>
      <Slot name={DRAWER_SLOTS.STEPPER.BEFORE} />
      {inner}
      <Slot name={DRAWER_SLOTS.STEPPER.AFTER} />
    </>
  );
}
