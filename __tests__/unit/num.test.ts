/**
 * @fileoverview Unit tests for the Num static utility class.
 *
 * Covers formatting, locales, abbreviation, ordinals, math helpers,
 * and edge values (NaN, Infinity, negative numbers).
 *
 * @module @stackra/ts-support/tests/unit/num
 */

import { describe, it, expect } from "vitest";
import { Num } from "@/num";

describe("Num", () => {
  // ── format ────────────────────────────────────────────────────────────

  describe("format", () => {
    it("formats with grouped thousands", () => {
      expect(Num.format(1234567)).toBe("1,234,567");
    });

    it("formats with decimal places", () => {
      expect(Num.format(1234567.89, 2)).toBe("1,234,567.89");
    });

    it("formats with zero decimals by default", () => {
      expect(Num.format(1234.5)).toBe("1,235");
    });

    it("supports locale formatting", () => {
      const result = Num.format(1234.5, 2, "de-DE");
      expect(result).toContain("1.234,50");
    });

    it("handles zero", () => {
      expect(Num.format(0)).toBe("0");
    });

    it("handles negative numbers", () => {
      const result = Num.format(-1234, 0);
      expect(result).toContain("1,234");
      expect(result).toContain("-");
    });
  });

  // ── abbreviate ────────────────────────────────────────────────────────

  describe("abbreviate", () => {
    it("abbreviates thousands", () => {
      expect(Num.abbreviate(1000)).toBe("1K");
    });

    it("abbreviates millions", () => {
      expect(Num.abbreviate(1000000)).toBe("1M");
    });

    it("abbreviates billions", () => {
      expect(Num.abbreviate(1000000000)).toBe("1B");
    });

    it("abbreviates trillions", () => {
      expect(Num.abbreviate(1000000000000)).toBe("1T");
    });

    it("supports precision", () => {
      expect(Num.abbreviate(1500000, 1)).toBe("1.5M");
    });

    it("returns the number as-is below 1000", () => {
      expect(Num.abbreviate(999)).toBe("999");
    });

    it("handles negative numbers", () => {
      expect(Num.abbreviate(-1500000, 1)).toBe("-1.5M");
    });
  });

  // ── forHumans ─────────────────────────────────────────────────────────

  describe("forHumans", () => {
    it("formats with word suffixes", () => {
      expect(Num.forHumans(1000)).toBe("1 thousand");
      expect(Num.forHumans(1000000)).toBe("1 million");
      expect(Num.forHumans(1000000000)).toBe("1 billion");
    });

    it("supports precision", () => {
      expect(Num.forHumans(1500000, 1)).toBe("1.5 million");
    });

    it("returns number as-is below 1000", () => {
      expect(Num.forHumans(500)).toBe("500");
    });
  });

  // ── ordinal ───────────────────────────────────────────────────────────

  describe("ordinal", () => {
    it("returns 1st, 2nd, 3rd", () => {
      expect(Num.ordinal(1)).toBe("1st");
      expect(Num.ordinal(2)).toBe("2nd");
      expect(Num.ordinal(3)).toBe("3rd");
    });

    it("returns th for 4-20", () => {
      expect(Num.ordinal(4)).toBe("4th");
      expect(Num.ordinal(11)).toBe("11th");
      expect(Num.ordinal(12)).toBe("12th");
      expect(Num.ordinal(13)).toBe("13th");
    });

    it("handles 21st, 22nd, 23rd", () => {
      expect(Num.ordinal(21)).toBe("21st");
      expect(Num.ordinal(22)).toBe("22nd");
      expect(Num.ordinal(23)).toBe("23rd");
    });

    it("handles 111th, 112th, 113th", () => {
      expect(Num.ordinal(111)).toBe("111th");
      expect(Num.ordinal(112)).toBe("112th");
      expect(Num.ordinal(113)).toBe("113th");
    });
  });

  // ── percentage ────────────────────────────────────────────────────────

  describe("percentage", () => {
    it("formats as percentage with default precision", () => {
      expect(Num.percentage(75.5)).toBe("75.50%");
    });

    it("formats with custom precision", () => {
      expect(Num.percentage(100, 0)).toBe("100%");
      expect(Num.percentage(0.5, 1)).toBe("0.5%");
    });
  });

  // ── currency ──────────────────────────────────────────────────────────

  describe("currency", () => {
    it("formats as USD by default", () => {
      expect(Num.currency(49.99)).toBe("$49.99");
    });

    it("formats with different currencies", () => {
      const gbp = Num.currency(99, "GBP");
      expect(gbp).toContain("99.00");
    });

    it("handles zero", () => {
      expect(Num.currency(0)).toBe("$0.00");
    });
  });

  // ── fileSize ──────────────────────────────────────────────────────────

  describe("fileSize", () => {
    it("formats bytes", () => {
      expect(Num.fileSize(0)).toBe("0 B");
    });

    it("formats kilobytes", () => {
      expect(Num.fileSize(1024)).toBe("1.00 KB");
    });

    it("formats megabytes", () => {
      expect(Num.fileSize(1048576)).toBe("1.00 MB");
    });

    it("formats gigabytes", () => {
      expect(Num.fileSize(1073741824)).toBe("1.00 GB");
    });

    it("supports custom precision", () => {
      expect(Num.fileSize(1536, 1)).toBe("1.5 KB");
    });

    it("handles negative bytes", () => {
      const result = Num.fileSize(-1024);
      expect(result).toContain("-");
      expect(result).toContain("KB");
    });
  });

  // ── clamp ─────────────────────────────────────────────────────────────

  describe("clamp", () => {
    it("returns value when within range", () => {
      expect(Num.clamp(5, 1, 10)).toBe(5);
    });

    it("clamps to min", () => {
      expect(Num.clamp(-5, 1, 10)).toBe(1);
    });

    it("clamps to max", () => {
      expect(Num.clamp(15, 1, 10)).toBe(10);
    });

    it("handles edge values at boundaries", () => {
      expect(Num.clamp(1, 1, 10)).toBe(1);
      expect(Num.clamp(10, 1, 10)).toBe(10);
    });
  });

  // ── random ────────────────────────────────────────────────────────────

  describe("random", () => {
    it("generates within range", () => {
      for (let i = 0; i < 50; i++) {
        const result = Num.random(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it("defaults to 0-100", () => {
      const result = Num.random();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  // ── Inspection ────────────────────────────────────────────────────────

  describe("isNumber", () => {
    it("returns true for finite numbers", () => {
      expect(Num.isNumber(42)).toBe(true);
      expect(Num.isNumber(3.14)).toBe(true);
      expect(Num.isNumber(0)).toBe(true);
      expect(Num.isNumber(-1)).toBe(true);
    });

    it("returns false for NaN", () => {
      expect(Num.isNumber(NaN)).toBe(false);
    });

    it("returns false for Infinity", () => {
      expect(Num.isNumber(Infinity)).toBe(false);
      expect(Num.isNumber(-Infinity)).toBe(false);
    });

    it("returns false for non-numbers", () => {
      expect(Num.isNumber("42")).toBe(false);
      expect(Num.isNumber(null)).toBe(false);
      expect(Num.isNumber(undefined)).toBe(false);
    });
  });

  describe("isInteger", () => {
    it("returns true for integers", () => {
      expect(Num.isInteger(42)).toBe(true);
      expect(Num.isInteger(0)).toBe(true);
    });

    it("returns false for floats", () => {
      expect(Num.isInteger(3.14)).toBe(false);
    });
  });

  describe("isEven / isOdd", () => {
    it("identifies even numbers", () => {
      expect(Num.isEven(2)).toBe(true);
      expect(Num.isEven(3)).toBe(false);
      expect(Num.isEven(0)).toBe(true);
    });

    it("identifies odd numbers", () => {
      expect(Num.isOdd(3)).toBe(true);
      expect(Num.isOdd(2)).toBe(false);
    });
  });

  describe("isPositive / isNegative", () => {
    it("identifies positive numbers", () => {
      expect(Num.isPositive(1)).toBe(true);
      expect(Num.isPositive(0)).toBe(false);
      expect(Num.isPositive(-1)).toBe(false);
    });

    it("identifies negative numbers", () => {
      expect(Num.isNegative(-1)).toBe(true);
      expect(Num.isNegative(0)).toBe(false);
      expect(Num.isNegative(1)).toBe(false);
    });
  });

  describe("between", () => {
    it("returns true when value is in range", () => {
      expect(Num.between(5, 1, 10)).toBe(true);
    });

    it("is inclusive of boundaries", () => {
      expect(Num.between(1, 1, 10)).toBe(true);
      expect(Num.between(10, 1, 10)).toBe(true);
    });

    it("returns false when out of range", () => {
      expect(Num.between(0, 1, 10)).toBe(false);
      expect(Num.between(11, 1, 10)).toBe(false);
    });
  });
});
