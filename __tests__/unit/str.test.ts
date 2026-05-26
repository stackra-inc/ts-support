/**
 * @fileoverview Unit tests for the Str static utility class.
 *
 * Covers all 70+ string manipulation methods including edge cases
 * and unicode handling.
 *
 * @module @stackra/ts-support/tests/unit/str
 */

import { describe, it, expect } from "vitest";
import { Str } from "@/str";

describe("Str", () => {
  // ── after / afterLast ─────────────────────────────────────────────────

  describe("after", () => {
    it("returns the remainder after the first occurrence", () => {
      expect(Str.after("hello world", "hello ")).toBe("world");
    });

    it("returns the full string when search is not found", () => {
      expect(Str.after("hello world", "xyz")).toBe("hello world");
    });

    it("returns the full string when search is empty", () => {
      expect(Str.after("hello", "")).toBe("hello");
    });

    it("handles multiple occurrences (takes first)", () => {
      expect(Str.after("a.b.c", ".")).toBe("b.c");
    });
  });

  describe("afterLast", () => {
    it("returns the remainder after the last occurrence", () => {
      expect(Str.afterLast("a.b.c", ".")).toBe("c");
    });

    it("returns the full string when search is not found", () => {
      expect(Str.afterLast("hello", "xyz")).toBe("hello");
    });

    it("returns the full string when search is empty", () => {
      expect(Str.afterLast("hello", "")).toBe("hello");
    });
  });

  // ── apa ───────────────────────────────────────────────────────────────

  describe("apa", () => {
    it("capitalizes major words and lowercases minor words", () => {
      expect(Str.apa("the quick brown fox")).toBe("The Quick Brown Fox");
    });

    it("always capitalizes the first word", () => {
      expect(Str.apa("a tale of two cities")).toBe("A Tale of Two Cities");
    });
  });

  // ── ascii ─────────────────────────────────────────────────────────────

  describe("ascii", () => {
    it("transliterates accented characters", () => {
      expect(Str.ascii("café")).toBe("cafe");
      expect(Str.ascii("über")).toBe("uber");
    });

    it("leaves ASCII strings unchanged", () => {
      expect(Str.ascii("hello")).toBe("hello");
    });
  });

  // ── before / beforeLast ───────────────────────────────────────────────

  describe("before", () => {
    it("returns the portion before the first occurrence", () => {
      expect(Str.before("hello world", " world")).toBe("hello");
    });

    it("returns the full string when search is not found", () => {
      expect(Str.before("hello", "xyz")).toBe("hello");
    });

    it("returns the full string when search is empty", () => {
      expect(Str.before("hello", "")).toBe("hello");
    });

    it("handles multiple occurrences (takes first)", () => {
      expect(Str.before("a.b.c", ".")).toBe("a");
    });
  });

  describe("beforeLast", () => {
    it("returns the portion before the last occurrence", () => {
      expect(Str.beforeLast("a.b.c", ".")).toBe("a.b");
    });

    it("returns the full string when search is not found", () => {
      expect(Str.beforeLast("hello", "xyz")).toBe("hello");
    });

    it("returns the full string when search is empty", () => {
      expect(Str.beforeLast("hello", "")).toBe("hello");
    });
  });

  // ── between / betweenFirst ────────────────────────────────────────────

  describe("between", () => {
    it("extracts the portion between two values", () => {
      expect(Str.between("[hello]", "[", "]")).toBe("hello");
    });

    it("returns empty string when from is not found", () => {
      expect(Str.between("hello", "[", "]")).toBe("");
    });

    it("returns empty string when to is not found after from", () => {
      expect(Str.between("[hello", "[", "]")).toBe("");
    });

    it("returns the subject when from or to is empty", () => {
      expect(Str.between("hello", "", "]")).toBe("hello");
      expect(Str.between("hello", "[", "")).toBe("hello");
    });
  });

  // ── camel ─────────────────────────────────────────────────────────────

  describe("camel", () => {
    it("converts kebab-case to camelCase", () => {
      expect(Str.camel("hello-world")).toBe("helloWorld");
    });

    it("converts snake_case to camelCase", () => {
      expect(Str.camel("hello_world")).toBe("helloWorld");
    });

    it("converts space-separated to camelCase", () => {
      expect(Str.camel("hello world")).toBe("helloWorld");
    });

    it("handles already camelCase", () => {
      expect(Str.camel("helloWorld")).toBe("helloWorld");
    });
  });

  // ── charAt ────────────────────────────────────────────────────────────

  describe("charAt", () => {
    it("returns the character at the given index", () => {
      expect(Str.charAt("hello", 0)).toBe("h");
      expect(Str.charAt("hello", 4)).toBe("o");
    });

    it("returns false for out-of-bounds index", () => {
      expect(Str.charAt("hello", 5)).toBe(false);
      expect(Str.charAt("hello", -1)).toBe(false);
    });
  });

  // ── chopStart / chopEnd ───────────────────────────────────────────────

  describe("chopStart", () => {
    it("removes the prefix if present", () => {
      expect(Str.chopStart("hello world", "hello ")).toBe("world");
    });

    it("returns unchanged if prefix not present", () => {
      expect(Str.chopStart("hello", "xyz")).toBe("hello");
    });

    it("accepts an array of prefixes", () => {
      expect(Str.chopStart("hello", ["hi", "he"])).toBe("llo");
    });
  });

  describe("chopEnd", () => {
    it("removes the suffix if present", () => {
      expect(Str.chopEnd("hello world", " world")).toBe("hello");
    });

    it("returns unchanged if suffix not present", () => {
      expect(Str.chopEnd("hello", "xyz")).toBe("hello");
    });

    it("accepts an array of suffixes", () => {
      expect(Str.chopEnd("hello", ["lo", "llo"])).toBe("hel");
    });
  });

  // ── contains / containsAll / doesntContain ────────────────────────────

  describe("contains", () => {
    it("returns true when substring is found", () => {
      expect(Str.contains("hello world", "world")).toBe(true);
    });

    it("returns false when substring is not found", () => {
      expect(Str.contains("hello world", "xyz")).toBe(false);
    });

    it("accepts an array of needles (any match)", () => {
      expect(Str.contains("hello world", ["xyz", "world"])).toBe(true);
      expect(Str.contains("hello world", ["xyz", "abc"])).toBe(false);
    });

    it("supports case-insensitive search", () => {
      expect(Str.contains("Hello World", "hello", true)).toBe(true);
    });
  });

  describe("containsAll", () => {
    it("returns true when all needles are found", () => {
      expect(Str.containsAll("hello world", ["hello", "world"])).toBe(true);
    });

    it("returns false when any needle is missing", () => {
      expect(Str.containsAll("hello world", ["hello", "xyz"])).toBe(false);
    });

    it("supports case-insensitive search", () => {
      expect(Str.containsAll("Hello World", ["hello", "world"], true)).toBe(true);
    });
  });

  describe("doesntContain", () => {
    it("returns true when substring is not found", () => {
      expect(Str.doesntContain("hello", "xyz")).toBe(true);
    });

    it("returns false when substring is found", () => {
      expect(Str.doesntContain("hello", "ell")).toBe(false);
    });
  });

  // ── deduplicate ───────────────────────────────────────────────────────

  describe("deduplicate", () => {
    it("removes consecutive duplicate spaces by default", () => {
      expect(Str.deduplicate("hello   world")).toBe("hello world");
    });

    it("removes consecutive duplicate custom characters", () => {
      expect(Str.deduplicate("a--b--c", "-")).toBe("a-b-c");
    });
  });

  // ── endsWith / startsWith ─────────────────────────────────────────────

  describe("endsWith", () => {
    it("returns true when string ends with the needle", () => {
      expect(Str.endsWith("hello world", "world")).toBe(true);
    });

    it("returns false when string does not end with the needle", () => {
      expect(Str.endsWith("hello world", "hello")).toBe(false);
    });

    it("accepts an array of needles", () => {
      expect(Str.endsWith("hello.ts", [".ts", ".js"])).toBe(true);
    });
  });

  describe("startsWith", () => {
    it("returns true when string starts with the needle", () => {
      expect(Str.startsWith("hello world", "hello")).toBe(true);
    });

    it("returns false when string does not start with the needle", () => {
      expect(Str.startsWith("hello world", "world")).toBe(false);
    });

    it("accepts an array of needles", () => {
      expect(Str.startsWith("hello", ["hi", "he"])).toBe(true);
    });
  });

  // ── excerpt ───────────────────────────────────────────────────────────

  describe("excerpt", () => {
    it("extracts text around the phrase", () => {
      const text = "This is a long text that contains the word hello in it";
      const result = Str.excerpt(text, "hello", { radius: 5 });
      expect(result).toContain("hello");
    });

    it("returns empty string when phrase is not found", () => {
      expect(Str.excerpt("hello world", "xyz")).toBe("");
    });

    it("uses custom omission string", () => {
      const text = "abcdefghijklmnopqrstuvwxyz";
      const result = Str.excerpt(text, "m", { radius: 3, omission: "---" });
      expect(result).toContain("---");
    });
  });

  // ── finish / start ────────────────────────────────────────────────────

  describe("finish", () => {
    it("adds the cap if not already present", () => {
      expect(Str.finish("hello", "/")).toBe("hello/");
    });

    it("does not duplicate the cap", () => {
      expect(Str.finish("hello/", "/")).toBe("hello/");
    });
  });

  describe("start", () => {
    it("adds the prefix if not already present", () => {
      expect(Str.start("hello", "/")).toBe("/hello");
    });

    it("does not duplicate the prefix", () => {
      expect(Str.start("/hello", "/")).toBe("/hello");
    });
  });

  // ── headline ──────────────────────────────────────────────────────────

  describe("headline", () => {
    it("converts camelCase to headline", () => {
      expect(Str.headline("helloWorld")).toBe("Hello World");
    });

    it("converts kebab-case to headline", () => {
      expect(Str.headline("hello-world")).toBe("Hello World");
    });

    it("converts snake_case to headline", () => {
      expect(Str.headline("hello_world")).toBe("Hello World");
    });
  });

  // ── is / isAscii / isJson / isUrl / isUlid / isUuid ───────────────────

  describe("is", () => {
    it("matches a wildcard pattern", () => {
      expect(Str.is("hello*", "hello world")).toBe(true);
      expect(Str.is("*world", "hello world")).toBe(true);
    });

    it("returns false for non-matching pattern", () => {
      expect(Str.is("foo*", "hello")).toBe(false);
    });

    it("supports case-insensitive matching", () => {
      expect(Str.is("HELLO*", "hello world", true)).toBe(true);
    });
  });

  describe("isAscii", () => {
    it("returns true for ASCII strings", () => {
      expect(Str.isAscii("hello")).toBe(true);
    });

    it("returns false for non-ASCII strings", () => {
      expect(Str.isAscii("héllo")).toBe(false);
    });

    it("returns true for empty string", () => {
      expect(Str.isAscii("")).toBe(true);
    });
  });

  describe("isJson", () => {
    it("returns true for valid JSON", () => {
      expect(Str.isJson('{"key":"value"}')).toBe(true);
      expect(Str.isJson("[1,2,3]")).toBe(true);
      expect(Str.isJson('"hello"')).toBe(true);
    });

    it("returns false for invalid JSON", () => {
      expect(Str.isJson("{invalid}")).toBe(false);
      expect(Str.isJson("hello")).toBe(false);
    });
  });

  describe("isUrl", () => {
    it("returns true for valid URLs", () => {
      expect(Str.isUrl("https://example.com")).toBe(true);
      expect(Str.isUrl("http://localhost:3000")).toBe(true);
    });

    it("returns false for invalid URLs", () => {
      expect(Str.isUrl("not-a-url")).toBe(false);
    });

    it("filters by protocol", () => {
      expect(Str.isUrl("https://example.com", ["https"])).toBe(true);
      expect(Str.isUrl("http://example.com", ["https"])).toBe(false);
    });
  });

  describe("isUlid", () => {
    it("returns true for valid ULIDs", () => {
      expect(Str.isUlid("01ARZ3NDEKTSV4RRFFQ69G5FAV")).toBe(true);
    });

    it("returns false for invalid ULIDs", () => {
      expect(Str.isUlid("not-a-ulid")).toBe(false);
    });
  });

  describe("isUuid", () => {
    it("returns true for valid UUIDs", () => {
      expect(Str.isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("returns false for invalid UUIDs", () => {
      expect(Str.isUuid("not-a-uuid")).toBe(false);
    });
  });

  // ── kebab / snake / studly / camel ────────────────────────────────────

  describe("kebab", () => {
    it("converts camelCase to kebab-case", () => {
      expect(Str.kebab("helloWorld")).toBe("hello-world");
    });

    it("converts spaces to hyphens", () => {
      expect(Str.kebab("hello world")).toBe("hello-world");
    });

    it("converts underscores to hyphens", () => {
      expect(Str.kebab("hello_world")).toBe("hello-world");
    });
  });

  describe("snake", () => {
    it("converts camelCase to snake_case", () => {
      expect(Str.snake("helloWorld")).toBe("hello_world");
    });

    it("converts spaces to underscores", () => {
      expect(Str.snake("hello world")).toBe("hello_world");
    });

    it("supports custom delimiter", () => {
      expect(Str.snake("helloWorld", "-")).toBe("hello-world");
    });
  });

  describe("studly", () => {
    it("converts kebab-case to StudlyCase", () => {
      expect(Str.studly("hello-world")).toBe("HelloWorld");
    });

    it("converts snake_case to StudlyCase", () => {
      expect(Str.studly("hello_world")).toBe("HelloWorld");
    });
  });

  // ── lcfirst / ucfirst ─────────────────────────────────────────────────

  describe("lcfirst", () => {
    it("lowercases the first character", () => {
      expect(Str.lcfirst("Hello")).toBe("hello");
    });

    it("handles empty string", () => {
      expect(Str.lcfirst("")).toBe("");
    });
  });

  describe("ucfirst", () => {
    it("uppercases the first character", () => {
      expect(Str.ucfirst("hello")).toBe("Hello");
    });

    it("handles empty string", () => {
      expect(Str.ucfirst("")).toBe("");
    });
  });

  // ── len ───────────────────────────────────────────────────────────────

  describe("len", () => {
    it("returns the string length", () => {
      expect(Str.len("hello")).toBe(5);
    });

    it("returns 0 for empty string", () => {
      expect(Str.len("")).toBe(0);
    });
  });

  // ── limit ─────────────────────────────────────────────────────────────

  describe("limit", () => {
    it("truncates the string at the limit", () => {
      expect(Str.limit("hello world", 5)).toBe("hello...");
    });

    it("returns the full string if under the limit", () => {
      expect(Str.limit("hi", 10)).toBe("hi");
    });

    it("uses custom end string", () => {
      expect(Str.limit("hello world", 5, " (more)")).toBe("hello (more)");
    });

    it("preserves words when option is set", () => {
      expect(Str.limit("hello beautiful world", 13, "...", true)).toBe("hello...");
    });
  });

  // ── lower / upper ────────────────────────────────────────────────────

  describe("lower", () => {
    it("converts to lowercase", () => {
      expect(Str.lower("HELLO")).toBe("hello");
    });
  });

  describe("upper", () => {
    it("converts to uppercase", () => {
      expect(Str.upper("hello")).toBe("HELLO");
    });
  });

  // ── mask ──────────────────────────────────────────────────────────────

  describe("mask", () => {
    it("masks from a given index", () => {
      expect(Str.mask("1234567890", "*", 4)).toBe("1234******");
    });

    it("masks with a specific length", () => {
      expect(Str.mask("1234567890", "*", 4, 3)).toBe("1234***890");
    });

    it("supports negative index", () => {
      expect(Str.mask("1234567890", "*", -4)).toBe("123456****");
    });
  });

  // ── padBoth / padLeft / padRight ──────────────────────────────────────

  describe("padBoth", () => {
    it("pads both sides equally", () => {
      expect(Str.padBoth("hi", 6)).toBe("  hi  ");
    });

    it("uses custom pad character", () => {
      expect(Str.padBoth("hi", 6, "-")).toBe("--hi--");
    });

    it("returns unchanged if already at length", () => {
      expect(Str.padBoth("hello", 3)).toBe("hello");
    });
  });

  describe("padLeft", () => {
    it("pads the left side", () => {
      expect(Str.padLeft("hi", 5)).toBe("   hi");
    });

    it("uses custom pad character", () => {
      expect(Str.padLeft("1", 3, "0")).toBe("001");
    });
  });

  describe("padRight", () => {
    it("pads the right side", () => {
      expect(Str.padRight("hi", 5)).toBe("hi   ");
    });

    it("uses custom pad character", () => {
      expect(Str.padRight("1", 3, "0")).toBe("100");
    });
  });

  // ── plural / singular / pluralStudly ──────────────────────────────────

  describe("plural", () => {
    it("pluralizes regular words", () => {
      expect(Str.plural("cat")).toBe("cats");
    });

    it("handles words ending in y", () => {
      expect(Str.plural("city")).toBe("cities");
    });

    it("handles words ending in s/x/z/ch/sh", () => {
      expect(Str.plural("bus")).toBe("buses");
      expect(Str.plural("box")).toBe("boxes");
      expect(Str.plural("church")).toBe("churches");
    });

    it("returns singular when count is 1", () => {
      expect(Str.plural("cat", 1)).toBe("cat");
    });
  });

  describe("singular", () => {
    it("singularizes regular words", () => {
      expect(Str.singular("cats")).toBe("cat");
    });

    it("handles words ending in ies", () => {
      expect(Str.singular("cities")).toBe("city");
    });

    it("handles words ending in es", () => {
      expect(Str.singular("buses")).toBe("bus");
    });
  });

  describe("pluralStudly", () => {
    it("pluralizes the last word in studly case", () => {
      expect(Str.pluralStudly("RedCar")).toBe("RedCars");
    });

    it("returns singular when count is 1", () => {
      expect(Str.pluralStudly("RedCar", 1)).toBe("RedCar");
    });
  });

  // ── position ──────────────────────────────────────────────────────────

  describe("position", () => {
    it("returns the position of the needle", () => {
      expect(Str.position("hello world", "world")).toBe(6);
    });

    it("returns false when needle is not found", () => {
      expect(Str.position("hello", "xyz")).toBe(false);
    });
  });

  // ── random ────────────────────────────────────────────────────────────

  describe("random", () => {
    it("generates a string of the specified length", () => {
      expect(Str.random(10)).toHaveLength(10);
      expect(Str.random(32)).toHaveLength(32);
    });

    it("defaults to 16 characters", () => {
      expect(Str.random()).toHaveLength(16);
    });

    it("generates alphanumeric characters only", () => {
      const result = Str.random(100);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────

  describe("remove", () => {
    it("removes a substring", () => {
      expect(Str.remove("world", "hello world")).toBe("hello ");
    });

    it("removes all occurrences", () => {
      expect(Str.remove("o", "foo boo")).toBe("f b");
    });

    it("accepts an array of strings to remove", () => {
      expect(Str.remove(["hello", "world"], "hello world")).toBe(" ");
    });

    it("supports case-insensitive removal", () => {
      expect(Str.remove("HELLO", "Hello World", false)).toBe(" World");
    });
  });

  // ── repeat ────────────────────────────────────────────────────────────

  describe("repeat", () => {
    it("repeats the string n times", () => {
      expect(Str.repeat("ab", 3)).toBe("ababab");
    });

    it("returns empty string for 0 repeats", () => {
      expect(Str.repeat("hello", 0)).toBe("");
    });
  });

  // ── replace variants ──────────────────────────────────────────────────

  describe("replace", () => {
    it("replaces all occurrences", () => {
      expect(Str.replace("o", "0", "foo boo")).toBe("f00 b00");
    });

    it("supports case-insensitive replacement", () => {
      expect(Str.replace("HELLO", "hi", "Hello World", false)).toBe("hi World");
    });
  });

  describe("replaceArray", () => {
    it("replaces sequentially with array values", () => {
      expect(Str.replaceArray("?", ["a", "b", "c"], "? ? ?")).toBe("a b c");
    });

    it("stops when replacements are exhausted", () => {
      expect(Str.replaceArray("?", ["a"], "? ? ?")).toBe("a ? ?");
    });
  });

  describe("replaceFirst", () => {
    it("replaces only the first occurrence", () => {
      expect(Str.replaceFirst("o", "0", "foo boo")).toBe("f0o boo");
    });
  });

  describe("replaceLast", () => {
    it("replaces only the last occurrence", () => {
      expect(Str.replaceLast("o", "0", "foo boo")).toBe("foo bo0");
    });

    it("returns unchanged when not found", () => {
      expect(Str.replaceLast("x", "y", "hello")).toBe("hello");
    });
  });

  describe("replaceStart", () => {
    it("replaces only if at the start", () => {
      expect(Str.replaceStart("hello", "hi", "hello world")).toBe("hi world");
    });

    it("does not replace if not at the start", () => {
      expect(Str.replaceStart("world", "earth", "hello world")).toBe("hello world");
    });
  });

  describe("replaceEnd", () => {
    it("replaces only if at the end", () => {
      expect(Str.replaceEnd("world", "earth", "hello world")).toBe("hello earth");
    });

    it("does not replace if not at the end", () => {
      expect(Str.replaceEnd("hello", "hi", "hello world")).toBe("hello world");
    });
  });

  // ── reverse ───────────────────────────────────────────────────────────

  describe("reverse", () => {
    it("reverses the string", () => {
      expect(Str.reverse("hello")).toBe("olleh");
    });

    it("handles empty string", () => {
      expect(Str.reverse("")).toBe("");
    });
  });

  // ── slug ──────────────────────────────────────────────────────────────

  describe("slug", () => {
    it("generates a URL-friendly slug", () => {
      expect(Str.slug("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
      expect(Str.slug("Hello & World!")).toBe("hello-world");
    });

    it("supports custom separator", () => {
      expect(Str.slug("Hello World", "_")).toBe("hello_world");
    });
  });

  // ── squish ────────────────────────────────────────────────────────────

  describe("squish", () => {
    it("removes extraneous whitespace", () => {
      expect(Str.squish("  hello   world  ")).toBe("hello world");
    });

    it("handles tabs and newlines", () => {
      expect(Str.squish("hello\t\n  world")).toBe("hello world");
    });
  });

  // ── substr / substrCount / substrReplace ──────────────────────────────

  describe("substr", () => {
    it("returns a substring from start", () => {
      expect(Str.substr("hello world", 6)).toBe("world");
    });

    it("returns a substring with length", () => {
      expect(Str.substr("hello world", 0, 5)).toBe("hello");
    });
  });

  describe("substrCount", () => {
    it("counts occurrences of a substring", () => {
      expect(Str.substrCount("hello world hello", "hello")).toBe(2);
    });

    it("returns 0 when not found", () => {
      expect(Str.substrCount("hello", "xyz")).toBe(0);
    });
  });

  describe("substrReplace", () => {
    it("replaces a portion of the string", () => {
      expect(Str.substrReplace("hello world", "earth", 6)).toBe("hello earth");
    });

    it("replaces with specific length", () => {
      expect(Str.substrReplace("hello world", "BEAUTIFUL ", 6, 0)).toBe("hello BEAUTIFUL world");
    });
  });

  // ── swap ──────────────────────────────────────────────────────────────

  describe("swap", () => {
    it("swaps multiple keywords", () => {
      expect(Str.swap({ hello: "hi", world: "earth" }, "hello world")).toBe("hi earth");
    });
  });

  // ── take ──────────────────────────────────────────────────────────────

  describe("take", () => {
    it("takes the first n characters", () => {
      expect(Str.take("hello", 3)).toBe("hel");
    });

    it("takes the last n characters with negative limit", () => {
      expect(Str.take("hello", -3)).toBe("llo");
    });
  });

  // ── title ─────────────────────────────────────────────────────────────

  describe("title", () => {
    it("converts to title case", () => {
      expect(Str.title("hello world")).toBe("Hello World");
    });
  });

  // ── toBase64 ──────────────────────────────────────────────────────────

  describe("toBase64", () => {
    it("encodes to base64", () => {
      expect(Str.toBase64("hello")).toBe("aGVsbG8=");
    });
  });

  // ── trim / ltrim / rtrim ──────────────────────────────────────────────

  describe("trim", () => {
    it("trims whitespace by default", () => {
      expect(Str.trim("  hello  ")).toBe("hello");
    });

    it("trims custom characters", () => {
      expect(Str.trim("//hello//", "/")).toBe("hello");
    });
  });

  describe("ltrim", () => {
    it("trims left whitespace", () => {
      expect(Str.ltrim("  hello  ")).toBe("hello  ");
    });

    it("trims custom characters from left", () => {
      expect(Str.ltrim("//hello", "/")).toBe("hello");
    });
  });

  describe("rtrim", () => {
    it("trims right whitespace", () => {
      expect(Str.rtrim("  hello  ")).toBe("  hello");
    });

    it("trims custom characters from right", () => {
      expect(Str.rtrim("hello//", "/")).toBe("hello");
    });
  });

  // ── ucsplit ───────────────────────────────────────────────────────────

  describe("ucsplit", () => {
    it("splits by uppercase characters", () => {
      expect(Str.ucsplit("HelloWorld")).toEqual(["Hello", "World"]);
    });
  });

  // ── unwrap / wrap ─────────────────────────────────────────────────────

  describe("unwrap", () => {
    it("removes wrapping characters", () => {
      expect(Str.unwrap('"hello"', '"')).toBe("hello");
    });

    it("supports different before/after", () => {
      expect(Str.unwrap("[hello]", "[", "]")).toBe("hello");
    });
  });

  describe("wrap", () => {
    it("wraps with the same character", () => {
      expect(Str.wrap("hello", '"')).toBe('"hello"');
    });

    it("wraps with different before/after", () => {
      expect(Str.wrap("hello", "[", "]")).toBe("[hello]");
    });
  });

  // ── wordCount / wordWrap / words ──────────────────────────────────────

  describe("wordCount", () => {
    it("counts words", () => {
      expect(Str.wordCount("hello world")).toBe(2);
    });

    it("handles extra whitespace", () => {
      expect(Str.wordCount("  hello   world  ")).toBe(2);
    });

    it("returns 0 for empty string", () => {
      expect(Str.wordCount("")).toBe(0);
    });
  });

  describe("wordWrap", () => {
    it("wraps text at the specified width", () => {
      const result = Str.wordWrap("the quick brown fox jumps", 10);
      expect(result).toContain("\n");
    });
  });

  describe("words", () => {
    it("limits the number of words", () => {
      expect(Str.words("one two three four five", 3)).toBe("one two three...");
    });

    it("returns full string if under limit", () => {
      expect(Str.words("hello world", 5)).toBe("hello world");
    });

    it("uses custom end string", () => {
      expect(Str.words("one two three four", 2, " (more)")).toBe("one two (more)");
    });
  });

  // ── Unicode edge cases ────────────────────────────────────────────────

  describe("unicode handling", () => {
    it("handles emoji in contains", () => {
      expect(Str.contains("hello 🌍 world", "🌍")).toBe(true);
    });

    it("handles multi-byte characters in len", () => {
      expect(Str.len("café")).toBe(4);
    });

    it("handles unicode in lower/upper", () => {
      expect(Str.lower("ÜBER")).toBe("über");
      expect(Str.upper("über")).toBe("ÜBER");
    });
  });
});
