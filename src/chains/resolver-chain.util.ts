/**
 * @fileoverview ResolverChain — executes resolvers in priority order.
 *
 * A lightweight utility that stores resolvers and runs them in priority
 * order, returning the first non-undefined result (short-circuit).
 *
 * This is NOT a DI-managed service — it's a plain utility class meant
 * to be composed inside DI-managed registries.
 *
 * @module @stackra/ts-support
 * @category Chains
 *
 * @example
 * ```typescript
 * import { ResolverChain } from "@stackra/ts-support";
 * import type { IResolver } from "@stackra/contracts";
 *
 * const chain = new ResolverChain<string, ReactNode>();
 *
 * chain.register({
 *   id: "lucide",
 *   priority: 10,
 *   resolve(name) {
 *     if (!name.startsWith("lucide:")) return undefined;
 *     return createElement(lucideIcons[name.slice(7)]);
 *   },
 * });
 *
 * chain.register({
 *   id: "emoji",
 *   priority: 50,
 *   resolve(name) {
 *     if (!name.startsWith("emoji:")) return undefined;
 *     return name.slice(6);
 *   },
 * });
 *
 * const icon = chain.resolve("lucide:home"); // → ReactNode
 * const emoji = chain.resolve("emoji:🛍");   // → "🛍"
 * const miss = chain.resolve("unknown");      // → undefined
 * ```
 */

import type { IResolver, IGuardedResolver } from "@stackra/contracts";

/**
 * Executes resolvers in priority order, short-circuiting on first match.
 *
 * Supports both plain `IResolver` and `IGuardedResolver` (with `match()`).
 * When a resolver has a `match()` method, it's called first — if it returns
 * `false`, `resolve()` is skipped entirely.
 *
 * @typeParam TInput - The input type passed to resolvers
 * @typeParam TOutput - The output type returned by resolvers
 */
export class ResolverChain<TInput = void, TOutput = unknown> {
  /** Internal storage keyed by id for O(1) dedup. */
  private readonly items = new Map<string, IResolver<TInput, TOutput>>();

  /** Cached sorted array — invalidated on register/remove. */
  private sorted: IResolver<TInput, TOutput>[] | null = null;

  /**
   * Register a resolver. Re-registering the same `id` replaces the
   * existing entry (allows apps to shadow built-in resolvers).
   *
   * @param resolver - The resolver to register
   */
  public register(resolver: IResolver<TInput, TOutput>): void {
    this.items.set(resolver.id, resolver);
    this.sorted = null;
  }

  /**
   * Register multiple resolvers at once.
   *
   * @param resolvers - Array of resolvers to register
   */
  public registerMany(resolvers: IResolver<TInput, TOutput>[]): void {
    for (const resolver of resolvers) {
      this.items.set(resolver.id, resolver);
    }
    this.sorted = null;
  }

  /**
   * Remove a resolver by id.
   *
   * @param id - The resolver id to remove
   * @returns `true` if the resolver existed and was removed
   */
  public remove(id: string): boolean {
    const removed = this.items.delete(id);
    if (removed) this.sorted = null;
    return removed;
  }

  /**
   * Check whether a resolver with the given id exists.
   *
   * @param id - The resolver id to check
   * @returns `true` if registered
   */
  public has(id: string): boolean {
    return this.items.has(id);
  }

  /**
   * Run the resolver chain. Returns the first non-undefined result.
   *
   * For `IGuardedResolver` entries, `match()` is called first — if it
   * returns `false`, `resolve()` is skipped.
   *
   * @param input - The input to resolve
   * @returns The first resolved value, or `undefined` if no resolver matched
   */
  public resolve(input: TInput): TOutput | undefined {
    const ordered = this.getOrdered();

    for (const resolver of ordered) {
      // If it's a guarded resolver, check match() first
      if (isGuarded(resolver) && !resolver.match(input)) {
        continue;
      }

      const result = resolver.resolve(input);
      if (result !== undefined) {
        return result;
      }
    }

    return undefined;
  }

  /**
   * Get all resolvers sorted by priority ascending.
   *
   * @returns Sorted array of resolvers
   */
  public getOrdered(): IResolver<TInput, TOutput>[] {
    if (!this.sorted) {
      this.sorted = [...this.items.values()].sort(
        (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
      );
    }
    return this.sorted;
  }

  /**
   * Get the number of registered resolvers.
   *
   * @returns The count
   */
  public size(): number {
    return this.items.size;
  }

  /**
   * Remove all resolvers.
   */
  public clear(): void {
    this.items.clear();
    this.sorted = null;
  }
}

/**
 * Type guard for IGuardedResolver.
 */
function isGuarded<TInput, TOutput>(
  resolver: IResolver<TInput, TOutput>,
): resolver is IGuardedResolver<TInput, TOutput> {
  return typeof (resolver as IGuardedResolver<TInput, TOutput>).match === "function";
}
