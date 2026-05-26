/**
 * @fileoverview Unit tests for the Env static utility class.
 *
 * Covers type coercion, custom repositories, auto-detection,
 * and edge cases for environment variable access.
 *
 * @module @stackra/ts-support/tests/unit/env
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Env } from "@/env";

describe("Env", () => {
  beforeEach(() => {
    Env.setRepository({
      APP_NAME: "TestApp",
      APP_DEBUG: "true",
      APP_PORT: "3000",
      APP_ENV: "testing",
      EMPTY_VAR: "",
      NULL_VAR: "null",
      QUOTED_VAR: '"hello"',
      SINGLE_QUOTED: "'world'",
      BOOL_YES: "yes",
      BOOL_ON: "on",
      BOOL_ONE: "1",
      BOOL_FALSE: "false",
      BOOL_NO: "no",
      BOOL_OFF: "off",
      BOOL_ZERO: "0",
      INVALID_NUM: "not-a-number",
      COMMA_LIST: "a,b,c",
      SPACED_LIST: " a , b , c ",
      PIPE_LIST: "x|y|z",
      NULL_LIKE: "(null)",
      EMPTY_LIKE: "(empty)",
      UNDEFINED_LIKE: "undefined",
    });
  });

  // ── get ───────────────────────────────────────────────────────────────

  describe("get", () => {
    it("returns the raw string value", () => {
      expect(Env.get("APP_NAME")).toBe("TestApp");
    });

    it("returns fallback when variable is not set", () => {
      expect(Env.get("MISSING_VAR", "default")).toBe("default");
    });

    it("returns undefined when variable is not set and no fallback", () => {
      expect(Env.get("MISSING_VAR")).toBeUndefined();
    });

    it("treats null-like values as not set", () => {
      expect(Env.get("NULL_VAR", "fallback")).toBe("fallback");
      expect(Env.get("NULL_LIKE", "fallback")).toBe("fallback");
      expect(Env.get("EMPTY_LIKE", "fallback")).toBe("fallback");
      expect(Env.get("UNDEFINED_LIKE", "fallback")).toBe("fallback");
    });

    it("strips surrounding double quotes", () => {
      expect(Env.get("QUOTED_VAR")).toBe("hello");
    });

    it("strips surrounding single quotes", () => {
      expect(Env.get("SINGLE_QUOTED")).toBe("world");
    });
  });

  // ── getOrFail ─────────────────────────────────────────────────────────

  describe("getOrFail", () => {
    it("returns the value when set", () => {
      expect(Env.getOrFail("APP_NAME")).toBe("TestApp");
    });

    it("throws when variable is not set", () => {
      expect(() => Env.getOrFail("MISSING_VAR")).toThrow(
        'Environment variable "MISSING_VAR" is required but not set.',
      );
    });

    it("throws for null-like values", () => {
      expect(() => Env.getOrFail("NULL_VAR")).toThrow();
    });
  });

  // ── string ────────────────────────────────────────────────────────────

  describe("string", () => {
    it("returns the string value", () => {
      expect(Env.string("APP_NAME", "default")).toBe("TestApp");
    });

    it("returns fallback when not set", () => {
      expect(Env.string("MISSING", "fallback")).toBe("fallback");
    });

    it("returns undefined when not set and no fallback", () => {
      expect(Env.string("MISSING")).toBeUndefined();
    });
  });

  // ── boolean ───────────────────────────────────────────────────────────

  describe("boolean", () => {
    it("coerces truthy values to true", () => {
      expect(Env.boolean("APP_DEBUG", false)).toBe(true);
      expect(Env.boolean("BOOL_YES", false)).toBe(true);
      expect(Env.boolean("BOOL_ON", false)).toBe(true);
      expect(Env.boolean("BOOL_ONE", false)).toBe(true);
    });

    it("coerces falsy values to false", () => {
      expect(Env.boolean("BOOL_FALSE", true)).toBe(false);
      expect(Env.boolean("BOOL_NO", true)).toBe(false);
      expect(Env.boolean("BOOL_OFF", true)).toBe(false);
      expect(Env.boolean("BOOL_ZERO", true)).toBe(false);
    });

    it("returns fallback when not set", () => {
      expect(Env.boolean("MISSING", true)).toBe(true);
      expect(Env.boolean("MISSING", false)).toBe(false);
    });

    it("returns undefined when not set and no fallback", () => {
      expect(Env.boolean("MISSING")).toBeUndefined();
    });

    it("returns fallback for unrecognized values", () => {
      Env.setRepository({ WEIRD: "maybe" });
      expect(Env.boolean("WEIRD", false)).toBe(false);
    });
  });

  // ── number ────────────────────────────────────────────────────────────

  describe("number", () => {
    it("parses numeric values", () => {
      expect(Env.number("APP_PORT", 8080)).toBe(3000);
    });

    it("returns fallback for NaN values", () => {
      expect(Env.number("INVALID_NUM", 9999)).toBe(9999);
    });

    it("returns fallback when not set", () => {
      expect(Env.number("MISSING", 5000)).toBe(5000);
    });

    it("returns undefined when not set and no fallback", () => {
      expect(Env.number("MISSING")).toBeUndefined();
    });

    it("handles zero as a valid number", () => {
      Env.setRepository({ ZERO: "0" });
      expect(Env.number("ZERO", 99)).toBe(0);
    });

    it("handles negative numbers", () => {
      Env.setRepository({ NEG: "-42" });
      expect(Env.number("NEG", 0)).toBe(-42);
    });

    it("handles floating point", () => {
      Env.setRepository({ FLOAT: "3.14" });
      expect(Env.number("FLOAT", 0)).toBe(3.14);
    });
  });

  // ── array ─────────────────────────────────────────────────────────────

  describe("array", () => {
    it("splits by comma by default", () => {
      expect(Env.array("COMMA_LIST")).toEqual(["a", "b", "c"]);
    });

    it("trims whitespace from elements", () => {
      expect(Env.array("SPACED_LIST")).toEqual(["a", "b", "c"]);
    });

    it("supports custom separator", () => {
      expect(Env.array("PIPE_LIST", "|")).toEqual(["x", "y", "z"]);
    });

    it("returns fallback when not set", () => {
      expect(Env.array("MISSING", ",", ["default"])).toEqual(["default"]);
    });

    it("returns undefined when not set and no fallback", () => {
      expect(Env.array("MISSING")).toBeUndefined();
    });

    it("filters out empty strings", () => {
      Env.setRepository({ EMPTY_ITEMS: "a,,b,,c" });
      expect(Env.array("EMPTY_ITEMS")).toEqual(["a", "b", "c"]);
    });
  });

  // ── has / missing ─────────────────────────────────────────────────────

  describe("has", () => {
    it("returns true for set variables", () => {
      expect(Env.has("APP_NAME")).toBe(true);
    });

    it("returns false for missing variables", () => {
      expect(Env.has("MISSING")).toBe(false);
    });

    it("returns false for null-like values", () => {
      expect(Env.has("NULL_VAR")).toBe(false);
    });
  });

  describe("missing", () => {
    it("returns true for missing variables", () => {
      expect(Env.missing("MISSING")).toBe(true);
    });

    it("returns false for set variables", () => {
      expect(Env.missing("APP_NAME")).toBe(false);
    });
  });

  // ── Environment checks ────────────────────────────────────────────────

  describe("is", () => {
    it("checks the current environment", () => {
      expect(Env.is("testing")).toBe(true);
      expect(Env.is("production")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(Env.is("TESTING")).toBe(true);
    });
  });

  describe("isProduction", () => {
    it("returns false in testing", () => {
      expect(Env.isProduction()).toBe(false);
    });

    it("returns true when APP_ENV is production", () => {
      Env.setRepository({ APP_ENV: "production" });
      expect(Env.isProduction()).toBe(true);
    });
  });

  describe("isLocal", () => {
    it("returns true for local/development/dev", () => {
      Env.setRepository({ APP_ENV: "local" });
      expect(Env.isLocal()).toBe(true);

      Env.setRepository({ APP_ENV: "development" });
      expect(Env.isLocal()).toBe(true);

      Env.setRepository({ APP_ENV: "dev" });
      expect(Env.isLocal()).toBe(true);
    });

    it("returns false for other environments", () => {
      Env.setRepository({ APP_ENV: "production" });
      expect(Env.isLocal()).toBe(false);
    });
  });

  describe("isTesting", () => {
    it("returns true for testing/test", () => {
      expect(Env.isTesting()).toBe(true);

      Env.setRepository({ APP_ENV: "test" });
      expect(Env.isTesting()).toBe(true);
    });
  });

  // ── Custom repository ─────────────────────────────────────────────────

  describe("setRepository / getRepository", () => {
    it("sets and retrieves a custom repository", () => {
      const custom = { MY_VAR: "custom" };
      Env.setRepository(custom);
      expect(Env.getRepository()).toBe(custom);
      expect(Env.get("MY_VAR")).toBe("custom");
    });
  });
});
