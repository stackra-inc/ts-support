/**
 * Fluent string wrapper for chainable string operations.
 * 
 * Provides a fluent interface for all Str methods, allowing method chaining.
 * Similar to Laravel's Stringable class.
 * 
 * @example
 * ```typescript
 * const result = new Stringable('hello-world')
 *   .camel()
 *   .ucfirst()
 *   .toString(); // 'HelloWorld'
 * ```
 */
import { Str } from './str';

export class Stringable {
  constructor(private value: string = '') {}

  /**
   * Get the underlying string value.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get the underlying string value.
   * Alias for toString().
   */
  valueOf(): string {
    return this.value;
  }

  // ============================================================================
  // Fluent Str Methods
  // ============================================================================

  after(search: string): Stringable {
    return new Stringable(Str.after(this.value, search));
  }

  afterLast(search: string): Stringable {
    return new Stringable(Str.afterLast(this.value, search));
  }

  apa(): Stringable {
    return new Stringable(Str.apa(this.value));
  }

  ascii(): Stringable {
    return new Stringable(Str.ascii(this.value));
  }

  before(search: string): Stringable {
    return new Stringable(Str.before(this.value, search));
  }

  beforeLast(search: string): Stringable {
    return new Stringable(Str.beforeLast(this.value, search));
  }

  between(from: string, to: string): Stringable {
    return new Stringable(Str.between(this.value, from, to));
  }

  betweenFirst(from: string, to: string): Stringable {
    return new Stringable(Str.betweenFirst(this.value, from, to));
  }

  camel(): Stringable {
    return new Stringable(Str.camel(this.value));
  }

  charAt(index: number): string | false {
    return Str.charAt(this.value, index);
  }

  chopStart(search: string | string[]): Stringable {
    return new Stringable(Str.chopStart(this.value, search));
  }

  chopEnd(search: string | string[]): Stringable {
    return new Stringable(Str.chopEnd(this.value, search));
  }

  contains(needles: string | string[], ignoreCase = false): boolean {
    return Str.contains(this.value, needles, ignoreCase);
  }

  containsAll(needles: string[], ignoreCase = false): boolean {
    return Str.containsAll(this.value, needles, ignoreCase);
  }

  doesntContain(needles: string | string[], ignoreCase = false): boolean {
    return Str.doesntContain(this.value, needles, ignoreCase);
  }

  deduplicate(character = ' '): Stringable {
    return new Stringable(Str.deduplicate(this.value, character));
  }

  endsWith(needles: string | string[]): boolean {
    return Str.endsWith(this.value, needles);
  }

  excerpt(phrase: string, options: { radius?: number; omission?: string } = {}): string {
    return Str.excerpt(this.value, phrase, options);
  }

  finish(cap: string): Stringable {
    return new Stringable(Str.finish(this.value, cap));
  }

  headline(): Stringable {
    return new Stringable(Str.headline(this.value));
  }

  is(pattern: string, ignoreCase = false): boolean {
    return Str.is(pattern, this.value, ignoreCase);
  }

  isAscii(): boolean {
    return Str.isAscii(this.value);
  }

  isJson(): boolean {
    return Str.isJson(this.value);
  }

  isUrl(protocols?: string[]): boolean {
    return Str.isUrl(this.value, protocols);
  }

  isUlid(): boolean {
    return Str.isUlid(this.value);
  }

  isUuid(): boolean {
    return Str.isUuid(this.value);
  }

  kebab(): Stringable {
    return new Stringable(Str.kebab(this.value));
  }

  lcfirst(): Stringable {
    return new Stringable(Str.lcfirst(this.value));
  }

  length(): number {
    return Str.len(this.value);
  }

  limit(limit = 100, end = '...', preserveWords = false): Stringable {
    return new Stringable(Str.limit(this.value, limit, end, preserveWords));
  }

  lower(): Stringable {
    return new Stringable(Str.lower(this.value));
  }

  mask(character: string, index: number, length?: number): Stringable {
    return new Stringable(Str.mask(this.value, character, index, length));
  }

  padBoth(length: number, pad = ' '): Stringable {
    return new Stringable(Str.padBoth(this.value, length, pad));
  }

  padLeft(length: number, pad = ' '): Stringable {
    return new Stringable(Str.padLeft(this.value, length, pad));
  }

