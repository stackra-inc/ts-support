/**
 * @fileoverview Chain utilities — resolver and transformer execution.
 *
 * Provides two lightweight chain classes for the two fundamental
 * patterns used across the monorepo:
 *
 * - **ResolverChain** — first match wins (short-circuit)
 * - **TransformerChain** — all run in sequence (compose)
 *
 * @module @stackra/ts-support
 * @category Chains
 */

export { ResolverChain } from "./resolver-chain.util";
export { TransformerChain } from "./transformer-chain.util";
