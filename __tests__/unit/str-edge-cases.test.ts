/**
 * Str Edge Cases Tests
 *
 * Tests edge cases and boundary conditions for Str utility methods:
 * empty strings, unicode, special characters, extreme lengths.
 *
 * @module __tests__/unit/str-edge-cases
 */

import { describe, it, expect } from "vitest";
import { Str } from "@/str";

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Str — Edge Cases", () => {
  describe("Case Conversion Edge Cases", () => {
    it("camel: should handle consecutive uppercase", () => {
      expect(Str.camel("XML_HTTP_REQUEST")).toBe("xmlHttpRequest");
    });

    it("camel: should handle single character words", () => {
      expect(Str.camel("a_b_c")).toBe("aBC");
    });

    it("kebab: should handle already-kebab strings", () => {
      expect(Str.kebab("already-kebab")).toBe("already-kebab");
    });

    it("snake: should handle camelCase input", () => {
      expect(Str.snake("camelCaseString")).toBe("camel_case_string");
    });

    it("snake: should handle consecutive uppercase letters", () => {
      expect(Str.snake("HTMLParser")).toBe("html_parser");
    });

    it("studly: should handle mixed separators", () => {
      expect(Str.studly("hello_world-foo bar")).toBe("HelloWorldFooBar");
    });

    it("title: should capitalize each word", () => {
      expect(Str.title("hello world foo")).toBe("Hello World Foo");
    });

    it("headline: should convert to headline format", () => {
      expect(Str.headline("emailNotificationSent")).toBe("Email Notification Sent");
    });

    it("headline: should handle snake_case", () => {
      expect(Str.headline("user_first_name")).toBe("User First Name");
    });
  });

  describe("String Manipulation Edge Cases", () => {
    it("limit: should not truncate when within limit", () => {
      expect(Str.limit("short", 100)).toBe("short");
    });

    it("limit: should truncate with custom ending", () => {
      expect(Str.limit("Hello World", 5, "…")).toBe("Hello…");
    });

    it("limit: should handle zero limit", () => {
      expect(Str.limit("Hello", 0)).toBe("...");
    });

    it("words: should limit by word count", () => {
      expect(Str.words("one two three four five", 3)).toBe("one two three...");
    });

    it("words: should not truncate when within limit", () => {
      expect(Str.words("one two", 5)).toBe("one two");
    });

    it("excerpt: should extract around a phrase", () => {
      const text = "This is a long text that contains the word example somewhere in the middle.";
      const result = Str.excerpt(text, "example", { radius: 10 });
      expect(result).toContain("example");
    });

    it("mask: should mask characters from index", () => {
      expect(Str.mask("1234567890", "*", 4)).toBe("1234******");
    });

    it("mask: should handle negative index", () => {
      expect(Str.mask("1234567890", "*", -4)).toBe("123456****");
    });

    it("mask: should handle length parameter", () => {
      expect(Str.mask("1234567890", "*", 2, 4)).toBe("12****7890");
    });
  });

  describe("Padding Edge Cases", () => {
    it("padBoth: should pad evenly on both sides", () => {
      const result = Str.padBoth("hi", 6);
      expect(result.length).toBe(6);
      expect(result.trim()).toBe("hi");
    });

    it("padLeft: should pad with custom character", () => {
      expect(Str.padLeft("5", 3, "0")).toBe("005");
    });

    it("padRight: should pad with custom character", () => {
      expect(Str.padRight("5", 3, "0")).toBe("500");
    });

    it("padBoth: should not pad when already at length", () => {
      expect(Str.padBoth("hello", 5)).toBe("hello");
    });
  });

  describe("Search and Replace Edge Cases", () => {
    it("contains: should be case-insensitive when specified", () => {
      expect(Str.contains("Hello World", "hello", true)).toBe(true);
    });

    it("contains: should check multiple needles", () => {
      expect(Str.contains("Hello World", ["xyz", "World"])).toBe(true);
    });

    it("containsAll: should require all needles present", () => {
      expect(Str.containsAll("Hello World", ["Hello", "World"])).toBe(true);
      expect(Str.containsAll("Hello World", ["Hello", "xyz"])).toBe(false);
    });

    it("replaceArray: should replace sequentially", () => {
      expect(Str.replaceArray("?", ["one", "two", "three"], "? ? ?")).toBe("one two three");
    });

    it("replaceFirst: should only replace first occurrence", () => {
      expect(Str.replaceFirst("a", "b", "aaa")).toBe("baa");
    });

    it("replaceLast: should only replace last occurrence", () => {
      expect(Str.replaceLast("a", "b", "aaa")).toBe("aab");
    });

    it("swap: should replace multiple patterns", () => {
      expect(Str.swap({ foo: "bar", bar: "baz" }, "foo bar")).toBe("bar baz");
    });

    it("remove: should remove all occurrences", () => {
      expect(Str.remove("o", "foo boo moo")).toBe("f b m");
    });

    it("remove: should handle array of searches", () => {
      expect(Str.remove(["a", "e", "i", "o", "u"], "hello world")).toBe("hll wrld");
    });
  });

  describe("Validation Edge Cases", () => {
    it("isJson: should validate valid JSON", () => {
      expect(Str.isJson('{"key": "value"}')).toBe(true);
      expect(Str.isJson("[1, 2, 3]")).toBe(true);
      expect(Str.isJson('"string"')).toBe(true);
    });

    it("isJson: should reject invalid JSON", () => {
      expect(Str.isJson("not json")).toBe(false);
      expect(Str.isJson("{key: value}")).toBe(false);
      expect(Str.isJson("")).toBe(false);
    });

    it("isUrl: should validate URLs", () => {
      expect(Str.isUrl("https://example.com")).toBe(true);
      expect(Str.isUrl("http://localhost:3000")).toBe(true);
      expect(Str.isUrl("not a url")).toBe(false);
    });

    it("isUuid: should validate UUIDs", () => {
      expect(Str.isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
      expect(Str.isUuid("not-a-uuid")).toBe(false);
    });

    it("isAscii: should detect ASCII strings", () => {
      expect(Str.isAscii("hello")).toBe(true);
      expect(Str.isAscii("héllo")).toBe(false);
      expect(Str.isAscii("こんにちは")).toBe(false);
    });
  });

  describe("Trim and Whitespace Edge Cases", () => {
    it("squish: should collapse multiple spaces", () => {
      expect(Str.squish("  hello   world  ")).toBe("hello world");
    });

    it("squish: should handle tabs and newlines", () => {
      expect(Str.squish("hello\t\n  world")).toBe("hello world");
    });

    it("trim: should trim custom characters", () => {
      expect(Str.trim("/hello/world/", "/")).toBe("hello/world");
    });

    it("ltrim: should trim from left only", () => {
      expect(Str.ltrim("///hello///", "/")).toBe("hello///");
    });

    it("rtrim: should trim from right only", () => {
      expect(Str.rtrim("///hello///", "/")).toBe("///hello");
    });

    it("deduplicate: should remove consecutive duplicates", () => {
      expect(Str.deduplicate("hello    world")).toBe("hello world");
    });

    it("deduplicate: should work with custom character", () => {
      expect(Str.deduplicate("foo---bar---baz", "-")).toBe("foo-bar-baz");
    });
  });

  describe("Wrap/Unwrap Edge Cases", () => {
    it("wrap: should wrap with same character", () => {
      expect(Str.wrap("hello", '"')).toBe('"hello"');
    });

    it("wrap: should wrap with different before/after", () => {
      expect(Str.wrap("hello", "[", "]")).toBe("[hello]");
    });

    it("unwrap: should remove wrapping characters", () => {
      expect(Str.unwrap('"hello"', '"')).toBe("hello");
    });

    it("unwrap: should handle different before/after", () => {
      expect(Str.unwrap("[hello]", "[", "]")).toBe("hello");
    });

    it("unwrap: should not unwrap if characters don't match", () => {
      expect(Str.unwrap("hello", '"')).toBe("hello");
    });
  });

  describe("Slug Generation Edge Cases", () => {
    it("slug: should handle unicode characters", () => {
      const result = Str.slug("Hello Wörld");
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });

    it("slug: should handle multiple spaces and special chars", () => {
      expect(Str.slug("Hello   World!!!")).toBe("hello-world");
    });

    it("slug: should use custom separator", () => {
      expect(Str.slug("Hello World", "_")).toBe("hello_world");
    });

    it("slug: should handle empty string", () => {
      expect(Str.slug("")).toBe("");
    });
  });

  describe("Start/Finish Edge Cases", () => {
    it("start: should add prefix if not present", () => {
      expect(Str.start("world", "hello ")).toBe("hello world");
    });

    it("start: should not duplicate prefix", () => {
      expect(Str.start("/path", "/")).toBe("/path");
    });

    it("finish: should add suffix if not present", () => {
      expect(Str.finish("hello", "/")).toBe("hello/");
    });

    it("finish: should not duplicate suffix", () => {
      expect(Str.finish("hello/", "/")).toBe("hello/");
    });
  });

  describe("Substring Edge Cases", () => {
    it("between: should extract between markers", () => {
      expect(Str.between("[hello]", "[", "]")).toBe("hello");
    });

    it("between: should handle nested markers", () => {
      expect(Str.between("{{hello}} world {{bye}}", "{{", "}}")).toBe("hello");
    });

    it("before: should return text before search", () => {
      expect(Str.before("hello world", " ")).toBe("hello");
    });

    it("beforeLast: should return text before last occurrence", () => {
      expect(Str.beforeLast("a.b.c", ".")).toBe("a.b");
    });

    it("take: should take first N characters", () => {
      expect(Str.take("hello", 3)).toBe("hel");
    });

    it("take: should take last N characters with negative", () => {
      expect(Str.take("hello", -3)).toBe("llo");
    });
  });
});