  padRight(length: number, pad = ' '): Stringable {
    return new Stringable(Str.padRight(this.value, length, pad));
  }

  plural(count = 2): Stringable {
    return new Stringable(Str.plural(this.value, count));
  }

  pluralStudly(count = 2): Stringable {
    return new Stringable(Str.pluralStudly(this.value, count));
  }

  position(needle: string): number | false {
    return Str.position(this.value, needle);
  }

  remove(search: string | string[], caseSensitive = true): Stringable {
    return new Stringable(Str.remove(search, this.value, caseSensitive));
  }

  repeat(times: number): Stringable {
    return new Stringable(Str.repeat(this.value, times));
  }

  replace(search: string, replace: string, caseSensitive = true): Stringable {
    return new Stringable(Str.replace(search, replace, this.value, caseSensitive));
  }

  replaceArray(search: string, replacements: string[]): Stringable {
    return new Stringable(Str.replaceArray(search, replacements, this.value));
  }

  replaceFirst(search: string, replace: string): Stringable {
    return new Stringable(Str.replaceFirst(search, replace, this.value));
  }

  replaceLast(search: string, replace: string): Stringable {
    return new Stringable(Str.replaceLast(search, replace, this.value));
  }

  replaceStart(search: string, replace: string): Stringable {
    return new Stringable(Str.replaceStart(search, replace, this.value));
  }

  replaceEnd(search: string, replace: string): Stringable {
    return new Stringable(Str.replaceEnd(search, replace, this.value));
  }

  reverse(): Stringable {
    return new Stringable(Str.reverse(this.value));
  }

  singular(): Stringable {
    return new Stringable(Str.singular(this.value));
  }

  slug(separator = '-'): Stringable {
    return new Stringable(Str.slug(this.value, separator));
  }

  snake(delimiter = '_'): Stringable {
    return new Stringable(Str.snake(this.value, delimiter));
  }

  squish(): Stringable {
    return new Stringable(Str.squish(this.value));
  }

  start(prefix: string): Stringable {
    return new Stringable(Str.start(this.value, prefix));
  }

  startsWith(needles: string | string[]): boolean {
    return Str.startsWith(this.value, needles);
  }

  studly(): Stringable {
    return new Stringable(Str.studly(this.value));
  }

  substr(start: number, length?: number): Stringable {
    return new Stringable(Str.substr(this.value, start, length));
  }

  substrCount(needle: string): number {
    return Str.substrCount(this.value, needle);
  }

  substrReplace(replace: string, start: number, length?: number): Stringable {
    return new Stringable(Str.substrReplace(this.value, replace, start, length));
  }

  swap(map: Record<string, string>): Stringable {
    return new Stringable(Str.swap(map, this.value));
  }

  take(limit: number): Stringable {
    return new Stringable(Str.take(this.value, limit));
  }

  title(): Stringable {
    return new Stringable(Str.title(this.value));
  }

  toBase64(): string {
    return Str.toBase64(this.value);
  }

  transliterate(): Stringable {
    return new Stringable(Str.transliterate(this.value));
  }

  trim(characters?: string): Stringable {
    return new Stringable(Str.trim(this.value, characters));
  }

  ltrim(characters?: string): Stringable {
    return new Stringable(Str.ltrim(this.value, characters));
  }

  rtrim(characters?: string): Stringable {
    return new Stringable(Str.rtrim(this.value, characters));
  }

  ucfirst(): Stringable {
    return new Stringable(Str.ucfirst(this.value));
  }

  ucsplit(): string[] {
    return Str.ucsplit(this.value);
  }

  upper(): Stringable {
    return new Stringable(Str.upper(this.value));
  }

  unwrap(before: string, after?: string): Stringable {
    return new Stringable(Str.unwrap(this.value, before, after));
  }

  wordCount(): number {
    return Str.wordCount(this.value);
  }

  wordWrap(characters = 75, breakStr = '\n'): Stringable {
    return new Stringable(Str.wordWrap(this.value, characters, breakStr));
  }

  words(words = 100, end = '...'): Stringable {
    return new Stringable(Str.words(this.value, words, end));
  }

  wrap(before: string, after?: string): Stringable {
    return new Stringable(Str.wrap(this.value, before, after));
  }
}
