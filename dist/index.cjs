'use strict';

var collectJs = require('collect.js');
var pacer = require('@tanstack/pacer');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var collectJs__default = /*#__PURE__*/_interopDefault(collectJs);

/**
 * @stackra/ts-support v2.7.0
 * (c) 2026 [object Object]
 * @license MIT
 */

// src/services/env.service.ts
var TRUTHY_VALUES = /* @__PURE__ */ new Set(["true", "1", "yes", "on"]);
var FALSY_VALUES = /* @__PURE__ */ new Set(["false", "0", "no", "off", ""]);
var NULL_VALUES = /* @__PURE__ */ new Set(["null", "(null)", "none", "(empty)", "undefined"]);
var Env = class _Env {
  static {
    // ── Repository ──────────────────────────────────────────────────────────
    /**
     * The active environment variable repository.
     *
     * Defaults to `null` (lazy-initialized on first access).
     * Override via `Env.setRepository()` for custom sources.
     */
    this._repository = null;
  }
  /**
   * Get the current repository, initializing lazily on first access.
   */
  static get repository() {
    if (_Env._repository === null) {
      _Env._repository = _Env.detectRepository();
    }
    return _Env._repository;
  }
  /**
   * Set the repository directly.
   */
  static set repository(value) {
    _Env._repository = value;
  }
  /**
   * Auto-detect the best available environment repository.
   *
   * Detection order:
   * 1. **Vite** — `import.meta.env` (browser and SSR builds)
   * 2. **Node.js / Bun / Deno** — `process.env`
   * 3. **Fallback** — empty object
   *
   * Vite is checked first because in SSR mode both `import.meta.env`
   * and `process.env` are available, but Vite's env contains the
   * `VITE_*` variables that application code expects.
   *
   * @returns The detected environment repository
   */
  static detectRepository() {
    try {
      if (typeof ({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href)) }) !== "undefined" && undefined) {
        return undefined;
      }
    } catch {
    }
    if (typeof process !== "undefined" && process.env) {
      return process.env;
    }
    return {};
  }
  /**
   * Replace the environment repository.
   *
   * Call this once during application bootstrap to point Env at the
   * correct source. Common use cases:
   *
   * - **Vite**: `Env.setRepository(import.meta.env)`
   * - **Testing**: `Env.setRepository({ APP_DEBUG: 'true' })`
   *
   * @param repo - The new environment variable source
   *
   * @example
   * ```typescript
   * // In your Vite app's main.ts
   * import { Env } from '@stackra/ts-support';
   * Env.setRepository(import.meta.env);
   * ```
   */
  static setRepository(repo) {
    _Env.repository = repo;
  }
  /**
   * Get the current environment repository.
   *
   * Useful for debugging or passing the repository to other systems.
   *
   * @returns The active environment variable source
   */
  static getRepository() {
    return _Env.repository;
  }
  // ── Core Getters ────────────────────────────────────────────────────────
  /**
   * Get an environment variable value with optional default.
   *
   * Returns the raw string value from the repository. If the variable
   * is not set (or is a null-like value such as `'(null)'`), returns
   * the provided default.
   *
   * @typeParam T - The type of the default value
   * @param key      - Environment variable name (e.g., `'APP_NAME'`)
   * @param fallback - Value to return if the variable is not set
   * @returns The environment value or the fallback
   *
   * @example
   * ```typescript
   * Env.get('APP_NAME');              // string | undefined
   * Env.get('APP_NAME', 'Stackra');   // string
   * Env.get('APP_DEBUG', false);      // string | false
   * ```
   */
  static get(key, fallback) {
    const raw = _Env.repository[key];
    if (raw === void 0) {
      return fallback;
    }
    if (NULL_VALUES.has(raw.toLowerCase())) {
      return fallback;
    }
    return _Env.stripQuotes(raw);
  }
  /**
   * Get an environment variable or throw if it's missing.
   *
   * Use this for variables that are absolutely required for the
   * application to function (e.g., API keys, database URLs).
   *
   * @param key - Environment variable name
   * @returns The environment value as a string
   * @throws {Error} If the variable is not set or is a null-like value
   *
   * @example
   * ```typescript
   * const secret = Env.getOrFail('APP_SECRET');
   * // Throws: "Environment variable "APP_SECRET" is required but not set."
   * ```
   */
  static getOrFail(key) {
    const value = _Env.get(key);
    if (value === void 0) {
      throw new Error(`Environment variable "${key}" is required but not set.`);
    }
    return value;
  }
  static string(key, fallback) {
    return _Env.get(key, fallback);
  }
  static boolean(key, fallback) {
    const raw = _Env.get(key);
    if (raw === void 0) {
      return fallback;
    }
    const lower = raw.toLowerCase();
    if (TRUTHY_VALUES.has(lower)) return true;
    if (FALSY_VALUES.has(lower)) return false;
    return fallback;
  }
  static number(key, fallback) {
    const raw = _Env.get(key);
    if (raw === void 0) {
      return fallback;
    }
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  static array(key, separator = ",", fallback) {
    const raw = _Env.get(key);
    if (raw === void 0) {
      return fallback;
    }
    return raw.split(separator).map((item) => item.trim()).filter((item) => item.length > 0);
  }
  // ── Inspection ──────────────────────────────────────────────────────────
  /**
   * Check whether an environment variable is set and non-empty.
   *
   * Returns `false` for undefined, empty string, and null-like values.
   *
   * @param key - Environment variable name
   * @returns `true` if the variable has a meaningful value
   *
   * @example
   * ```typescript
   * if (Env.has('DATABASE_URL')) {
   *   // safe to connect
   * }
   * ```
   */
  static has(key) {
    return _Env.get(key) !== void 0;
  }
  /**
   * Check whether an environment variable is missing or empty.
   *
   * Inverse of `Env.has()`.
   *
   * @param key - Environment variable name
   * @returns `true` if the variable is not set or is a null-like value
   *
   * @example
   * ```typescript
   * if (Env.missing('REDIS_URL')) {
   *   logger.warn('Redis not configured — using memory cache');
   * }
   * ```
   */
  static missing(key) {
    return !_Env.has(key);
  }
  /**
   * Check if the current environment matches the given name.
   *
   * Reads from `APP_ENV` (or `NODE_ENV` as fallback). Comparison
   * is case-insensitive.
   *
   * @param name - Environment name to check (e.g., `'production'`)
   * @returns `true` if the current environment matches
   *
   * @example
   * ```typescript
   * if (Env.is('production')) {
   *   // enable caching, disable debug
   * }
   * ```
   */
  static is(name) {
    const current = _Env.get("APP_ENV") ?? _Env.get("NODE_ENV") ?? "production";
    return current.toLowerCase() === name.toLowerCase();
  }
  /**
   * Check if the application is running in production.
   *
   * Shorthand for `Env.is('production')`.
   *
   * @returns `true` if `APP_ENV` or `NODE_ENV` is `'production'`
   */
  static isProduction() {
    return _Env.is("production");
  }
  /**
   * Check if the application is running in a local/development environment.
   *
   * Returns `true` for `'local'`, `'development'`, or `'dev'`.
   *
   * @returns `true` if the environment is local/development
   */
  static isLocal() {
    const current = (_Env.get("APP_ENV") ?? _Env.get("NODE_ENV") ?? "").toLowerCase();
    return current === "local" || current === "development" || current === "dev";
  }
  /**
   * Check if the application is running in a testing environment.
   *
   * Returns `true` for `'testing'` or `'test'`.
   *
   * @returns `true` if the environment is testing
   */
  static isTesting() {
    const current = (_Env.get("APP_ENV") ?? _Env.get("NODE_ENV") ?? "").toLowerCase();
    return current === "testing" || current === "test";
  }
  // ── Utilities ───────────────────────────────────────────────────────────
  /**
   * Strip surrounding single or double quotes from a value.
   *
   * Many `.env` parsers leave quotes intact. This method removes them
   * so `'"my-value"'` becomes `'my-value'`.
   *
   * @param value - Raw environment variable value
   * @returns The value without surrounding quotes
   */
  static stripQuotes(value) {
    if (value.length >= 2) {
      const first = value[0];
      const last = value[value.length - 1];
      if (first === '"' && last === '"' || first === "'" && last === "'") {
        return value.slice(1, -1);
      }
    }
    return value;
  }
};

// src/utils/env-helper.util.ts
function env(key, fallback) {
  if (typeof fallback === "number") {
    return Env.number(key, fallback);
  }
  if (typeof fallback === "boolean") {
    return Env.boolean(key, fallback);
  }
  return Env.get(key, fallback);
}

