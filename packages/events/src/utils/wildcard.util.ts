/**
 * Wildcard Utility
 *
 * |--------------------------------------------------------------------------
 * | Wildcard Matching for Event Names
 * |--------------------------------------------------------------------------
 * |
 * | Matches event names against wildcard patterns using dot-separated
 * | segments. Supports two wildcard types:
 * |
 * |   `*`  — matches exactly ONE segment (between dots)
 * |   `**` — matches ONE OR MORE segments
 * |
 * | Compiled regexes are cached to avoid repeated compilation and
 * | protect against ReDoS on hot paths.
 * |
 * @module @pixielity/events
 * @category Utils
 *
 * @example
 * ```typescript
 * isWildcard('user.*');           // true
 * isWildcard('user.created');     // false
 *
 * matchesWildcard('user.*', 'user.created');          // true
 * matchesWildcard('user.*', 'user.profile.updated');  // false
 * matchesWildcard('user.**', 'user.profile.updated'); // true
 * matchesWildcard('*.created', 'user.created');       // true
 * ```
 */

/*
|--------------------------------------------------------------------------
| Regex Cache
|--------------------------------------------------------------------------
|
| Compiled regex patterns are cached in a Map to avoid re-compiling
| the same pattern on every dispatch. This is critical for performance
| in hot paths where the same wildcard patterns are matched repeatedly.
|
| The cache is bounded to MAX_CACHE_SIZE entries to prevent unbounded
| memory growth if patterns are generated dynamically.
|
*/

/** Maximum number of cached regex patterns. */
const MAX_CACHE_SIZE = 1000;

/** Cache of compiled wildcard patterns → RegExp. */
const regexCache = new Map<string, RegExp>();

/**
 * Returns `true` if the pattern contains a wildcard character (`*`).
 *
 * @param pattern - The event name or pattern to check.
 * @returns `true` if the pattern is a wildcard.
 */
export function isWildcard(pattern: string): boolean {
  return pattern.includes('*');
}

/**
 * Returns `true` if the concrete [eventName] matches the wildcard [pattern].
 *
 * |--------------------------------------------------------------------------
 * | Matching Rules
 * |--------------------------------------------------------------------------
 * |
 * |   `*`  — matches exactly one segment (between dots)
 * |          e.g. 'user.*' matches 'user.created' but NOT 'user.profile.updated'
 * |
 * |   `**` — matches one or more segments
 * |          e.g. 'user.**' matches 'user.created' AND 'user.profile.updated'
 * |
 * |   `*` and `**` can appear at any position:
 * |          '*.created'  matches 'user.created', 'order.created'
 * |          '**.deleted'  matches 'user.deleted', 'user.profile.deleted'
 * |
 *
 * @param pattern - The wildcard pattern (e.g. 'user.*', '*.created').
 * @param eventName - The concrete event name (e.g. 'user.created').
 * @returns `true` if the event name matches the pattern.
 */
export function matchesWildcard(pattern: string, eventName: string): boolean {
  /*
  |--------------------------------------------------------------------------
  | Fast paths — avoid regex for common cases.
  |--------------------------------------------------------------------------
  */

  // Exact match — no wildcard processing needed.
  if (pattern === eventName) return true;

  // Match-all wildcard — matches everything.
  if (pattern === '*' || pattern === '**') return true;

  /*
  |--------------------------------------------------------------------------
  | Compile and cache the regex.
  |--------------------------------------------------------------------------
  |
  | The pattern is converted to a regex:
  |   1. Escape dots (. → \.)
  |   2. Replace ** with a multi-segment wildcard (.+)
  |   3. Replace remaining * with a single-segment wildcard ([^.]+)
  |
  | Step 2 uses a placeholder to prevent step 3 from consuming the
  | asterisks that were part of **.
  |
  */
  let regex = regexCache.get(pattern);

  if (!regex) {
    const regexStr = pattern
      // Step 1: Escape dots.
      .replace(/\./g, '\\.')
      // Step 2: Replace ** with a placeholder (to protect from step 3).
      .replace(/\*\*/g, '__DOUBLE_STAR__')
      // Step 3: Replace remaining single * with single-segment wildcard.
      .replace(/\*/g, '([^.]+)')
      // Step 4: Replace placeholder with multi-segment wildcard.
      .replace(/__DOUBLE_STAR__/g, '(.+)');

    regex = new RegExp(`^${regexStr}$`);

    // Evict oldest entries if cache is full.
    if (regexCache.size >= MAX_CACHE_SIZE) {
      const firstKey = regexCache.keys().next().value;
      if (firstKey !== undefined) {
        regexCache.delete(firstKey);
      }
    }

    regexCache.set(pattern, regex);
  }

  return regex.test(eventName);
}

/**
 * Clears the internal regex cache.
 *
 * |--------------------------------------------------------------------------
 * | Useful for testing or when patterns change dynamically.
 * |--------------------------------------------------------------------------
 */
export function clearWildcardCache(): void {
  regexCache.clear();
}
