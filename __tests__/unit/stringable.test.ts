/**
 * @fileoverview Unit tests for the Stringable fluent wrapper class.
 *
 * Covers method chaining, terminal methods, and fluent API behavior.
 *
 * @module @stackra/ts-support/tests/unit/stringable
 */

import { describe, it, expect } from "vitest";
import { Stringable } from "@/str";

describe("Stringable", () => {
  // ── Construction & Terminal Methods ────────────────────────────────────

  describe("construction", () => {
    it("creates with a string value", () => {
      const s = new Stringable("hello");
      expect(s.toString()).toBe("hello");
    });

    it("defaults to empty string", () => {
      const s = new Stringable();
      expect(s.toString()).toBe("");
    });

    it("valueOf returns the string value", () => {
      const s = new Stringable("hello");
      expect(s.valueOf()).toBe("hello");
    });
  });

  // ── Chaining ──────────────────────────────────────────────────────────

  describe("chaining", () => {
    it("chains multiple transformations", () => {
      const result = new Stringable("hello-world").camel().ucfirst().toString();
      expect(result).toBe("HelloWorld");
    });

    it("chains trim and upper", () => {
      const result = new Stringable("  hello  ").trim().upper().toString();
      expect(result).toBe("HELLO");
    });

    it("chains snake and upper", () => {
      const result = new Stringable("helloWorld").snake().upper().toString();
      expect(result).toBe("HELLO_WORLD");
    });

    it("chains kebab and finish", () => {
      const result = new Stringable("HelloWorld").kebab().finish("/").toString();
      expect(result).toBe("hello-world/");
    });

    it("chains replace and limit", () => {
      const result = new Stringable("hello beautiful world")
        .replace("beautiful", "amazing")
        .limit(13)
        .toString();
      expect(result).toBe("hello amazing...");
    });

    it("chains after and before", () => {
      const result = new Stringable("prefix::content::suffix")
        .after("prefix::")
        .before("::suffix")
        .toString();
      expect(result).toBe("content");
    });
  });

  // ── Terminal boolean methods ───────────────────────────────────────────

  describe("terminal boolean methods", () => {
    it("contains returns boolean", () => {
      expect(new Stringable("hello world").contains("world")).toBe(true);
      expect(new Stringable("hello world").contains("xyz")).toBe(false);
    });

    it("containsAll returns boolean", () => {
      expect(new Stringable("hello world").containsAll(["hello", "world"])).toBe(true);
    });

    it("doesntContain returns boolean", () => {
      expect(new Stringable("hello").doesntContain("xyz")).toBe(true);
    });

    it("endsWith returns boolean", () => {
      expect(new Stringable("hello.ts").endsWith(".ts")).toBe(true);
    });

    it("startsWith returns boolean", () => {
      expect(new Stringable("hello").startsWith("he")).toBe(true);
    });

    it("is returns boolean", () => {
      expect(new Stringable("hello world").is("hello*")).toBe(true);
    });

    it("isAscii returns boolean", () => {
      expect(new Stringable("hello").isAscii()).toBe(true);
      expect(new Stringable("héllo").isAscii()).toBe(false);
    });

    it("isJson returns boolean", () => {
      expect(new Stringable('{"a":1}').isJson()).toBe(true);
    });

    it("isUrl returns boolean", () => {
      expect(new Stringable("https://example.com").isUrl()).toBe(true);
    });

    it("isUlid returns boolean", () => {
      expect(new Stringable("01ARZ3NDEKTSV4RRFFQ69G5FAV").isUlid()).toBe(true);
    });

    it("isUuid returns boolean", () => {
      expect(new Stringable("550e8400-e29b-41d4-a716-446655440000").isUuid()).toBe(true);
    });
  });

  // ── Terminal numeric methods ───────────────────────────────────────────

  describe("terminal numeric methods", () => {
    it("length returns number", () => {
      expect(new Stringable("hello").length()).toBe(5);
    });

    it("wordCount returns number", () => {
      expect(new Stringable("hello world").wordCount()).toBe(2);
    });

    it("substrCount returns number", () => {
      expect(new Stringable("hello hello").substrCount("hello")).toBe(2);
    });

    it("position returns number or false", () => {
      expect(new Stringable("hello").position("llo")).toBe(2);
      expect(new Stringable("hello").position("xyz")).toBe(false);
    });

    it("charAt returns string or false", () => {
      expect(new Stringable("hello").charAt(0)).toBe("h");
      expect(new Stringable("hello").charAt(10)).toBe(false);
    });
  });

  // ── Terminal string methods ────────────────────────────────────────────

  describe("terminal string methods", () => {
    it("excerpt returns string", () => {
      const result = new Stringable("hello world foo bar").excerpt("world", { radius: 3 });
      expect(result).toContain("world");
    });

    it("toBase64 returns string", () => {
      expect(new Stringable("hello").toBase64()).toBe("aGVsbG8=");
    });

    it("ucsplit returns array", () => {
      expect(new Stringable("HelloWorld").ucsplit()).toEqual(["Hello", "World"]);
    });
  });

  // ── Fluent methods return Stringable ──────────────────────────────────

  describe("fluent methods return Stringable", () => {
    it("after returns Stringable", () => {
      const result = new Stringable("hello world").after("hello ");
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("world");
    });

    it("afterLast returns Stringable", () => {
      const result = new Stringable("a.b.c").afterLast(".");
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("c");
    });

    it("before returns Stringable", () => {
      const result = new Stringable("hello world").before(" world");
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("hello");
    });

    it("mask returns Stringable", () => {
      const result = new Stringable("1234567890").mask("*", 4);
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("1234******");
    });

    it("padBoth returns Stringable", () => {
      const result = new Stringable("hi").padBoth(6);
      expect(result).toBeInstanceOf(Stringable);
    });

    it("plural returns Stringable", () => {
      const result = new Stringable("cat").plural();
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("cats");
    });

    it("singular returns Stringable", () => {
      const result = new Stringable("cats").singular();
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("cat");
    });

    it("slug returns Stringable", () => {
      const result = new Stringable("Hello World").slug();
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("hello-world");
    });

    it("wrap returns Stringable", () => {
      const result = new Stringable("hello").wrap("[", "]");
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("[hello]");
    });

    it("unwrap returns Stringable", () => {
      const result = new Stringable("[hello]").unwrap("[", "]");
      expect(result).toBeInstanceOf(Stringable);
      expect(result.toString()).toBe("hello");
    });
  });
});
