/**
 * @fileoverview TransformerChain — executes transformers in priority order.
 *
 * A lightweight utility that stores transformers and runs ALL of them
 * in priority order, piping each transformer's output as the next one's
 * input (sequential composition).
 *
 * This is NOT a DI-managed service — it's a plain utility class meant
 * to be composed inside DI-managed registries or pipelines.
 *
 * @module @stackra/ts-support
 * @category Chains
 *
 * @example
 * ```typescript
 * import { TransformerChain } from "@stackra/ts-support";
 * import type { ITransformer } from "@stackra/contracts";
 *
 * interface Context { permissions: string[] }
 *
 * const chain = new TransformerChain<MenuItem[], Context>();
 *
 * chain.register({
 *   id: "permission",
 *   priority: 15,
 *   transform(items, ctx) {
 *     return items.filter((item) => {
 *       const required = item.meta?.permissions ?? [];
 *       return required.every((p) => ctx.permissions.includes(p));
 *     });
 *   },
 * });
 *
 * chain.register({
 *   id: "sort-alpha",
 *   priority: 50,
 *   transform(items) {
 *     return [...items].sort((a, b) => a.label.localeCompare(b.label));
 *   },
 * });
 *
 * const result = chain.run(menuItems, { permissions: ["admin"] });
 * ```
 */

import type { ITransformer } from "@stackra/contracts";

/**
 * Executes all transformers in priority order, composing sequentially.
 *
 * Every registered transformer runs — there is no short-circuiting.
 * Each transformer receives the output of the previous one.
 *
 * @typeParam TData - The data type being transformed (same for input and output)
 * @typeParam TContext - Additional context passed to every transformer
 */
export class TransformerChain<TData, TContext = void> {
  /** Internal storage keyed by id for O(1) dedup. */
  private readonly items = new Map<string, ITransformer<TData, TContext>>();

  /** Cached sorted array — invalidated on register/remove. */
  private sorted: ITransformer<TData, TContext>[] | null = null;

  /**
   * Register a transformer. Re-registering the same `id` replaces the
   * existing entry (allows apps to shadow built-in transformers).
   *
   * @param transformer - The transformer to register
   */
  public register(transformer: ITransformer<TData, TContext>): void {
    this.items.set(transformer.id, transformer);
    this.sorted = null;
  }

  /**
   * Register multiple transformers at once.
   *
   * @param transformers - Array of transformers to register
   */
  public registerMany(transformers: ITransformer<TData, TContext>[]): void {
    for (const transformer of transformers) {
      this.items.set(transformer.id, transformer);
    }
    this.sorted = null;
  }

  /**
   * Remove a transformer by id.
   *
   * @param id - The transformer id to remove
   * @returns `true` if the transformer existed and was removed
   */
  public remove(id: string): boolean {
    const removed = this.items.delete(id);
    if (removed) this.sorted = null;
    return removed;
  }

  /**
   * Check whether a transformer with the given id exists.
   *
   * @param id - The transformer id to check
   * @returns `true` if registered
   */
  public has(id: string): boolean {
    return this.items.has(id);
  }

  /**
   * Run all transformers in priority order.
   *
   * Each transformer receives the output of the previous one.
   * If no transformers are registered, returns the input unchanged.
   *
   * @param data - The initial data to transform
   * @param context - Context passed to every transformer
   * @returns The final transformed data
   */
  public run(data: TData, context: TContext): TData {
    const ordered = this.getOrdered();

    let current = data;
    for (const transformer of ordered) {
      current = transformer.transform(current, context);
    }

    return current;
  }

  /**
   * Get all transformers sorted by priority ascending.
   *
   * @returns Sorted array of transformers
   */
  public getOrdered(): ITransformer<TData, TContext>[] {
    if (!this.sorted) {
      this.sorted = [...this.items.values()].sort(
        (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
      );
    }
    return this.sorted;
  }

  /**
   * Get the number of registered transformers.
   *
   * @returns The count
   */
  public size(): number {
    return this.items.size;
  }

  /**
   * Remove all transformers.
   */
  public clear(): void {
    this.items.clear();
    this.sorted = null;
  }
}
