/**
 * Laravel-style string manipulation class
 * Provides static methods for common string operations
 */
export class Str {
  /**
   * Return the remainder of a string after the first occurrence of a given value
   */
  static after(subject: string, search: string): string {
    if (search === '') return subject;
    const index = subject.indexOf(search);
    return index === -1 ? subject : subject.substring(index + search.length);
  }

  /**
   * Return the remainder of a string after the last occurrence of a given value
   */
  static afterLast(subject: string, search: string): string {
    if (search === '') return subject;
    const index = subject.lastIndexOf(search);
    return index === -1 ? subject : subject.substring(index + search.length);
  }

  /**
   * Convert a string to title case following APA guidelines
   */
  static apa(value: string): string {
    const minorWords = [
      'a',
      'an',
      'and',
      'as',
      'at',
      'but',
      'by',
      'for',
      'in',
      'of',
      'on',
      'or',
      'the',
      'to',
      'up',
    ];
    const words = value.split(' ');

    return words
      .map((word, index) => {
        if (index === 0 || !minorWords.includes(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(' ');
  }

  /**
   * Transliterate a UTF-8 value to ASCII
   */
  static ascii(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Get the portion of a string before the first occurrence of a given value
   */
  static before(subject: string, search: string): string {
    if (search === '') return subject;
    const index = subject.indexOf(search);
    return index === -1 ? subject : subject.substring(0, index);
  }

  /**
   * Get the portion of a string before the last occurrence of a given value
   */
  static beforeLast(subject: string, search: string): string {
    if (search === '') return subject;
    const index = subject.lastIndexOf(search);
    return index === -1 ? subject : subject.substring(0, index);
  }

  /**
   * Get the portion of a string between two values
   */
  static between(subject: string, from: string, to: string): string {
    if (from === '' || to === '') return subject;
    const startIndex = subject.indexOf(from);
    if (startIndex === -1) return '';
    const start = startIndex + from.length;
    const endIndex = subject.indexOf(to, start);
    return endIndex === -1 ? '' : subject.substring(start, endIndex);
  }

  /**
   * Get the smallest possible portion of a string between two values
   */
  static betweenFirst(subject: string, from: string, to: string): string {
    return Str.between(subject, from, to);
  }

  /**
   * Convert a string to camelCase
   */
  static camel(value: string): string {
    return value
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^(.)/, (char) => char.toLowerCase());
  }

  /**
   * Get the character at the specified index
   */
  static charAt(subject: string, index: number): string | false {
    if (index < 0 || index >= subject.length) return false;
    return subject.charAt(index);
  }

  /**
   * Remove the first occurrence of the given value from the start of the string
   */
  static chopStart(subject: string, search: string | string[]): string {
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
  static chopEnd(subject: string, search: string | string[]): string {
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
  static contains(haystack: string, needles: string | string[], ignoreCase = false): boolean {
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
  static containsAll(haystack: string, needles: string[], ignoreCase = false): boolean {
    const subject = ignoreCase ? haystack.toLowerCase() : haystack;

    return needles.every((needle) => {
      const search = ignoreCase ? needle.toLowerCase() : needle;
      return subject.includes(search);
    });
  }

  /**
   * Determine if a given string doesn't contain a given substring
   */
  static doesntContain(haystack: string, needles: string | string[], ignoreCase = false): boolean {
    return !Str.contains(haystack, needles, ignoreCase);
  }

  /**
   * Replace consecutive instances of a character with a single instance
   */
  static deduplicate(value: string, character = ' '): string {
    const escaped = character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escaped}+`, 'g');
    return value.replace(regex, character);
  }

  /**
   * Determine if a given string ends with a given substring
   */
  static endsWith(haystack: string, needles: string | string[]): boolean {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    return needleArray.some((needle) => haystack.endsWith(needle));
  }

  /**
   * Extract an excerpt from text that matches the first instance of a phrase
   */
  static excerpt(
    text: string,
    phrase: string,
    options: { radius?: number; omission?: string } = {}
  ): string {
    const radius = options.radius ?? 100;
    const omission = options.omission ?? '...';

    const index = text.indexOf(phrase);
    if (index === -1) return '';

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
  static finish(value: string, cap: string): string {
    return value.endsWith(cap) ? value : value + cap;
  }

  /**
   * Convert a string to headline case
   */
  static headline(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Determine if a given string matches a given pattern
   */
  static is(pattern: string, value: string, ignoreCase = false): boolean {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const flags = ignoreCase ? 'i' : '';
    const regex = new RegExp(`^${regexPattern}$`, flags);
    return regex.test(value);
  }

  /**
   * Determine if a given string is 7-bit ASCII
   */
  static isAscii(value: string): boolean {
    return /^[\x00-\x7F]*$/.test(value);
  }

  /**
   * Determine if a given string is valid JSON
   */
  static isJson(value: string): boolean {
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
  static isUrl(value: string, protocols?: string[]): boolean {
    try {
      if (typeof URL === 'undefined') {
        // Fallback for environments without URL constructor
        const urlPattern = /^https?:\/\/.+/i;
        return urlPattern.test(value);
      }
      const urlObj = new URL(value);
      if (protocols) {
        return protocols.includes(urlObj.protocol.replace(':', ''));
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Determine if a given string is a valid ULID
   */
  static isUlid(value: string): boolean {
    return /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(value);
  }

  /**
   * Determine if a given string is a valid UUID
   */
  static isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Convert a string to kebab-case
   */
  static kebab(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Return the given string with the first character lowercased
   */
  static lcfirst(value: string): string {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }

  /**
   * Return the length of the given string
   */
  static len(value: string): number {
    return value.length;
  }

  /**
   * Limit the number of characters in a string
   */
  static limit(value: string, limit = 100, end = '...', preserveWords = false): string {
    if (value.length <= limit) return value;

    let truncated = value.substring(0, limit);

    if (preserveWords) {
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 0) {
        truncated = truncated.substring(0, lastSpace);
      }
    }

    return truncated + end;
  }

  /**
   * Convert the given string to lowercase
   */
  static lower(value: string): string {
    return value.toLowerCase();
  }

  /**
   * Masks a portion of a string with a repeated character
   */
  static mask(value: string, character: string, index: number, length?: number): string {
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
  static padBoth(value: string, length: number, pad = ' '): string {
    const totalPadding = length - value.length;
    if (totalPadding <= 0) return value;

    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;

    return pad.repeat(leftPadding) + value + pad.repeat(rightPadding);
  }

  /**
   * Pad the left side of a string with another
   */
  static padLeft(value: string, length: number, pad = ' '): string {
    return value.padStart(length, pad);
  }

  /**
   * Pad the right side of a string with another
   */
  static padRight(value: string, length: number, pad = ' '): string {
    return value.padEnd(length, pad);
  }

  /**
   * Get the plural form of an English word
   */
  static plural(value: string, count = 2): string {
    if (count === 1) return value;

    // Simple pluralization rules
    if (value.endsWith('y') && !/[aeiou]y$/i.test(value)) {
      return value.slice(0, -1) + 'ies';
    }
    if (
      value.endsWith('s') ||
      value.endsWith('x') ||
      value.endsWith('z') ||
      value.endsWith('ch') ||
      value.endsWith('sh')
    ) {
      return value + 'es';
    }
    return value + 's';
  }

  /**
   * Pluralize the last word of an English, studly caps case string
   */
  static pluralStudly(value: string, count = 2): string {
    const parts = value.match(/[A-Z][a-z]*/g) || [value];
    const lastWord = parts[parts.length - 1]!;
    const pluralized = Str.plural(lastWord, count);
    parts[parts.length - 1] = pluralized;
    return parts.join('');
  }

  /**
   * Find the position of the first occurrence of a substring
   */
  static position(haystack: string, needle: string): number | false {
    const pos = haystack.indexOf(needle);
    return pos === -1 ? false : pos;
  }

  /**
   * Generate a random string
   */
  static random(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Remove the given value from the string
   */
  static remove(search: string | string[], subject: string, caseSensitive = true): string {
    const searches = Array.isArray(search) ? search : [search];
    let result = subject;

    searches.forEach((s) => {
      const flags = caseSensitive ? 'g' : 'gi';
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, flags), '');
    });

    return result;
  }

  /**
   * Repeat the given string
   */
  static repeat(value: string, times: number): string {
    return value.repeat(times);
  }

  /**
   * Replace the given value in the given string
   */
  static replace(search: string, replace: string, subject: string, caseSensitive = true): string {
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return subject.replace(new RegExp(escaped, flags), replace);
  }

  /**
   * Replace a given value in the string sequentially with an array
   */
  static replaceArray(search: string, replacements: string[], subject: string): string {
    let result = subject;
    let index = 0;

    while (result.includes(search) && index < replacements.length) {
      result = result.replace(search, replacements[index]!);
      index++;
    }

    return result;
  }

  /**
   * Replace the first occurrence of a given value in the string
   */
  static replaceFirst(search: string, replace: string, subject: string): string {
    return subject.replace(search, replace);
  }

  /**
   * Replace the last occurrence of a given value in the string
   */
  static replaceLast(search: string, replace: string, subject: string): string {
    const index = subject.lastIndexOf(search);
    if (index === -1) return subject;
    return subject.substring(0, index) + replace + subject.substring(index + search.length);
  }

  /**
   * Replace the first occurrence only if it appears at the start
   */
  static replaceStart(search: string, replace: string, subject: string): string {
    return subject.startsWith(search) ? replace + subject.substring(search.length) : subject;
  }

  /**
   * Replace the last occurrence only if it appears at the end
   */
  static replaceEnd(search: string, replace: string, subject: string): string {
    return subject.endsWith(search)
      ? subject.substring(0, subject.length - search.length) + replace
      : subject;
  }

  /**
   * Reverse the given string
   */
  static reverse(value: string): string {
    return value.split('').reverse().join('');
  }

  /**
   * Get the singular form of an English word
   */
  static singular(value: string): string {
    // Simple singularization rules
    if (value.endsWith('ies')) {
      return value.slice(0, -3) + 'y';
    }
    if (value.endsWith('es')) {
      return value.slice(0, -2);
    }
    if (value.endsWith('s') && !value.endsWith('ss')) {
      return value.slice(0, -1);
    }
    return value;
  }

  /**
   * Generate a URL friendly slug
   */
  static slug(value: string, separator = '-'): string {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, separator)
      .replace(new RegExp(`${separator}+`, 'g'), separator)
      .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
  }

  /**
   * Convert a string to snake_case
   */
  static snake(value: string, delimiter = '_'): string {
    return value
      .replace(/([a-z])([A-Z])/g, `$1${delimiter}$2`)
      .replace(/[\s-]+/g, delimiter)
      .toLowerCase();
  }

  /**
   * Remove all extraneous whitespace
   */
  static squish(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Begin a string with a single instance of a given value
   */
  static start(value: string, prefix: string): string {
    return value.startsWith(prefix) ? value : prefix + value;
  }

  /**
   * Determine if a given string starts with a given substring
   */
  static startsWith(haystack: string, needles: string | string[]): boolean {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    return needleArray.some((needle) => haystack.startsWith(needle));
  }

  /**
   * Convert a value to studly caps case
   */
  static studly(value: string): string {
    return value
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^(.)/, (char) => char.toUpperCase());
  }

  /**
   * Returns the portion of string specified by the start and length parameters
   */
  static substr(value: string, start: number, length?: number): string {
    return value.substr(start, length);
  }

  /**
   * Returns the number of substring occurrences
   */
  static substrCount(haystack: string, needle: string): number {
    return (haystack.match(new RegExp(needle, 'g')) || []).length;
  }

  /**
   * Replace text within a portion of a string
   */
  static substrReplace(value: string, replace: string, start: number, length?: number): string {
    const actualLength = length ?? value.length - start;
    return value.substring(0, start) + replace + value.substring(start + actualLength);
  }

  /**
   * Swap multiple keywords in a string with other keywords
   */
  static swap(map: Record<string, string>, subject: string): string {
    let result = subject;
    Object.entries(map).forEach(([search, replace]) => {
      result = Str.replace(search, replace, result);
    });
    return result;
  }

  /**
   * Take the first or last {limit} characters
   */
  static take(value: string, limit: number): string {
    if (limit < 0) {
      return value.slice(limit);
    }
    return value.slice(0, limit);
  }

  /**
   * Convert the given string to title case
   */
  static title(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Convert the given string to Base64
   */
  static toBase64(value: string): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(value).toString('base64');
    }
    // Fallback for browser environments
    if (typeof btoa !== 'undefined') {
      return btoa(value);
    }
    throw new Error('Base64 encoding not supported in this environment');
  }

  /**
   * Transliterate a string to its closest ASCII representation
   */
  static transliterate(value: string): string {
    return Str.ascii(value);
  }

  /**
   * Trim whitespace from both ends of the string
   */
  static trim(value: string, characters?: string): string {
    if (!characters) return value.trim();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(`^[${escaped}]+|[${escaped}]+$`, 'g'), '');
  }

  /**
   * Trim whitespace from the beginning of the string
   */
  static ltrim(value: string, characters?: string): string {
    if (!characters) return value.trimStart();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(`^[${escaped}]+`, 'g'), '');
  }

  /**
   * Trim whitespace from the end of the string
   */
  static rtrim(value: string, characters?: string): string {
    if (!characters) return value.trimEnd();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(`[${escaped}]+$`, 'g'), '');
  }

  /**
   * Make a string's first character uppercase
   */
  static ucfirst(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  /**
   * Split a string by uppercase characters
   */
  static ucsplit(value: string): string[] {
    return value.match(/[A-Z][a-z]*/g) || [value];
  }

  /**
   * Convert the given string to uppercase
   */
  static upper(value: string): string {
    return value.toUpperCase();
  }

  /**
   * Remove the specified strings from the beginning and end
   */
  static unwrap(value: string, before: string, after?: string): string {
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
  static wordCount(value: string): number {
    return value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Wrap a string to a given number of characters
   */
  static wordWrap(value: string, characters = 75, breakStr = '\n'): string {
    const words = value.split(' ');
    let line = '';
    const lines: string[] = [];

    words.forEach((word) => {
      if ((line + word).length > characters) {
        if (line) lines.push(line.trim());
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    });

    if (line) lines.push(line.trim());
    return lines.join(breakStr);
  }

  /**
   * Limit the number of words in a string
   */
  static words(value: string, words = 100, end = '...'): string {
    const wordArray = value.split(/\s+/);
    if (wordArray.length <= words) return value;
    return wordArray.slice(0, words).join(' ') + end;
  }

  /**
   * Wrap the string with the given strings
   */
  static wrap(value: string, before: string, after?: string): string {
    const actualAfter = after ?? before;
    return before + value + actualAfter;
  }
}