// src/services/str.service.ts
var Str = class _Str {
  /**
   * Return the remainder of a string after the first occurrence of a given value.
   *
   * @param subject - The string to search in
   * @param search  - The value to search for
   * @returns The portion of the string after the first occurrence of search
   *
   * @example
   * ```typescript
   * Str.after('hello world', 'hello '); // 'world'
   * Str.after('a.b.c', '.');            // 'b.c'
   * ```
   */
  static after(subject, search) {
    if (search === "") return subject;
    const index = subject.indexOf(search);
    return index === -1 ? subject : subject.substring(index + search.length);
  }
  /**
   * Return the remainder of a string after the last occurrence of a given value
   */
  static afterLast(subject, search) {
    if (search === "") return subject;
    const index = subject.lastIndexOf(search);
    return index === -1 ? subject : subject.substring(index + search.length);
  }
  /**
   * Convert a string to title case following APA guidelines
   */
  static apa(value) {
    const minorWords = [
      "a",
      "an",
      "and",
      "as",
      "at",
      "but",
      "by",
      "for",
      "in",
      "of",
      "on",
      "or",
      "the",
      "to",
      "up"
    ];
    const words = value.split(" ");
    return words.map((word, index) => {
      if (index === 0 || !minorWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    }).join(" ");
  }
  /**
   * Transliterate a UTF-8 value to ASCII
   */
  static ascii(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  /**
   * Get the portion of a string before the first occurrence of a given value
   */
  static before(subject, search) {
    if (search === "") return subject;
    const index = subject.indexOf(search);
    return index === -1 ? subject : subject.substring(0, index);
  }
  /**
   * Get the portion of a string before the last occurrence of a given value
   */
  static beforeLast(subject, search) {
    if (search === "") return subject;
    const index = subject.lastIndexOf(search);
    return index === -1 ? subject : subject.substring(0, index);
  }
  /**
   * Get the portion of a string between two values
   */
  static between(subject, from, to) {
    if (from === "" || to === "") return subject;
    const startIndex = subject.indexOf(from);
    if (startIndex === -1) return "";
    const start = startIndex + from.length;
    const endIndex = subject.indexOf(to, start);
    return endIndex === -1 ? "" : subject.substring(start, endIndex);
  }
  /**
   * Get the smallest possible portion of a string between two values
   */
  static betweenFirst(subject, from, to) {
    return _Str.between(subject, from, to);
  }
  /**
   * Convert a string to camelCase.
   *
   * Handles word boundaries from separators (`-`, `_`, space) and from
   * consecutive uppercase runs (e.g. `XML_HTTP_REQUEST` → `xmlHttpRequest`).
   *
   * @param value - The input string
   * @returns The camelCase string
   *
   * @example
   * ```typescript
   * Str.camel('foo_bar');           // 'fooBar'
   * Str.camel('foo-bar baz');        // 'fooBarBaz'
   * Str.camel('XML_HTTP_REQUEST');  // 'xmlHttpRequest'
   * ```
   */
  static camel(value) {
    return _Str.studly(value).replace(/^(.)/, (char) => char.toLowerCase());
  }
  /**
   * Get the character at the specified index
   */
  static charAt(subject, index) {
    if (index < 0 || index >= subject.length) return false;
    return subject.charAt(index);
  }
  /**
   * Remove the first occurrence of the given value from the start of the string
   */
  static chopStart(subject, search) {
    const searches = Array.isArray(search) ? search : [search];
    for (const s of searches) {
      if (subject.startsWith(s)) {
        return subject.substring(s.length);
      }
    }
    return subject;
  }
  /**
   * Remove the last occurrence of the given value from the end of the string
   */
  static chopEnd(subject, search) {
    const searches = Array.isArray(search) ? search : [search];
    for (const s of searches) {
      if (subject.endsWith(s)) {
        return subject.substring(0, subject.length - s.length);
      }
    }
    return subject;
  }
  /**
   * Determine if a given string contains a given substring
   */
  static contains(haystack, needles, ignoreCase = false) {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    const subject = ignoreCase ? haystack.toLowerCase() : haystack;
    return needleArray.some((needle) => {
      const search = ignoreCase ? needle.toLowerCase() : needle;
      return subject.includes(search);
    });
  }
  /**
   * Determine if a given string contains all array values
   */
  static containsAll(haystack, needles, ignoreCase = false) {
    const subject = ignoreCase ? haystack.toLowerCase() : haystack;
    return needles.every((needle) => {
      const search = ignoreCase ? needle.toLowerCase() : needle;
      return subject.includes(search);
    });
  }
  /**
   * Determine if a given string doesn't contain a given substring
   */
  static doesntContain(haystack, needles, ignoreCase = false) {
    return !_Str.contains(haystack, needles, ignoreCase);
  }
  /**
   * Replace consecutive instances of a character with a single instance
   */
  static deduplicate(value, character = " ") {
    const escaped = character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escaped}+`, "g");
    return value.replace(regex, character);
  }
  /**
   * Determine if a given string ends with a given substring
   */
  static endsWith(haystack, needles) {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    return needleArray.some((needle) => haystack.endsWith(needle));
  }
  /**
   * Extract an excerpt from text that matches the first instance of a phrase
   */
  static excerpt(text, phrase, options = {}) {
    const radius = options.radius ?? 100;
    const omission = options.omission ?? "...";
    const index = text.indexOf(phrase);
    if (index === -1) return "";
    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + phrase.length + radius);
    let excerpt = text.substring(start, end);
    if (start > 0) excerpt = omission + excerpt;
    if (end < text.length) excerpt = excerpt + omission;
    return excerpt;
  }
  /**
   * Cap a string with a single instance of a given value
   */
  static finish(value, cap) {
    return value.endsWith(cap) ? value : value + cap;
  }
  /**
   * Convert a string to headline case
   */
  static headline(value) {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  }
  /**
   * Determine if a given string matches a given pattern
   */
  static is(pattern, value, ignoreCase = false) {
    const regexPattern = pattern.replace(/\*/g, ".*");
    const flags = ignoreCase ? "i" : "";
    const regex = new RegExp(`^${regexPattern}$`, flags);
    return regex.test(value);
  }
  /**
   * Determine if a given string is 7-bit ASCII
   */
  static isAscii(value) {
    return /^[\x00-\x7F]*$/.test(value);
  }
  /**
   * Determine if a given string is valid JSON
   */
  static isJson(value) {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Determine if a given string is a valid URL
   */
  static isUrl(value, protocols) {
    try {
      if (typeof URL === "undefined") {
        const urlPattern = /^https?:\/\/.+/i;
        return urlPattern.test(value);
      }
      const urlObj = new URL(value);
      if (protocols) {
        return protocols.includes(urlObj.protocol.replace(":", ""));
      }
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Determine if a given string is a valid ULID
   */
  static isUlid(value) {
    return /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(value);
  }
  /**
   * Determine if a given string is a valid UUID
   */
  static isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
  /**
   * Convert a string to kebab-case
   */
  static kebab(value) {
    return value.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
  }
  /**
   * Return the given string with the first character lowercased
   */
  static lcfirst(value) {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
  /**
   * Return the length of the given string
   */
  static len(value) {
    return value.length;
  }
  /**
   * Limit the number of characters in a string
   */
  static limit(value, limit = 100, end = "...", preserveWords = false) {
    if (value.length <= limit) return value;
    let truncated = value.substring(0, limit);
    if (preserveWords) {
      const lastSpace = truncated.lastIndexOf(" ");
      if (lastSpace > 0) {
        truncated = truncated.substring(0, lastSpace);
      }
    }
    return truncated + end;
  }
  /**
   * Convert the given string to lowercase
   */
  static lower(value) {
    return value.toLowerCase();
  }
  /**
   * Masks a portion of a string with a repeated character
   */
  static mask(value, character, index, length) {
    if (index < 0) {
      index = value.length + index;
    }
    const maskLength = length ?? value.length - index;
    const mask = character.repeat(Math.abs(maskLength));
    return value.substring(0, index) + mask + value.substring(index + Math.abs(maskLength));
  }
  /**
   * Pad both sides of a string with another
   */
  static padBoth(value, length, pad = " ") {
    const totalPadding = length - value.length;
    if (totalPadding <= 0) return value;
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;
    return pad.repeat(leftPadding) + value + pad.repeat(rightPadding);
  }
  /**
   * Pad the left side of a string with another
   */
  static padLeft(value, length, pad = " ") {
    return value.padStart(length, pad);
  }
  /**
   * Pad the right side of a string with another
   */
  static padRight(value, length, pad = " ") {
    return value.padEnd(length, pad);
  }
  /**
   * Get the plural form of an English word
   */
  static plural(value, count = 2) {
    if (count === 1) return value;
    if (value.endsWith("y") && !/[aeiou]y$/i.test(value)) {
      return value.slice(0, -1) + "ies";
    }
    if (value.endsWith("s") || value.endsWith("x") || value.endsWith("z") || value.endsWith("ch") || value.endsWith("sh")) {
      return value + "es";
    }
    return value + "s";
  }
  /**
   * Pluralize the last word of an English, studly caps case string
   */
  static pluralStudly(value, count = 2) {
    const parts = value.match(/[A-Z][a-z]*/g) || [value];
    const lastWord = parts[parts.length - 1];
    const pluralized = _Str.plural(lastWord, count);
    parts[parts.length - 1] = pluralized;
    return parts.join("");
  }
  /**
   * Find the position of the first occurrence of a substring
   */
  static position(haystack, needle) {
    const pos = haystack.indexOf(needle);
    return pos === -1 ? false : pos;
  }
  /**
   * Generate a random string
   */
  static random(length = 16) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  /**
   * Remove the given value from the string
   */
  static remove(search, subject, caseSensitive = true) {
    const searches = Array.isArray(search) ? search : [search];
    let result = subject;
    searches.forEach((s) => {
      const flags = caseSensitive ? "g" : "gi";
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, flags), "");
    });
    return result;
  }
  /**
   * Repeat the given string
   */
  static repeat(value, times) {
    return value.repeat(times);
  }
  /**
   * Replace the given value in the given string
   */
  static replace(search, replace, subject, caseSensitive = true) {
    const flags = caseSensitive ? "g" : "gi";
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return subject.replace(new RegExp(escaped, flags), replace);
  }
  /**
   * Replace a given value in the string sequentially with an array
   */
  static replaceArray(search, replacements, subject) {
    let result = subject;
    let index = 0;
    while (result.includes(search) && index < replacements.length) {
      result = result.replace(search, replacements[index]);
      index++;
    }
    return result;
  }
  /**
   * Replace the first occurrence of a given value in the string
   */
  static replaceFirst(search, replace, subject) {
    return subject.replace(search, replace);
  }
  /**
   * Replace the last occurrence of a given value in the string
   */
  static replaceLast(search, replace, subject) {
    const index = subject.lastIndexOf(search);
    if (index === -1) return subject;
    return subject.substring(0, index) + replace + subject.substring(index + search.length);
  }
  /**
   * Replace the first occurrence only if it appears at the start
   */
  static replaceStart(search, replace, subject) {
    return subject.startsWith(search) ? replace + subject.substring(search.length) : subject;
  }
  /**
   * Replace the last occurrence only if it appears at the end
   */
  static replaceEnd(search, replace, subject) {
    return subject.endsWith(search) ? subject.substring(0, subject.length - search.length) + replace : subject;
  }
  /**
   * Reverse the given string
   */
  static reverse(value) {
    return value.split("").reverse().join("");
  }
  /**
   * Get the singular form of an English word
   */
  static singular(value) {
    if (value.endsWith("ies")) {
      return value.slice(0, -3) + "y";
    }
    if (value.endsWith("es")) {
      return value.slice(0, -2);
    }
    if (value.endsWith("s") && !value.endsWith("ss")) {
      return value.slice(0, -1);
    }
    return value;
  }
  /**
   * Generate a URL friendly slug
   */
  static slug(value, separator = "-") {
    return value.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, separator).replace(new RegExp(`${separator}+`, "g"), separator).replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  }
  /**
   * Convert a string to snake_case.
   *
   * Handles word boundaries from separators (`-`, `_`, space) and from
   * uppercase boundaries (camelCase or consecutive-uppercase runs).
   *
   * @param value     - The input string
   * @param delimiter - Word delimiter (default: `'_'`)
   * @returns The snake_case string
   *
   * @example
   * ```typescript
   * Str.snake('camelCase');     // 'camel_case'
   * Str.snake('HTMLParser');    // 'html_parser'
   * Str.snake('foo bar baz');    // 'foo_bar_baz'
   * ```
   */
  static snake(value, delimiter = "_") {
    return _Str.splitWords(value).map((word) => word.toLowerCase()).join(delimiter);
  }
  /**
   * Remove all extraneous whitespace
   */
  static squish(value) {
    return value.trim().replace(/\s+/g, " ");
  }
  /**
   * Begin a string with a single instance of a given value
   */
  static start(value, prefix) {
    return value.startsWith(prefix) ? value : prefix + value;
  }
  /**
   * Determine if a given string starts with a given substring
   */
  static startsWith(haystack, needles) {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    return needleArray.some((needle) => haystack.startsWith(needle));
  }
  /**
   * Convert a value to StudlyCase (a.k.a. PascalCase).
   *
   * Splits the input into words on separators (`-`, `_`, space) and on
   * uppercase boundaries (camelCase or consecutive-uppercase runs), then
   * joins each word with its first letter capitalized and the rest
   * lowercased.
   *
   * @param value - The input string
   * @returns The StudlyCase string
   *
   * @example
   * ```typescript
   * Str.studly('hello_world');           // 'HelloWorld'
   * Str.studly('hello-world foo bar');    // 'HelloWorldFooBar'
   * Str.studly('XML_HTTP_REQUEST');      // 'XmlHttpRequest'
   * Str.studly('camelCase');              // 'CamelCase'
   * ```
   */
  static studly(value) {
    return _Str.splitWords(value).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
  }
  /**
   * Split a string into word tokens.
   *
   * Splits on `-`, `_`, whitespace, and on uppercase boundaries. Treats
   * consecutive uppercase letters followed by a lowercase letter as the
   * end of an uppercase run (so `XMLHttp` → `['XML', 'Http']`).
   *
   * @param value - The input string
   * @returns Array of word tokens (lowercased boundaries preserved)
   *
   * @internal Used by `camel`, `studly`, `kebab`, `snake`, etc.
   */
  static splitWords(value) {
    if (!value) return [];
    return value.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_\s]+/g, " ").trim().split(" ").filter(Boolean);
  }
  /**
   * Returns the portion of string specified by the start and length parameters
   */
  static substr(value, start, length) {
    return value.substr(start, length);
  }
  /**
   * Returns the number of substring occurrences
   */
  static substrCount(haystack, needle) {
    return (haystack.match(new RegExp(needle, "g")) || []).length;
  }
  /**
   * Replace text within a portion of a string
   */
  static substrReplace(value, replace, start, length) {
    const actualLength = length ?? value.length - start;
    return value.substring(0, start) + replace + value.substring(start + actualLength);
  }
  /**
   * Swap multiple keywords in a string with other keywords.
   *
   * Performs an atomic single-pass swap — replacements are applied
   * simultaneously so the output of one swap is never re-swapped.
   *
   * @param map     - Map of search → replace pairs
   * @param subject - The string to perform swaps on
   * @returns The string with all swaps applied
   *
   * @example
   * ```typescript
   * Str.swap({ foo: 'bar', bar: 'baz' }, 'foo bar');
   * // → 'bar baz' (not 'baz baz' — atomic, no re-swapping)
   * ```
   */
  static swap(map, subject) {
    const keys = Object.keys(map);
    if (keys.length === 0) return subject;
    const sortedKeys = [...keys].sort((a, b) => b.length - a.length);
    const escaped = sortedKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(escaped.join("|"), "g");
    return subject.replace(pattern, (match) => map[match] ?? match);
  }
  /**
   * Take the first or last {limit} characters
   */
  static take(value, limit) {
    if (limit < 0) {
      return value.slice(limit);
    }
    return value.slice(0, limit);
  }
  /**
   * Convert the given string to title case
   */
  static title(value) {
    return value.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  /**
   * Convert the given string to Base64
   */
  static toBase64(value) {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value).toString("base64");
    }
    if (typeof btoa !== "undefined") {
      return btoa(value);
    }
    throw new Error("Base64 encoding not supported in this environment");
  }
  /**
   * Transliterate a string to its closest ASCII representation
   */
  static transliterate(value) {
    return _Str.ascii(value);
  }
  /**
   * Trim whitespace from both ends of the string
   */
  static trim(value, characters) {
    if (!characters) return value.trim();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return value.replace(new RegExp(`^[${escaped}]+|[${escaped}]+$`, "g"), "");
  }
  /**
   * Trim whitespace from the beginning of the string
   */
  static ltrim(value, characters) {
    if (!characters) return value.trimStart();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return value.replace(new RegExp(`^[${escaped}]+`, "g"), "");
  }
  /**
   * Trim whitespace from the end of the string
   */
  static rtrim(value, characters) {
    if (!characters) return value.trimEnd();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return value.replace(new RegExp(`[${escaped}]+$`, "g"), "");
  }
  /**
   * Make a string's first character uppercase
   */
  static ucfirst(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  /**
   * Split a string by uppercase characters
   */
  static ucsplit(value) {
    return value.match(/[A-Z][a-z]*/g) || [value];
  }
  /**
   * Convert the given string to uppercase
   */
  static upper(value) {
    return value.toUpperCase();
  }
  /**
   * Remove the specified strings from the beginning and end
   */
  static unwrap(value, before, after) {
    const actualAfter = after ?? before;
    let result = value;
    if (result.startsWith(before)) {
      result = result.substring(before.length);
    }
    if (result.endsWith(actualAfter)) {
      result = result.substring(0, result.length - actualAfter.length);
    }
    return result;
  }
  /**
   * Get the number of words a string contains
   */
  static wordCount(value) {
    return value.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
  /**
   * Wrap a string to a given number of characters
   */
  static wordWrap(value, characters = 75, breakStr = "\n") {
    const words = value.split(" ");
    let line = "";
    const lines = [];
    words.forEach((word) => {
      if ((line + word).length > characters) {
        if (line) lines.push(line.trim());
        line = word + " ";
      } else {
        line += word + " ";
      }
    });
    if (line) lines.push(line.trim());
    return lines.join(breakStr);
  }
  /**
   * Limit the number of words in a string
   */
  static words(value, words = 100, end = "...") {
    const wordArray = value.split(/\s+/);
    if (wordArray.length <= words) return value;
    return wordArray.slice(0, words).join(" ") + end;
  }
  /**
   * Wrap the string with the given strings
   */
  static wrap(value, before, after) {
    const actualAfter = after ?? before;
    return before + value + actualAfter;
  }
};

// src/services/stringable.service.ts
var Stringable = class _Stringable {
  constructor(value = "") {
    this.value = value;
  }
  /**
   * Get the underlying string value.
   */
  toString() {
    return this.value;
  }
  /**
   * Get the underlying string value.
   * Alias for toString().
   */
  valueOf() {
    return this.value;
  }
  // ============================================================================
  // Fluent Str Methods
  // ============================================================================
  after(search) {
    return new _Stringable(Str.after(this.value, search));
  }
  afterLast(search) {
    return new _Stringable(Str.afterLast(this.value, search));
  }
  apa() {
    return new _Stringable(Str.apa(this.value));
  }
  ascii() {
    return new _Stringable(Str.ascii(this.value));
  }
  before(search) {
    return new _Stringable(Str.before(this.value, search));
  }
  beforeLast(search) {
    return new _Stringable(Str.beforeLast(this.value, search));
  }
  between(from, to) {
    return new _Stringable(Str.between(this.value, from, to));
  }
  betweenFirst(from, to) {
    return new _Stringable(Str.betweenFirst(this.value, from, to));
  }
  camel() {
    return new _Stringable(Str.camel(this.value));
  }
  charAt(index) {
    return Str.charAt(this.value, index);
  }
  chopStart(search) {
    return new _Stringable(Str.chopStart(this.value, search));
  }
  chopEnd(search) {
    return new _Stringable(Str.chopEnd(this.value, search));
  }
  contains(needles, ignoreCase = false) {
    return Str.contains(this.value, needles, ignoreCase);
  }
  containsAll(needles, ignoreCase = false) {
    return Str.containsAll(this.value, needles, ignoreCase);
  }
  doesntContain(needles, ignoreCase = false) {
    return Str.doesntContain(this.value, needles, ignoreCase);
  }
  deduplicate(character = " ") {
    return new _Stringable(Str.deduplicate(this.value, character));
  }
  endsWith(needles) {
    return Str.endsWith(this.value, needles);
  }
  excerpt(phrase, options = {}) {
    return Str.excerpt(this.value, phrase, options);
  }
  finish(cap) {
    return new _Stringable(Str.finish(this.value, cap));
  }
  headline() {
    return new _Stringable(Str.headline(this.value));
  }
  is(pattern, ignoreCase = false) {
    return Str.is(pattern, this.value, ignoreCase);
  }
  isAscii() {
    return Str.isAscii(this.value);
  }
  isJson() {
    return Str.isJson(this.value);
  }
  isUrl(protocols) {
    return Str.isUrl(this.value, protocols);
  }
  isUlid() {
    return Str.isUlid(this.value);
  }
  isUuid() {
    return Str.isUuid(this.value);
  }
  kebab() {
    return new _Stringable(Str.kebab(this.value));
  }
  lcfirst() {
    return new _Stringable(Str.lcfirst(this.value));
  }
  length() {
    return Str.len(this.value);
  }
  limit(limit = 100, end = "...", preserveWords = false) {
    return new _Stringable(Str.limit(this.value, limit, end, preserveWords));
  }
  lower() {
    return new _Stringable(Str.lower(this.value));
  }
  mask(character, index, length) {
    return new _Stringable(Str.mask(this.value, character, index, length));
  }
  padBoth(length, pad = " ") {
    return new _Stringable(Str.padBoth(this.value, length, pad));
  }
  padLeft(length, pad = " ") {
    return new _Stringable(Str.padLeft(this.value, length, pad));
  }
  padRight(length, pad = " ") {
    return new _Stringable(Str.padRight(this.value, length, pad));
  }
  plural(count = 2) {
    return new _Stringable(Str.plural(this.value, count));
  }
  pluralStudly(count = 2) {
    return new _Stringable(Str.pluralStudly(this.value, count));
  }
  position(needle) {
    return Str.position(this.value, needle);
  }
  remove(search, caseSensitive = true) {
    return new _Stringable(Str.remove(search, this.value, caseSensitive));
  }
  repeat(times) {
    return new _Stringable(Str.repeat(this.value, times));
  }
  replace(search, replace, caseSensitive = true) {
    return new _Stringable(Str.replace(search, replace, this.value, caseSensitive));
  }
  replaceArray(search, replacements) {
    return new _Stringable(Str.replaceArray(search, replacements, this.value));
  }
  replaceFirst(search, replace) {
    return new _Stringable(Str.replaceFirst(search, replace, this.value));
  }
  replaceLast(search, replace) {
    return new _Stringable(Str.replaceLast(search, replace, this.value));
  }
  replaceStart(search, replace) {
    return new _Stringable(Str.replaceStart(search, replace, this.value));
  }
  replaceEnd(search, replace) {
    return new _Stringable(Str.replaceEnd(search, replace, this.value));
  }
  reverse() {
    return new _Stringable(Str.reverse(this.value));
  }
  singular() {
    return new _Stringable(Str.singular(this.value));
  }
  slug(separator = "-") {
    return new _Stringable(Str.slug(this.value, separator));
  }
  snake(delimiter = "_") {
    return new _Stringable(Str.snake(this.value, delimiter));
  }
  squish() {
    return new _Stringable(Str.squish(this.value));
  }
  start(prefix) {
    return new _Stringable(Str.start(this.value, prefix));
  }
  startsWith(needles) {
    return Str.startsWith(this.value, needles);
  }
  studly() {
    return new _Stringable(Str.studly(this.value));
  }
  substr(start, length) {
    return new _Stringable(Str.substr(this.value, start, length));
  }
  substrCount(needle) {
    return Str.substrCount(this.value, needle);
  }
  substrReplace(replace, start, length) {
    return new _Stringable(Str.substrReplace(this.value, replace, start, length));
  }
  swap(map) {
    return new _Stringable(Str.swap(map, this.value));
  }
  take(limit) {
    return new _Stringable(Str.take(this.value, limit));
  }
  title() {
    return new _Stringable(Str.title(this.value));
  }
  toBase64() {
    return Str.toBase64(this.value);
  }
  transliterate() {
    return new _Stringable(Str.transliterate(this.value));
  }
  trim(characters) {
    return new _Stringable(Str.trim(this.value, characters));
  }
  ltrim(characters) {
    return new _Stringable(Str.ltrim(this.value, characters));
  }
  rtrim(characters) {
    return new _Stringable(Str.rtrim(this.value, characters));
  }
  ucfirst() {
    return new _Stringable(Str.ucfirst(this.value));
  }
  ucsplit() {
    return Str.ucsplit(this.value);
  }
  upper() {
    return new _Stringable(Str.upper(this.value));
  }
  unwrap(before, after) {
    return new _Stringable(Str.unwrap(this.value, before, after));
  }
  wordCount() {
    return Str.wordCount(this.value);
  }
  wordWrap(characters = 75, breakStr = "\n") {
    return new _Stringable(Str.wordWrap(this.value, characters, breakStr));
  }
  words(words = 100, end = "...") {
    return new _Stringable(Str.words(this.value, words, end));
  }
  wrap(before, after) {
    return new _Stringable(Str.wrap(this.value, before, after));
  }
};

// src/services/arr.service.ts
var Arr = class _Arr {
  // ── Dot-Notation Access ─────────────────────────────────────────────────
  /**
   * Get a value from a nested object using dot notation.
   *
   * Supports wildcard `*` segments to pluck values from arrays of objects.
   *
   * @typeParam T - The expected return type
   * @param target   - The object to read from
   * @param key      - Dot-separated path (e.g., `'user.address.city'`)
   * @param fallback - Value to return if the path doesn't exist
   * @returns The value at the path, or the fallback
   *
   * @example
   * ```typescript
   * const config = { db: { host: 'localhost', port: 5432 } };
   * Arr.get(config, 'db.host');           // 'localhost'
   * Arr.get(config, 'db.name', 'mydb');   // 'mydb'
   *
   * // Wildcard plucking
   * const users = { accounts: [{ name: 'Alice' }, { name: 'Bob' }] };
   * Arr.get(users, 'accounts.*.name');    // ['Alice', 'Bob']
   * ```
   */
  static get(target, key, fallback) {
    if (key === null) {
      return target;
    }
    if (key in target) {
      return target[key];
    }
    const segments = key.split(".");
    let current = target;
    for (const segment of segments) {
      if (segment === "*") {
        if (!Array.isArray(current)) {
          return fallback;
        }
        const remaining = segments.slice(segments.indexOf(segment) + 1).join(".");
        if (remaining === "") {
          return current;
        }
        return current.map((item) => _Arr.get(item, remaining, fallback));
      }
      if (current === null || current === void 0 || typeof current !== "object") {
        return fallback;
      }
      current = current[segment];
    }
    return current === void 0 ? fallback : current;
  }
  /**
   * Set a value in a nested object using dot notation.
   *
   * Creates intermediate objects as needed. Returns a **new** object —
   * the original is not mutated.
   *
   * @param target - The object to write into
   * @param key    - Dot-separated path
   * @param value  - The value to set
   * @returns A new object with the value set at the given path
   *
   * @example
   * ```typescript
   * const config = { db: { host: 'localhost' } };
   * const updated = Arr.set(config, 'db.port', 5432);
   * // → { db: { host: 'localhost', port: 5432 } }
   * ```
   */
  static set(target, key, value) {
    const result = _Arr.deepClone(target);
    const segments = key.split(".");
    let current = result;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!(segment in current) || typeof current[segment] !== "object") {
        current[segment] = /^\d+$/.test(segments[i + 1]) ? [] : {};
      }
      current = current[segment];
    }
    current[segments[segments.length - 1]] = value;
    return result;
  }
  /**
   * Check if a key exists in a nested object using dot notation.
   *
   * Accepts a single key or an array of keys. When given an array,
   * returns `true` only if **all** keys exist.
   *
   * @param target - The object to inspect
   * @param keys   - One or more dot-separated paths
   * @returns `true` if all specified paths exist
   *
   * @example
   * ```typescript
   * const config = { db: { host: 'localhost' } };
   * Arr.has(config, 'db.host');                  // true
   * Arr.has(config, 'db.port');                  // false
   * Arr.has(config, ['db.host', 'db.port']);      // false
   * ```
   */
  static has(target, keys) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return keyArray.every((key) => {
      const segments = key.split(".");
      let current = target;
      for (const segment of segments) {
        if (current === null || current === void 0 || typeof current !== "object" || !(segment in current)) {
          return false;
        }
        current = current[segment];
      }
      return true;
    });
  }
  /**
   * Remove one or more keys from a nested object using dot notation.
   *
   * Returns a new object — the original is not mutated.
   *
   * @param target - The object to remove keys from
   * @param keys   - One or more dot-separated paths to remove
   * @returns A new object without the specified keys
   *
   * @example
   * ```typescript
   * const user = { name: 'Alice', password: 'secret', email: 'a@b.com' };
   * Arr.forget(user, 'password');
   * // → { name: 'Alice', email: 'a@b.com' }
   * ```
   */
  static forget(target, keys) {
    const result = _Arr.deepClone(target);
    const keyArray = Array.isArray(keys) ? keys : [keys];
    for (const key of keyArray) {
      const segments = key.split(".");
      let current = result;
      for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        if (!(segment in current) || typeof current[segment] !== "object") {
          break;
        }
        current = current[segment];
      }
      delete current[segments[segments.length - 1]];
    }
    return result;
  }
  // ── Structural Helpers ──────────────────────────────────────────────────
  /**
   * Return a subset of the object with only the specified keys.
   *
   * @param target - The source object
   * @param keys   - Keys to include
   * @returns A new object containing only the specified keys
   *
   * @example
   * ```typescript
   * const user = { id: 1, name: 'Alice', email: 'a@b.com', password: 'x' };
   * Arr.only(user, ['id', 'name']);
   * // → { id: 1, name: 'Alice' }
   * ```
   */
  static only(target, keys) {
    const result = {};
    for (const key of keys) {
      if (key in target) {
        result[key] = target[key];
      }
    }
    return result;
  }
  /**
   * Return the object without the specified keys.
   *
   * @param target - The source object
   * @param keys   - Keys to exclude
   * @returns A new object without the specified keys
   *
   * @example
   * ```typescript
   * const user = { id: 1, name: 'Alice', password: 'secret' };
   * Arr.except(user, ['password']);
   * // → { id: 1, name: 'Alice' }
   * ```
   */
  static except(target, keys) {
    const result = { ...target };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }
  /**
   * Pluck a single field from each item in an array of objects.
   *
   * Optionally key the result by another field.
   *
   * @param items - Array of objects
   * @param value - The field to extract
   * @param key   - Optional field to use as the result key
   * @returns An array of values, or a keyed object
   *
   * @example
   * ```typescript
   * const users = [
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' },
   * ];
   * Arr.pluck(users, 'name');        // ['Alice', 'Bob']
   * Arr.pluck(users, 'name', 'id');  // { 1: 'Alice', 2: 'Bob' }
   * ```
   */
  static pluck(items, value, key) {
    if (key) {
      const result = {};
      for (const item of items) {
        result[String(_Arr.get(item, key))] = _Arr.get(item, value);
      }
      return result;
    }
    return items.map((item) => _Arr.get(item, value));
  }
  /**
   * Group an array of objects by a given key.
   *
   * @param items - Array of objects
   * @param key   - The field to group by
   * @returns An object where each key maps to an array of matching items
   *
   * @example
   * ```typescript
   * const items = [
   *   { type: 'fruit', name: 'apple' },
   *   { type: 'veggie', name: 'carrot' },
   *   { type: 'fruit', name: 'banana' },
   * ];
   * Arr.groupBy(items, 'type');
   * // → { fruit: [{...}, {...}], veggie: [{...}] }
   * ```
   */
  static groupBy(items, key) {
    const result = {};
    for (const item of items) {
      const groupKey = String(_Arr.get(item, key, ""));
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
    }
    return result;
  }
  /**
   * Key an array of objects by a given field.
   *
   * @param items - Array of objects
   * @param key   - The field to use as the key
   * @returns An object keyed by the specified field
   *
   * @example
   * ```typescript
   * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
   * Arr.keyBy(users, 'id');
   * // → { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }
   * ```
   */
  static keyBy(items, key) {
    const result = {};
    for (const item of items) {
      result[String(_Arr.get(item, key))] = item;
    }
    return result;
  }
  // ── Array Helpers ───────────────────────────────────────────────────────
  /**
   * Return the first element that passes the given truth test.
   *
   * @typeParam T - The array element type
   * @param items    - The array to search
   * @param callback - Predicate function (optional — returns first element if omitted)
   * @param fallback - Value to return if no element passes
   * @returns The first matching element, or the fallback
   *
   * @example
   * ```typescript
   * Arr.first([1, 2, 3, 4], (n) => n > 2);  // 3
   * Arr.first([1, 2, 3]);                     // 1
   * Arr.first([], undefined, 'default');       // 'default'
   * ```
   */
  static first(items, callback, fallback) {
    if (!callback) {
      return items.length > 0 ? items[0] : fallback;
    }
    for (let i = 0; i < items.length; i++) {
      if (callback(items[i], i)) {
        return items[i];
      }
    }
    return fallback;
  }
  /**
   * Return the last element that passes the given truth test.
   *
   * @typeParam T - The array element type
   * @param items    - The array to search
   * @param callback - Predicate function (optional — returns last element if omitted)
   * @param fallback - Value to return if no element passes
   * @returns The last matching element, or the fallback
   *
   * @example
   * ```typescript
   * Arr.last([1, 2, 3, 4], (n) => n < 3);  // 2
   * Arr.last([1, 2, 3]);                     // 3
   * ```
   */
  static last(items, callback, fallback) {
    if (!callback) {
      return items.length > 0 ? items[items.length - 1] : fallback;
    }
    for (let i = items.length - 1; i >= 0; i--) {
      if (callback(items[i], i)) {
        return items[i];
      }
    }
    return fallback;
  }
  /**
   * Flatten a multi-dimensional array into a single level.
   *
   * @param items - The array to flatten
   * @param depth - Maximum recursion depth (default: `Infinity`)
   * @returns A new flat array
   *
   * @example
   * ```typescript
   * Arr.flatten([[1, 2], [3, [4, 5]]]);     // [1, 2, 3, 4, 5]
   * Arr.flatten([[1, [2]], [3, [4]]], 1);    // [1, 2, 3, [4]]
   * ```
   */
  static flatten(items, depth = Infinity) {
    return items.flat(depth);
  }
  /**
   * Ensure the given value is an array.
   *
   * - Arrays are returned as-is
   * - `null` / `undefined` → empty array
   * - Everything else → wrapped in a single-element array
   *
   * @typeParam T - The element type
   * @param value - The value to wrap
   * @returns An array
   *
   * @example
   * ```typescript
   * Arr.wrap('hello');     // ['hello']
   * Arr.wrap([1, 2, 3]);  // [1, 2, 3]
   * Arr.wrap(null);        // []
   * Arr.wrap(undefined);   // []
   * ```
   */
  static wrap(value) {
    if (value === null || value === void 0) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }
  /**
   * Return a random element from the array.
   *
   * @typeParam T - The element type
   * @param items  - The array to pick from
   * @param count  - Number of random elements to return (default: 1)
   * @returns A single element (when count=1) or an array of elements
   *
   * @example
   * ```typescript
   * Arr.random([1, 2, 3, 4, 5]);     // e.g., 3
   * Arr.random([1, 2, 3, 4, 5], 2);  // e.g., [1, 4]
   * ```
   */
  static random(items, count) {
    if (items.length === 0) {
      return count !== void 0 ? [] : void 0;
    }
    if (count !== void 0) {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, items.length));
    }
    return items[Math.floor(Math.random() * items.length)];
  }
  /**
   * Shuffle the array using the Fisher-Yates algorithm.
   *
   * Returns a new array — the original is not mutated.
   *
   * @typeParam T - The element type
   * @param items - The array to shuffle
   * @returns A new shuffled array
   *
   * @example
   * ```typescript
   * Arr.shuffle([1, 2, 3, 4, 5]); // e.g., [3, 1, 5, 2, 4]
   * ```
   */
  static shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  /**
   * Sort an array of objects by a given key.
   *
   * @param items     - Array of objects
   * @param key       - The field to sort by (supports dot notation)
   * @param direction - Sort direction: `'asc'` or `'desc'` (default: `'asc'`)
   * @returns A new sorted array
   *
   * @example
   * ```typescript
   * const users = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
   * Arr.sortBy(users, 'name');
   * // → [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]
   * ```
   */
  static sortBy(items, key, direction = "asc") {
    const multiplier = direction === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      const aVal = _Arr.get(a, key);
      const bVal = _Arr.get(b, key);
      if (aVal < bVal) return -1 * multiplier;
      if (aVal > bVal) return 1 * multiplier;
      return 0;
    });
  }
  /**
   * Remove duplicate values from an array.
   *
   * For arrays of objects, provide a key to deduplicate by.
   *
   * @param items - The array to deduplicate
   * @param key   - Optional field to compare objects by
   * @returns A new array with duplicates removed
   *
   * @example
   * ```typescript
   * Arr.unique([1, 2, 2, 3, 3, 3]);  // [1, 2, 3]
   *
   * const users = [{ id: 1, name: 'A' }, { id: 1, name: 'B' }];
   * Arr.unique(users, 'id');  // [{ id: 1, name: 'A' }]
   * ```
   */
  static unique(items, key) {
    if (!key) {
      return [...new Set(items)];
    }
    const seen = /* @__PURE__ */ new Set();
    return items.filter((item) => {
      const val = _Arr.get(item, key);
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
  /**
   * Split an array into chunks of the given size.
   *
   * @param items - The array to chunk
   * @param size  - Maximum chunk size
   * @returns An array of chunks
   *
   * @example
   * ```typescript
   * Arr.chunk([1, 2, 3, 4, 5], 2);
   * // → [[1, 2], [3, 4], [5]]
   * ```
   */
  static chunk(items, size) {
    const result = [];
    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }
    return result;
  }
  /**
   * Create an object from separate arrays of keys and values.
   *
   * @param keys   - Array of keys
   * @param values - Array of values
   * @returns A new object mapping keys to values
   *
   * @example
   * ```typescript
   * Arr.combine(['name', 'age'], ['Alice', 30]);
   * // → { name: 'Alice', age: 30 }
   * ```
   */
  static combine(keys, values) {
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      result[keys[i]] = values[i];
    }
    return result;
  }
  /**
   * Determine if the given value is an array.
   *
   * @param value - The value to check
   * @returns `true` if the value is an array
   */
  static isArray(value) {
    return Array.isArray(value);
  }
  /**
   * Determine if the given value is a plain object.
   *
   * @param value - The value to check
   * @returns `true` if the value is a plain object (not null, not array)
   */
  static isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  // ── Internal Utilities ──────────────────────────────────────────────────
  /**
   * Deep clone an object or array.
   *
   * Uses `structuredClone` when available, falls back to JSON
   * round-trip for environments that don't support it.
   *
   * @param value - The value to clone
   * @returns A deep copy of the value
   */
  static deepClone(value) {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }
};

// src/services/num.service.ts
var ABBREVIATIONS = [
  { threshold: 1e15, suffix: "Q", divisor: 1e15 },
  { threshold: 1e12, suffix: "T", divisor: 1e12 },
  { threshold: 1e9, suffix: "B", divisor: 1e9 },
  { threshold: 1e6, suffix: "M", divisor: 1e6 },
  { threshold: 1e3, suffix: "K", divisor: 1e3 }
];
var FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
var Num = class {
  // ── Formatting ──────────────────────────────────────────────────────────
  /**
   * Format a number with grouped thousands and decimal places.
   *
   * Uses `Intl.NumberFormat` for locale-aware formatting.
   *
   * @param value    - The number to format
   * @param decimals - Number of decimal places (default: `0`)
   * @param locale   - BCP 47 locale string (default: `'en-US'`)
   * @returns The formatted number string
   *
   * @example
   * ```typescript
   * Num.format(1234567.89);        // '1,234,568'
   * Num.format(1234567.89, 2);     // '1,234,567.89'
   * Num.format(1234.5, 2, 'de');   // '1.234,50'
   * ```
   */
  static format(value, decimals = 0, locale = "en-US") {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }
  /**
   * Abbreviate a number with a suffix (K, M, B, T, Q).
   *
   * @param value     - The number to abbreviate
   * @param precision - Decimal places in the abbreviated form (default: `0`)
   * @returns The abbreviated string
   *
   * @example
   * ```typescript
   * Num.abbreviate(1_000);         // '1K'
   * Num.abbreviate(1_500_000, 1);  // '1.5M'
   * Num.abbreviate(999);           // '999'
   * ```
   */
  static abbreviate(value, precision = 0) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    for (const { threshold, suffix, divisor } of ABBREVIATIONS) {
      if (absValue >= threshold) {
        const abbreviated = absValue / divisor;
        return sign + abbreviated.toFixed(precision) + suffix;
      }
    }
    return sign + absValue.toString();
  }
  /**
   * Format a number as a human-readable string with word suffixes.
   *
   * Similar to `abbreviate()` but uses full words: thousand, million, etc.
   *
   * @param value     - The number to format
   * @param precision - Decimal places (default: `0`)
   * @returns The human-readable string
   *
   * @example
   * ```typescript
   * Num.forHumans(1_000);         // '1 thousand'
   * Num.forHumans(1_500_000, 1);  // '1.5 million'
   * Num.forHumans(2_300_000_000); // '2 billion'
   * ```
   */
  static forHumans(value, precision = 0) {
    const words = {
      K: "thousand",
      M: "million",
      B: "billion",
      T: "trillion",
      Q: "quadrillion"
    };
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    for (const { threshold, suffix, divisor } of ABBREVIATIONS) {
      if (absValue >= threshold) {
        const abbreviated = absValue / divisor;
        return sign + abbreviated.toFixed(precision) + " " + words[suffix];
      }
    }
    return sign + absValue.toString();
  }
  /**
   * Get the ordinal suffix for a number (1st, 2nd, 3rd, 4th, ...).
   *
   * @param value - The number
   * @returns The number with its ordinal suffix
   *
   * @example
   * ```typescript
   * Num.ordinal(1);   // '1st'
   * Num.ordinal(2);   // '2nd'
   * Num.ordinal(3);   // '3rd'
   * Num.ordinal(11);  // '11th'
   * Num.ordinal(21);  // '21st'
   * ```
   */
  static ordinal(value) {
    const abs = Math.abs(value);
    const lastTwo = abs % 100;
    const lastOne = abs % 10;
    if (lastTwo >= 11 && lastTwo <= 13) {
      return value + "th";
    }
    switch (lastOne) {
      case 1:
        return value + "st";
      case 2:
        return value + "nd";
      case 3:
        return value + "rd";
      default:
        return value + "th";
    }
  }
  /**
   * Format a number as a percentage.
   *
   * @param value     - The number (e.g., `75.5` for 75.50%)
   * @param precision - Decimal places (default: `2`)
   * @param locale    - BCP 47 locale string (default: `'en-US'`)
   * @returns The formatted percentage string
   *
   * @example
   * ```typescript
   * Num.percentage(75.5);       // '75.50%'
   * Num.percentage(100, 0);     // '100%'
   * Num.percentage(0.5, 1);     // '0.5%'
   * ```
   */
  static percentage(value, precision = 2, locale = "en-US") {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(value) + "%";
  }
  /**
   * Format a number as currency.
   *
   * Uses `Intl.NumberFormat` with `style: 'currency'` for locale-aware
   * currency formatting.
   *
   * @param value    - The amount
   * @param currency - ISO 4217 currency code (default: `'USD'`)
   * @param locale   - BCP 47 locale string (default: `'en-US'`)
   * @returns The formatted currency string
   *
   * @example
   * ```typescript
   * Num.currency(49.99);                // '$49.99'
   * Num.currency(1234.56, 'EUR', 'de'); // '1.234,56 €'
   * Num.currency(99, 'GBP');            // '£99.00'
   * ```
   */
  static currency(value, currency = "USD", locale = "en-US") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency
    }).format(value);
  }
  /**
   * Format a byte count as a human-readable file size.
   *
   * @param bytes     - The byte count
   * @param precision - Decimal places (default: `2`)
   * @returns The formatted file size string
   *
   * @example
   * ```typescript
   * Num.fileSize(0);            // '0 B'
   * Num.fileSize(1024);         // '1.00 KB'
   * Num.fileSize(1536);         // '1.50 KB'
   * Num.fileSize(1_073_741_824); // '1.00 GB'
   * ```
   */
  static fileSize(bytes, precision = 2) {
    if (bytes === 0) return "0 B";
    const absBytes = Math.abs(bytes);
    const sign = bytes < 0 ? "-" : "";
    const exponent = Math.min(
      Math.floor(Math.log(absBytes) / Math.log(1024)),
      FILE_SIZE_UNITS.length - 1
    );
    const size = absBytes / Math.pow(1024, exponent);
    return sign + size.toFixed(precision) + " " + FILE_SIZE_UNITS[exponent];
  }
  // ── Math Helpers ────────────────────────────────────────────────────────
  /**
   * Clamp a number between a minimum and maximum value.
   *
   * @param value - The number to clamp
   * @param min   - Minimum allowed value
   * @param max   - Maximum allowed value
   * @returns The clamped value
   *
   * @example
   * ```typescript
   * Num.clamp(5, 1, 10);   // 5
   * Num.clamp(-5, 1, 10);  // 1
   * Num.clamp(15, 1, 10);  // 10
   * ```
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  /**
   * Generate a random integer between min and max (inclusive).
   *
   * @param min - Minimum value (default: `0`)
   * @param max - Maximum value (default: `100`)
   * @returns A random integer in the range [min, max]
   *
   * @example
   * ```typescript
   * Num.random(1, 10);  // e.g., 7
   * Num.random();       // e.g., 42 (0–100)
   * ```
   */
  static random(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // ── Inspection ──────────────────────────────────────────────────────────
  /**
   * Determine if a value is a valid, finite number.
   *
   * Returns `false` for `NaN`, `Infinity`, `-Infinity`, and non-number types.
   *
   * @param value - The value to check
   * @returns `true` if the value is a finite number
   *
   * @example
   * ```typescript
   * Num.isNumber(42);        // true
   * Num.isNumber(3.14);      // true
   * Num.isNumber(NaN);       // false
   * Num.isNumber(Infinity);  // false
   * Num.isNumber('42');      // false
   * ```
   */
  static isNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }
  /**
   * Determine if a value is an integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is an integer
   *
   * @example
   * ```typescript
   * Num.isInteger(42);    // true
   * Num.isInteger(3.14);  // false
   * ```
   */
  static isInteger(value) {
    return Number.isInteger(value);
  }
  /**
   * Determine if a number is even.
   *
   * @param value - The number to check
   * @returns `true` if the number is even
   */
  static isEven(value) {
    return value % 2 === 0;
  }
  /**
   * Determine if a number is odd.
   *
   * @param value - The number to check
   * @returns `true` if the number is odd
   */
  static isOdd(value) {
    return value % 2 !== 0;
  }
  /**
   * Determine if a number is positive (greater than zero).
   *
   * @param value - The number to check
   * @returns `true` if the number is positive
   */
  static isPositive(value) {
    return value > 0;
  }
  /**
   * Determine if a number is negative (less than zero).
   *
   * @param value - The number to check
   * @returns `true` if the number is negative
   */
  static isNegative(value) {
    return value < 0;
  }
  /**
   * Determine if a number falls within a range (inclusive).
   *
   * @param value - The number to check
   * @param min   - Range minimum
   * @param max   - Range maximum
   * @returns `true` if min ≤ value ≤ max
   *
   * @example
   * ```typescript
   * Num.between(5, 1, 10);   // true
   * Num.between(0, 1, 10);   // false
   * Num.between(10, 1, 10);  // true
   * ```
   */
  static between(value, min, max) {
    return value >= min && value <= max;
  }
};
var Collection = class _Collection {
  constructor(items = []) {
    this.collection = collectJs__default.default(items);
  }
  /**
   * Create a new collection instance
   */
  static make(items = []) {
    return new _Collection(items);
  }
  /**
   * Get all items in the collection
   */
  all() {
    return this.collection.all();
  }
  /**
   * Get the average value of a given key
   */
  avg(key) {
    return this.collection.avg(key);
  }
  /**
   * Chunk the collection into chunks of the given size
   */
  chunk(size) {
    return new _Collection(this.collection.chunk(size).all());
  }
  /**
   * Collapse a collection of arrays into a single, flat collection
   */
  collapse() {
    return new _Collection(this.collection.collapse().all());
  }
  /**
   * Determine if an item exists in the collection
   */
  contains(key, value) {
    return this.collection.contains(key, value);
  }
  /**
   * Get the total number of items in the collection
   */
  count() {
    return this.collection.count();
  }
  /**
   * Get the items in the collection that are not present in the given items
   */
  diff(items) {
    return new _Collection(this.collection.diff(items).all());
  }
  /**
   * Execute a callback over each item
   */
  each(callback) {
    this.collection.each(callback);
    return this;
  }
  /**
   * Determine if all items pass the given test
   */
  every(callback) {
    return this.collection.every(callback);
  }
  /**
   * Get all items except for those with the specified keys
   */
  except(keys) {
    return new _Collection(this.collection.except(keys).all());
  }
  /**
   * Run a filter over each of the items
   */
  filter(callback) {
    return new _Collection(this.collection.filter(callback).all());
  }
  /**
   * Get the first item from the collection
   */
  first(callback) {
    return this.collection.first(callback);
  }
  /**
   * Get a flattened array of the items in the collection
   */
  flatten(depth) {
    return new _Collection(this.collection.flatten(depth).all());
  }
  /**
   * Flip the items in the collection
   */
  flip() {
    return new _Collection(this.collection.flip().all());
  }
  /**
   * Remove an item from the collection by key
   */
  forget(key) {
    this.collection.forget(key);
    return this;
  }
  /**
   * Get an item from the collection by key
   */
  get(key, defaultValue) {
    const result = this.collection.get(key, defaultValue);
    return result === null ? void 0 : result;
  }
  /**
   * Group the collection's items by a given key
   */
  groupBy(key) {
    const grouped = this.collection.groupBy(key);
    const result = {};
    grouped.each((items, groupKey) => {
      result[groupKey] = new _Collection(items.all());
    });
    return new _Collection(Object.values(result));
  }
  /**
   * Determine if a given key exists in the collection
   */
  has(key) {
    return this.collection.has(key);
  }
  /**
   * Concatenate values of a given key as a string
   */
  implode(key, glue) {
    return this.collection.implode(key, glue);
  }
  /**
   * Intersect the collection with the given items
   */
  intersect(items) {
    return new _Collection(this.collection.intersect(items).all());
  }
  /**
   * Determine if the collection is empty
   */
  isEmpty() {
    return this.collection.isEmpty();
  }
  /**
   * Determine if the collection is not empty
   */
  isNotEmpty() {
    return this.collection.isNotEmpty();
  }
  /**
   * Join all items from the collection using a string
   */
  join(glue, finalGlue) {
    if (finalGlue) {
      return this.collection.join(glue, finalGlue);
    }
    return this.collection.join(glue);
  }
  /**
   * Key the collection by the given key
   */
  keyBy(key) {
    return new _Collection(this.collection.keyBy(key).all());
  }
  /**
   * Get the keys of the collection items
   */
  keys() {
    return new _Collection(this.collection.keys().all());
  }
  /**
   * Get the last item from the collection
   */
  last(callback) {
    return this.collection.last(callback);
  }
  /**
   * Run a map over each of the items
   */
  map(callback) {
    return new _Collection(this.collection.map(callback).all());
  }
  /**
   * Get the max value of a given key
   */
  max(key) {
    return this.collection.max(key);
  }
  /**
   * Merge the collection with the given items
   */
  merge(items) {
    return new _Collection(this.collection.merge(items).all());
  }
  /**
   * Get the min value of a given key
   */
  min(key) {
    return this.collection.min(key);
  }
  /**
   * Get the items with the specified keys
   */
  only(keys) {
    return new _Collection(this.collection.only(keys).all());
  }
  /**
   * Get and remove the last item from the collection
   */
  pop() {
    return this.collection.pop();
  }
  /**
   * Push an item onto the beginning of the collection
   */
  prepend(value) {
    this.collection.prepend(value);
    return this;
  }
  /**
   * Get and remove an item from the collection
   */
  pull(key) {
    const result = this.collection.pull(key);
    return result === null ? void 0 : result;
  }
  /**
   * Push an item onto the end of the collection
   */
  push(value) {
    this.collection.push(value);
    return this;
  }
  /**
   * Put an item in the collection by key
   */
  put(key, value) {
    this.collection.put(key, value);
    return this;
  }
  /**
   * Get one or a specified number of items randomly from the collection
   */
  random(count) {
    if (count) {
      const result = this.collection.random(count);
      return new _Collection(result.all());
    }
    return this.collection.random();
  }
  /**
   * Reduce the collection to a single value
   */
  reduce(callback, initial) {
    return this.collection.reduce(callback, initial);
  }
  /**
   * Filter items by the given key value pair
   */
  reject(callback) {
    return new _Collection(this.collection.reject(callback).all());
  }
  /**
   * Reverse items order
   */
  reverse() {
    return new _Collection(this.collection.reverse().all());
  }
  /**
   * Search the collection for a given value
   */
  search(value) {
    const result = this.collection.search(value);
    return result === false ? false : result;
  }
  /**
   * Get and remove the first item from the collection
   */
  shift() {
    return this.collection.shift();
  }
  /**
   * Shuffle the items in the collection
   */
  shuffle() {
    return new _Collection(this.collection.shuffle().all());
  }
  /**
   * Slice the underlying collection array
   */
  slice(start, length) {
    return new _Collection(this.collection.slice(start, length).all());
  }
  /**
   * Sort through each item with a callback
   */
  sort(callback) {
    return new _Collection(this.collection.sort(callback).all());
  }
  /**
   * Sort the collection by the given key
   */
  sortBy(key) {
    return new _Collection(this.collection.sortBy(key).all());
  }
  /**
   * Sort the collection in descending order by the given key
   */
  sortByDesc(key) {
    return new _Collection(this.collection.sortByDesc(key).all());
  }
  /**
   * Splice a portion of the underlying collection array
   */
  splice(start, length, ...items) {
    const actualLength = length ?? 0;
    const itemsArray = items;
    return new _Collection(this.collection.splice(start, actualLength, ...itemsArray).all());
  }
  /**
   * Get the sum of the given values
   */
  sum(key) {
    const result = this.collection.sum(key);
    return typeof result === "number" ? result : 0;
  }
  /**
   * Take the first or last {limit} items
   */
  take(limit) {
    return new _Collection(this.collection.take(limit).all());
  }
  /**
   * Pass the collection to the given callback and return the result
   */
  pipe(callback) {
    return callback(this);
  }
  /**
   * Pass the collection to the given callback and then return it
   */
  tap(callback) {
    callback(this);
    return this;
  }
  /**
   * Transform each item in the collection using a callback
   */
  transform(callback) {
    this.collection = this.collection.map(callback);
    return this;
  }
  /**
   * Return only unique items from the collection array
   */
  unique(key) {
    return new _Collection(this.collection.unique(key).all());
  }
  /**
   * Reset the keys on the underlying array
   */
  values() {
    return new _Collection(this.collection.values().all());
  }
  where(key, operatorOrValue, value) {
    if (value === void 0) {
      return new _Collection(this.collection.where(key, operatorOrValue).all());
    }
    return new _Collection(this.collection.where(key, operatorOrValue, value).all());
  }
  /**
   * Filter items by the given key value pair using loose comparison
   */
  whereIn(key, values) {
    return new _Collection(this.collection.whereIn(key, values).all());
  }
  /**
   * Filter items by the given key value pair using loose comparison
   */
  whereNotIn(key, values) {
    return new _Collection(this.collection.whereNotIn(key, values).all());
  }
  /**
   * Zip the collection together with one or more arrays
   */
  zip(...arrays) {
    const zipArgs = arrays;
    return new _Collection(this.collection.zip(...zipArgs).all());
  }
  /**
   * Convert the collection to a plain array
   */
  toArray() {
    return this.all();
  }
  /**
   * Convert the collection to JSON
   */
  toJson() {
    return JSON.stringify(this.all());
  }
  /**
   * Get the collection as a string
   */
  toString() {
    return this.toJson();
  }
};
function collect(items = []) {
  return new Collection(items);
}

// src/collections/map.collection.ts
var MapCollection = class _MapCollection {
  constructor(entries) {
    if (entries && typeof entries === "object" && !(Symbol.iterator in entries)) {
      this.internalMap = new Map(Object.entries(entries));
    } else {
      this.internalMap = new Map(entries);
    }
  }
  /**
   * Create a new map collection instance
   */
  static make(entries) {
    return new _MapCollection(entries);
  }
  /**
   * Get all entries as an array of [key, value] pairs
   */
  all() {
    return Array.from(this.internalMap.entries());
  }
  /**
   * Get the number of items in the map
   */
  count() {
    return this.internalMap.size;
  }
  /**
   * Get the number of items in the map (alias for count)
   */
  size() {
    return this.internalMap.size;
  }
  /**
   * Determine if the map is empty
   */
  isEmpty() {
    return this.internalMap.size === 0;
  }
  /**
   * Determine if the map is not empty
   */
  isNotEmpty() {
    return this.internalMap.size > 0;
  }
  /**
   * Determine if a key exists in the map
   */
  has(key) {
    return this.internalMap.has(key);
  }
  /**
   * Get a value from the map by key
   */
  get(key, defaultValue) {
    return this.internalMap.has(key) ? this.internalMap.get(key) : defaultValue;
  }
  /**
   * Set a value in the map
   */
  set(key, value) {
    this.internalMap.set(key, value);
    return this;
  }
  /**
   * Put a value in the map (alias for set)
   */
  put(key, value) {
    return this.set(key, value);
  }
  /**
   * Remove a key from the map
   */
  delete(key) {
    return this.internalMap.delete(key);
  }
  /**
   * Remove a key from the map (alias for delete)
   */
  forget(key) {
    return this.delete(key);
  }
  /**
   * Remove all items from the map
   */
  clear() {
    this.internalMap.clear();
    return this;
  }
  /**
   * Get all keys from the map
   */
  keys() {
    return Array.from(this.internalMap.keys());
  }
  /**
   * Get all values from the map
   */
  values() {
    return Array.from(this.internalMap.values());
  }
  /**
   * Execute a callback over each item
   */
  each(callback) {
    for (const [key, value] of this.internalMap) {
      if (callback(value, key) === false) {
        break;
      }
    }
    return this;
  }
  /**
   * Run a map over each of the items
   */
  mapValues(callback) {
    const result = /* @__PURE__ */ new Map();
    this.internalMap.forEach((value, key) => {
      result.set(key, callback(value, key));
    });
    return new _MapCollection(result);
  }
  /**
   * Run a filter over each of the items
   */
  filter(callback) {
    const result = /* @__PURE__ */ new Map();
    this.internalMap.forEach((value, key) => {
      if (callback(value, key)) {
        result.set(key, value);
      }
    });
    return new _MapCollection(result);
  }
  /**
   * Determine if all items pass the given test
   */
  every(callback) {
    for (const [key, value] of this.internalMap) {
      if (!callback(value, key)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Determine if any item passes the given test
   */
  some(callback) {
    for (const [key, value] of this.internalMap) {
      if (callback(value, key)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Get the first value that passes the given test
   */
  first(callback) {
    if (!callback) {
      return this.internalMap.values().next().value;
    }
    for (const [key, value] of this.internalMap) {
      if (callback(value, key)) {
        return value;
      }
    }
    return void 0;
  }
  /**
   * Get the last value that passes the given test
   */
  last(callback) {
    const entries = Array.from(this.internalMap.entries()).reverse();
    if (!callback) {
      return entries[0]?.[1];
    }
    for (const [key, value] of entries) {
      if (callback(value, key)) {
        return value;
      }
    }
    return void 0;
  }
  /**
   * Reduce the map to a single value
   */
  reduce(callback, initial) {
    let carry = initial;
    this.internalMap.forEach((value, key) => {
      carry = callback(carry, value, key);
    });
    return carry;
  }
  /**
   * Merge another map into this one
   */
  merge(other) {
    if (other instanceof _MapCollection) {
      other.each((value, key) => {
        this.set(key, value);
        return void 0;
      });
    } else if (other instanceof Map) {
      other.forEach((value, key) => this.set(key, value));
    } else {
      Object.entries(other).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
    return this;
  }
  /**
   * Get only the specified keys
   */
  only(keys) {
    const result = /* @__PURE__ */ new Map();
    keys.forEach((key) => {
      if (this.internalMap.has(key)) {
        result.set(key, this.internalMap.get(key));
      }
    });
    return new _MapCollection(result);
  }
  /**
   * Get all items except the specified keys
   */
  except(keys) {
    const result = /* @__PURE__ */ new Map();
    this.internalMap.forEach((value, key) => {
      if (!keys.includes(key)) {
        result.set(key, value);
      }
    });
    return new _MapCollection(result);
  }
  /**
   * Flip the keys and values
   */
  flip() {
    const result = /* @__PURE__ */ new Map();
    this.internalMap.forEach((value, key) => {
      result.set(value, key);
    });
    return new _MapCollection(result);
  }
  /**
   * Pass the map to the given callback and return the result
   */
  pipe(callback) {
    return callback(this);
  }
  /**
   * Pass the map to the given callback and then return it
   */
  tap(callback) {
    callback(this);
    return this;
  }
  /**
   * Convert the map to a plain object
   */
  toObject() {
    const obj = {};
    this.internalMap.forEach((value, key) => {
      obj[String(key)] = value;
    });
    return obj;
  }
  /**
   * Convert the map to an array of [key, value] pairs
   */
  toArray() {
    return this.all();
  }
  /**
   * Convert the map to JSON
   */
  toJson() {
    return JSON.stringify(this.toObject());
  }
  /**
   * Get the map as a string
   */
  toString() {
    return this.toJson();
  }
  /**
   * Get the underlying Map instance
   */
  toMap() {
    return new Map(this.internalMap);
  }
};
function collectMap(entries) {
  return new MapCollection(entries);
}

// src/collections/set.collection.ts
var SetCollection = class _SetCollection {
  constructor(items) {
    this.set = new Set(items);
  }
  /**
   * Create a new set collection instance
   */
  static make(items) {
    return new _SetCollection(items);
  }
  /**
   * Get all items as an array
   */
  all() {
    return Array.from(this.set);
  }
  /**
   * Get the number of items in the set
   */
  count() {
    return this.set.size;
  }
  /**
   * Get the number of items in the set (alias for count)
   */
  size() {
    return this.set.size;
  }
  /**
   * Determine if the set is empty
   */
  isEmpty() {
    return this.set.size === 0;
  }
  /**
   * Determine if the set is not empty
   */
  isNotEmpty() {
    return this.set.size > 0;
  }
  /**
   * Determine if an item exists in the set
   */
  has(item) {
    return this.set.has(item);
  }
  /**
   * Determine if an item exists in the set (alias for has)
   */
  contains(item) {
    return this.has(item);
  }
  /**
   * Add an item to the set
   */
  add(item) {
    this.set.add(item);
    return this;
  }
  /**
   * Add an item to the set (alias for add)
   */
  push(item) {
    return this.add(item);
  }
  /**
   * Remove an item from the set
   */
  delete(item) {
    return this.set.delete(item);
  }
  /**
   * Remove an item from the set (alias for delete)
   */
  forget(item) {
    return this.delete(item);
  }
  /**
   * Remove all items from the set
   */
  clear() {
    this.set.clear();
    return this;
  }
  /**
   * Execute a callback over each item
   */
  each(callback) {
    let index = 0;
    for (const item of this.set) {
      if (callback(item, index++) === false) {
        break;
      }
    }
    return this;
  }
  /**
   * Run a map over each of the items
   */
  map(callback) {
    const result = /* @__PURE__ */ new Set();
    let index = 0;
    this.set.forEach((item) => {
      result.add(callback(item, index++));
    });
    return new _SetCollection(result);
  }
  /**
   * Run a filter over each of the items
   */
  filter(callback) {
    const result = /* @__PURE__ */ new Set();
    let index = 0;
    this.set.forEach((item) => {
      if (callback(item, index++)) {
        result.add(item);
      }
    });
    return new _SetCollection(result);
  }
  /**
   * Determine if all items pass the given test
   */
  every(callback) {
    let index = 0;
    for (const item of this.set) {
      if (!callback(item, index++)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Determine if any item passes the given test
   */
  some(callback) {
    let index = 0;
    for (const item of this.set) {
      if (callback(item, index++)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Get the first item that passes the given test
   */
  first(callback) {
    if (!callback) {
      return this.set.values().next().value;
    }
    let index = 0;
    for (const item of this.set) {
      if (callback(item, index++)) {
        return item;
      }
    }
    return void 0;
  }
  /**
   * Get the last item that passes the given test
   */
  last(callback) {
    const items = Array.from(this.set).reverse();
    if (!callback) {
      return items[0];
    }
    for (let i = 0; i < items.length; i++) {
      if (callback(items[i], i)) {
        return items[i];
      }
    }
    return void 0;
  }
  /**
   * Reduce the set to a single value
   */
  reduce(callback, initial) {
    let carry = initial;
    let index = 0;
    this.set.forEach((item) => {
      carry = callback(carry, item, index++);
    });
    return carry;
  }
  /**
   * Merge another set into this one
   */
  merge(other) {
    if (other instanceof _SetCollection) {
      other.each((item) => {
        this.add(item);
        return void 0;
      });
    } else if (other instanceof Set) {
      other.forEach((item) => this.add(item));
    } else {
      other.forEach((item) => this.add(item));
    }
    return this;
  }
  /**
   * Get the union of this set and another
   */
  union(other) {
    const result = new _SetCollection(this.set);
    return result.merge(other);
  }
  /**
   * Get the intersection of this set and another
   */
  intersect(other) {
    const otherSet = other instanceof _SetCollection ? other.toSet() : other instanceof Set ? other : new Set(other);
    const result = /* @__PURE__ */ new Set();
    this.set.forEach((item) => {
      if (otherSet.has(item)) {
        result.add(item);
      }
    });
    return new _SetCollection(result);
  }
  /**
   * Get the difference between this set and another
   */
  diff(other) {
    const otherSet = other instanceof _SetCollection ? other.toSet() : other instanceof Set ? other : new Set(other);
    const result = /* @__PURE__ */ new Set();
    this.set.forEach((item) => {
      if (!otherSet.has(item)) {
        result.add(item);
      }
    });
    return new _SetCollection(result);
  }
  /**
   * Get items that are in either set but not in both
   */
  symmetricDiff(other) {
    const otherSet = other instanceof _SetCollection ? other.toSet() : other instanceof Set ? other : new Set(other);
    const result = /* @__PURE__ */ new Set();
    this.set.forEach((item) => {
      if (!otherSet.has(item)) {
        result.add(item);
      }
    });
    otherSet.forEach((item) => {
      if (!this.set.has(item)) {
        result.add(item);
      }
    });
    return new _SetCollection(result);
  }
  /**
   * Determine if this set is a subset of another
   */
  isSubsetOf(other) {
    const otherSet = other instanceof _SetCollection ? other.toSet() : other instanceof Set ? other : new Set(other);
    for (const item of this.set) {
      if (!otherSet.has(item)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Determine if this set is a superset of another
   */
  isSupersetOf(other) {
    const otherSet = other instanceof _SetCollection ? other.toSet() : other instanceof Set ? other : new Set(other);
    for (const item of otherSet) {
      if (!this.set.has(item)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Pass the set to the given callback and return the result
   */
  pipe(callback) {
    return callback(this);
  }
  /**
   * Pass the set to the given callback and then return it
   */
  tap(callback) {
    callback(this);
    return this;
  }
  /**
   * Convert the set to an array
   */
  toArray() {
    return this.all();
  }
  /**
   * Convert the set to JSON
   */
  toJson() {
    return JSON.stringify(this.all());
  }
  /**
   * Get the set as a string
   */
  toString() {
    return this.toJson();
  }
  /**
   * Get the underlying Set instance
   */
  toSet() {
    return new Set(this.set);
  }
};
function collectSet(items) {
  return new SetCollection(items);
}

// src/registries/base.registry.ts
var BaseRegistry = class {
  /**
   * Create a new registry.
   *
   * @param options - Optional default item, validation, and lifecycle hooks
   */
  constructor(options = {}) {
    /**
     * Internal map-based storage.
     */
    this.storage = new MapCollection();
    this.defaultItem = options.defaultItem;
    this.validateBeforeAdd = options.validateBeforeAdd;
    this.afterAdd = options.afterAdd;
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Core
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Register (add or replace) an item.
   *
   * Runs the `validateBeforeAdd` hook first; throws on failure.
   * Fires the `afterAdd` hook on success.
   *
   * @param key  - Unique identifier
   * @param item - Value to store
   * @throws Error if validation fails
   */
  register(key, item) {
    if (this.validateBeforeAdd) {
      const result = this.validateBeforeAdd(key, item);
      if (!result.valid) {
        throw new Error(`Validation failed for key "${key}": ${result.error || "Unknown error"}`);
      }
    }
    this.storage.set(key, item);
    if (this.afterAdd) {
      this.afterAdd(key, item);
    }
  }
  // ──────────────────────────────────────────────────────────────────────────
  // ICollection interface
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * @inheritdoc — delegates to {@link register} so hooks still fire.
   */
  add(key, value) {
    this.register(key, value);
  }
  /**
   * Retrieve an item by key.
   *
   * Falls back to {@link defaultItem} when the key is not found.
   *
   * @param key - Item identifier
   * @returns The stored value, the default item, or `undefined`
   */
  get(key) {
    return this.storage.get(key) ?? this.defaultItem;
  }
  /**
   * Return every stored value in insertion order.
   */
  getAll() {
    return this.storage.values();
  }
  /**
   * Return every registered key in insertion order.
   */
  getKeys() {
    return this.storage.keys();
  }
  /**
   * Convert the registry to a plain `Record<string, T>`.
   */
  getAsRecord() {
    return this.storage.toObject();
  }
  /**
   * Check whether a key exists.
   */
  has(key) {
    return this.storage.has(key);
  }
  /**
   * Remove an item by key.
   *
   * @returns `true` if the key existed and was removed
   */
  remove(key) {
    return this.storage.delete(key);
  }
  /**
   * Remove all items from the registry.
   */
  clear() {
    this.storage.clear();
  }
  /**
   * Return the number of registered items.
   */
  size() {
    return this.storage.size();
  }
  /**
   * Return `true` when the registry is empty.
   */
  isEmpty() {
    return this.storage.isEmpty();
  }
  /**
   * Iterate over every entry in insertion order.
   */
  forEach(callback) {
    this.storage.each((value, key) => {
      callback(value, key);
    });
  }
  /**
   * Map every entry to a new value and return the results as an array.
   */
  map(callback) {
    const result = [];
    this.storage.each((value, key) => {
      result.push(callback(value, key));
    });
    return result;
  }
  /**
   * Return all values whose entries satisfy the predicate.
   */
  filter(predicate) {
    const result = [];
    this.storage.each((value, key) => {
      if (predicate(value, key)) {
        result.push(value);
      }
    });
    return result;
  }
  /**
   * Return the first value whose entry satisfies the predicate.
   */
  find(predicate) {
    return this.storage.first(predicate);
  }
};

// src/chains/resolver-chain.util.ts
var ResolverChain = class {
  constructor() {
    /** Internal storage keyed by id for O(1) dedup. */
    this.items = /* @__PURE__ */ new Map();
    /** Cached sorted array — invalidated on register/remove. */
    this.sorted = null;
  }
  /**
   * Register a resolver. Re-registering the same `id` replaces the
   * existing entry (allows apps to shadow built-in resolvers).
   *
   * @param resolver - The resolver to register
   */
  register(resolver) {
    this.items.set(resolver.id, resolver);
    this.sorted = null;
  }
  /**
   * Register multiple resolvers at once.
   *
   * @param resolvers - Array of resolvers to register
   */
  registerMany(resolvers) {
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
  remove(id) {
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
  has(id) {
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
  resolve(input) {
    const ordered = this.getOrdered();
    for (const resolver of ordered) {
      if (isGuarded(resolver) && !resolver.match(input)) {
        continue;
      }
      const result = resolver.resolve(input);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }
  /**
   * Get all resolvers sorted by priority ascending.
   *
   * @returns Sorted array of resolvers
   */
  getOrdered() {
    if (!this.sorted) {
      this.sorted = [...this.items.values()].sort(
        (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
      );
    }
    return this.sorted;
  }
  /**
   * Get the number of registered resolvers.
   *
   * @returns The count
   */
  size() {
    return this.items.size;
  }
  /**
   * Remove all resolvers.
   */
  clear() {
    this.items.clear();
    this.sorted = null;
  }
};
function isGuarded(resolver) {
  return typeof resolver.match === "function";
}

// src/chains/transformer-chain.util.ts
var TransformerChain = class {
  constructor() {
    /** Internal storage keyed by id for O(1) dedup. */
    this.items = /* @__PURE__ */ new Map();
    /** Cached sorted array — invalidated on register/remove. */
    this.sorted = null;
  }
  /**
   * Register a transformer. Re-registering the same `id` replaces the
   * existing entry (allows apps to shadow built-in transformers).
   *
   * @param transformer - The transformer to register
   */
  register(transformer) {
    this.items.set(transformer.id, transformer);
    this.sorted = null;
  }
  /**
   * Register multiple transformers at once.
   *
   * @param transformers - Array of transformers to register
   */
  registerMany(transformers) {
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
  remove(id) {
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
  has(id) {
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
  run(data, context) {
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
  getOrdered() {
    if (!this.sorted) {
      this.sorted = [...this.items.values()].sort(
        (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
      );
    }
    return this.sorted;
  }
  /**
   * Get the number of registered transformers.
   *
   * @returns The count
   */
  size() {
    return this.items.size;
  }
  /**
   * Remove all transformers.
   */
  clear() {
    this.items.clear();
    this.sorted = null;
  }
};

// src/services/multiple-instance-manager.service.ts
var MultipleInstanceManager = class {
  constructor() {
    /**
     * Resolved instances, keyed by instance name.
     * Instances are created once and reused on subsequent calls.
     */
    this.instances = /* @__PURE__ */ new Map();
    /**
     * In-flight async resolutions, keyed by instance name.
     * Prevents duplicate async driver creation when `instanceAsync()`
     * is called multiple times before the first one resolves.
     */
    this.pending = /* @__PURE__ */ new Map();
    /**
     * Custom driver creators registered via `extend()`.
     * Keyed by driver name.
     */
    this.customCreators = /* @__PURE__ */ new Map();
    /**
     * The config key that identifies the driver in instance config.
     * Override in subclasses if your config uses a different field name.
     *
     * @default 'driver'
     */
    this.driverKey = "driver";
  }
  /**
   * Create a driver instance asynchronously.
   * Called by `instanceAsync()` when no custom creator is registered.
   *
   * Override this for drivers that require async initialization
   * (e.g., establishing connections, loading remote config).
   *
   * By default, falls back to the sync `createDriver()`.
   *
   * @param driver - The driver name from config
   * @param config - The raw instance config
   * @returns A promise that resolves to the driver instance
   */
  async createDriverAsync(driver, config) {
    return this.createDriver(driver, config);
  }
  // ── Lifecycle hook ──────────────────────────────────────────────────────
  /**
   * Called after a new instance is created and before it's cached.
   * Override to configure instances (e.g., set names, event dispatchers).
   *
   * @param name - The instance name
   * @param instance - The newly created instance
   * @returns The instance (possibly modified)
   */
  onInstanceCreated(_name, instance) {
    return instance;
  }
  // ── Public API — Sync ───────────────────────────────────────────────────
  /**
   * Get an instance by name (sync).
   *
   * Returns a cached instance if available, otherwise resolves
   * via `createDriver()` and caches it.
   *
   * @param name - Instance name (uses default if omitted)
   */
  instance(name) {
    const instanceName = name ?? this.getDefaultInstance();
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }
    const resolved = this.resolve(instanceName);
    this.instances.set(instanceName, resolved);
    return resolved;
  }
  // ── Public API — Async ──────────────────────────────────────────────────
  /**
   * Get an instance by name (async).
   *
   * Returns a cached instance if available, otherwise resolves
   * via `createDriverAsync()` and caches it.
   *
   * Deduplicates in-flight resolutions — if two callers request
   * the same instance simultaneously, they share one Promise.
   *
   * @param name - Instance name (uses default if omitted)
   *
   * @example
   * ```typescript
   * // In RedisManager:
   * async connection(name?: string): Promise<RedisConnection> {
   *   return this.instanceAsync(name);
   * }
   * ```
   */
  async instanceAsync(name) {
    const instanceName = name ?? this.getDefaultInstance();
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }
    let promise = this.pending.get(instanceName);
    if (!promise) {
      promise = this.resolveAsync(instanceName);
      this.pending.set(instanceName, promise);
    }
    try {
      const resolved = await promise;
      this.instances.set(instanceName, resolved);
      return resolved;
    } finally {
      this.pending.delete(instanceName);
    }
  }
  // ── Public API — Registration ───────────────────────────────────────────
  /**
   * Register a custom driver creator.
   * Custom creators take priority over built-in drivers.
   */
  extend(driver, creator) {
    this.customCreators.set(driver, creator);
    return this;
  }
  // ── Public API — Cache management ───────────────────────────────────────
  /**
   * Remove a cached instance, forcing re-creation on next access.
   *
   * @param name - Instance name(s). Uses default if omitted.
   */
  forgetInstance(name) {
    const names = name ? Array.isArray(name) ? name : [name] : [this.getDefaultInstance()];
    for (const n of names) {
      this.instances.delete(n);
    }
    return this;
  }
  /**
   * Remove all cached instances.
   */
  purge() {
    this.instances.clear();
    this.pending.clear();
  }
  /**
   * Check if an instance has been resolved and cached.
   */
  hasInstance(name) {
    return this.instances.has(name);
  }
  /**
   * Get all resolved instance names.
   */
  getResolvedInstances() {
    return Array.from(this.instances.keys());
  }
  /**
   * Manually set a resolved instance in the cache.
   * Useful when instance creation happens outside the normal
   * `instance()` / `instanceAsync()` flow.
   */
  setInstance(name, instance) {
    this.instances.set(name, instance);
  }
  // ── Deprecated aliases (backward compat) ────────────────────────────────
  /**
   * @deprecated Use `hasInstance()` instead.
   */
  hasResolvedInstance(name) {
    return this.hasInstance(name);
  }
  // ── Private — Sync resolution ───────────────────────────────────────────
  resolve(name) {
    const config = this.getInstanceConfig(name);
    if (!config) {
      throw new Error(`Instance [${name}] is not defined.`);
    }
    const driver = config[this.driverKey];
    if (!driver) {
      throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
    }
    const customCreator = this.customCreators.get(driver);
    const instance = customCreator ? customCreator(config) : this.createDriver(driver, config);
    return this.onInstanceCreated(name, instance);
  }
  // ── Private — Async resolution ──────────────────────────────────────────
  async resolveAsync(name) {
    const config = this.getInstanceConfig(name);
    if (!config) {
      throw new Error(`Instance [${name}] is not defined.`);
    }
    const driver = config[this.driverKey];
    if (!driver) {
      throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
    }
    const customCreator = this.customCreators.get(driver);
    const instance = customCreator ? customCreator(config) : await this.createDriverAsync(driver, config);
    return this.onInstanceCreated(name, instance);
  }
};

Object.defineProperty(exports, "AsyncDebouncer", {
  enumerable: true,
  get: function () { return pacer.AsyncDebouncer; }
});
Object.defineProperty(exports, "AsyncQueuer", {
  enumerable: true,
  get: function () { return pacer.AsyncQueuer; }
});
Object.defineProperty(exports, "AsyncRateLimiter", {
  enumerable: true,
  get: function () { return pacer.AsyncRateLimiter; }
});
Object.defineProperty(exports, "AsyncThrottler", {
  enumerable: true,
  get: function () { return pacer.AsyncThrottler; }
});
Object.defineProperty(exports, "Debouncer", {
  enumerable: true,
  get: function () { return pacer.Debouncer; }
});
Object.defineProperty(exports, "Queuer", {
  enumerable: true,
  get: function () { return pacer.Queuer; }
});
Object.defineProperty(exports, "RateLimiter", {
  enumerable: true,
  get: function () { return pacer.RateLimiter; }
});
Object.defineProperty(exports, "Throttler", {
  enumerable: true,
  get: function () { return pacer.Throttler; }
});
Object.defineProperty(exports, "asyncDebounce", {
  enumerable: true,
  get: function () { return pacer.asyncDebounce; }
});
Object.defineProperty(exports, "asyncQueue", {
  enumerable: true,
  get: function () { return pacer.asyncQueue; }
});
Object.defineProperty(exports, "asyncRateLimit", {
  enumerable: true,
  get: function () { return pacer.asyncRateLimit; }
});
Object.defineProperty(exports, "asyncThrottle", {
  enumerable: true,
  get: function () { return pacer.asyncThrottle; }
});
Object.defineProperty(exports, "debounce", {
  enumerable: true,
  get: function () { return pacer.debounce; }
});
Object.defineProperty(exports, "queue", {
  enumerable: true,
  get: function () { return pacer.queue; }
});
Object.defineProperty(exports, "rateLimit", {
  enumerable: true,
  get: function () { return pacer.rateLimit; }
});
Object.defineProperty(exports, "throttle", {
  enumerable: true,
  get: function () { return pacer.throttle; }
});
exports.Arr = Arr;
exports.BaseRegistry = BaseRegistry;
exports.Collection = Collection;
exports.Env = Env;
exports.MapCollection = MapCollection;
exports.MultipleInstanceManager = MultipleInstanceManager;
exports.Num = Num;
exports.ResolverChain = ResolverChain;
exports.SetCollection = SetCollection;
exports.Str = Str;
exports.Stringable = Stringable;
exports.TransformerChain = TransformerChain;
exports.collect = collect;
exports.collectMap = collectMap;
exports.collectSet = collectSet;
exports.env = env;
