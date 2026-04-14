/**
 * @file provider.tsx
 * @description App shell — wraps all pages with navbar, layout, and footer.
 *
 * The DI container (ContainerProvider) is set up in main.tsx.
 * This component provides the visual shell that every page shares.
 */

import * as React from "react";

import { Navbar } from "@/components/navbar";
import { GlobalShortcuts } from "@/components/global-shortcuts";

export interface ProviderProps {
  children: React.ReactNode;
}

/**
 * Provider — app shell with navbar, content area, and footer.
 *
 * Every page is rendered inside this shell. Pages don't need to
 * wrap themselves with DefaultLayout anymore.
 */
export function Provider({ children }: ProviderProps) {
  return (
    <div className="relative flex flex-col h-screen">
      <GlobalShortcuts />
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">{children}</main>
      <footer className="w-full flex items-center justify-center py-3">
        <span className="text-sm text-muted">Pixielity © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
