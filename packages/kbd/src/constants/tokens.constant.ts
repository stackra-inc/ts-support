/**
 * DI Tokens for @abdokouta/kbd
 *
 * |--------------------------------------------------------------------------
 * | Injection tokens for the KbdModule DI integration.
 * |--------------------------------------------------------------------------
 * |
 * @module @abdokouta/kbd
 */

/** Injection token for the KbdModule configuration. */
export const KBD_CONFIG = Symbol.for('KBD_CONFIG');

/** Injection token for the ShortcutRegistry singleton. */
export const SHORTCUT_REGISTRY = Symbol.for('SHORTCUT_REGISTRY');
