/**
 * Num Edge Cases Tests
 *
 * Tests edge cases for Num utility methods: boundary values,
 * locale formatting, special numbers, type guards.
 *
 * @module __tests__/unit/num-edge-cases
 */

import { describe, it, expect } from "vitest";
import { Num } from "@/num";

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Num — Edge Cases", () => {
  describe("format()", () => {
    it("should format with default locale (en-US)", () => {
      expect(Num.format(1234567)).toBe("1,234,567");
    });

    it("should format with decimal places", () => {
      expect(Num.format(1234.5678, 2)).toBe("1,234.57");
    });

    it("should format zero", () => {
      expect(Num.format(0)).toBe("0");
    });

    it("should format negative numbers", () => {
      expect(Num.format(-1234)).toBe("-1,234");
    });

    it("should handle very large numbers", () => {
      const result = Num.format(999999999999);
      expect(result).toContain("999");
    });
  });

  describe("abbreviate()", () => {
    it("should abbreviate thousands", () => {
      expect(Num.abbreviate(1500)).toBe("2K");
    });

    it("should abbreviate millions", () => {
      expect(Num.abbreviate(1500000)).toBe("2M");
    });

    it("should abbreviate billions", () => {
      expect(Num.abbreviate(1500000000)).toBe("2B");
    });

    it("should respect precision", () => {
      expect(Num.abbreviate(1234, 1)).toBe("1.2K");
    });

    it("should not abbreviate small numbers", () => {
      expect(Num.abbreviate(999)).toBe("999");
    });

    it("should handle zero", () => {
      expect(Num.abbreviate(0)).toBe("0");
    });
  });

  describe("ordinal()", () => {
    it("should return 1st for 1", () => {
      expect(Num.ordinal(1)).toBe("1st");
    });

    it("should return 2nd for 2", () => {
      expect(Num.ordinal(2)).toBe("2nd");
    });

    it("should return 3rd for 3", () => {
      expect(Num.ordinal(3)).toBe("3rd");
    });

    it("should return 4th for 4", () => {
      expect(Num.ordinal(4)).toBe("4th");
    });

    it("should handle teens (11th, 12th, 13th)", () => {
      expect(Num.ordinal(11)).toBe("11th");
      expect(Num.ordinal(12)).toBe("12th");
      expect(Num.ordinal(13)).toBe("13th");
    });

    it("should handle 21st, 22nd, 23rd", () => {
      expect(Num.ordinal(21)).toBe("21st");
      expect(Num.ordinal(22)).toBe("22nd");
      expect(Num.ordinal(23)).toBe("23rd");
    });

    it("should handle 100+", () => {
      expect(Num.ordinal(101)).toBe("101st");
      expect(Num.ordinal(111)).toBe("111th");
    });
  });

  describe("fileSize()", () => {
    it("should format bytes", () => {
      expect(Num.fileSize(500)).toBe("500.00 B");
    });

    it("should format kilobytes", () => {
      expect(Num.fileSize(1024)).toBe("1.00 KB");
    });

    it("should format megabytes", () => {
      expect(Num.fileSize(1048576)).toBe("1.00 MB");
    });

    it("should format gigabytes", () => {
      expect(Num.fileSize(1073741824)).toBe("1.00 GB");
    });

    it("should respect precision", () => {
      expect(Num.fileSize(1536, 1)).toBe("1.5 KB");
    });

    it("should handle zero bytes", () => {
      expect(Num.fileSize(0)).toBe("0 B");
    });
  });

  describe("clamp()", () => {
    it("should clamp value within range", () => {
      expect(Num.clamp(5, 0, 10)).toBe(5);
    });

    it("should clamp to min when below", () => {
      expect(Num.clamp(-5, 0, 10)).toBe(0);
    });

    it("should clamp to max when above", () => {
      expect(Num.clamp(15, 0, 10)).toBe(10);
    });

    it("should handle equal min and max", () => {
      expect(Num.clamp(5, 3, 3)).toBe(3);
    });

    it("should handle negative ranges", () => {
      expect(Num.clamp(0, -10, -5)).toBe(-5);
    });
  });

  describe("percentage()", () => {
    it("should format as percentage", () => {
      expect(Num.percentage(75)).toContain("75");
    });

    it("should handle zero", () => {
      expect(Num.percentage(0)).toContain("0");
    });

    it("should handle 100%", () => {
      expect(Num.percentage(100)).toContain("100");
    });

    it("should respect precision", () => {
      const result = Num.percentage(33.3333, 1);
      expect(result).toContain("33.3");
    });
  });

  describe("currency()", () => {
    it("should format USD by default", () => {
      const result = Num.currency(19.99);
      expect(result).toContain("19.99");
      expect(result).toContain("$");
    });

    it("should format EUR", () => {
      const result = Num.currency(19.99, "EUR", "de-DE");
      expect(result).toContain("19,99");
    });

    it("should handle zero", () => {
      const result = Num.currency(0);
      expect(result).toContain("0");
    });

    it("should handle large amounts", () => {
      const result = Num.currency(1234567.89);
      expect(result).toContain("1,234,567.89");
    });
  });

  describe("Type Guards", () => {
    it("isNumber: should detect numbers", () => {
      expect(Num.isNumber(42)).toBe(true);
      expect(Num.isNumber(3.14)).toBe(true);
      expect(Num.isNumber(0)).toBe(true);
      expect(Num.isNumber(NaN)).toBe(false);
      expect(Num.isNumber("42")).toBe(false);
      expect(Num.isNumber(null)).toBe(false);
    });

    it("isInteger: should detect integers", () => {
      expect(Num.isInteger(42)).toBe(true);
      expect(Num.isInteger(3.14)).toBe(false);
      expect(Num.isInteger(0)).toBe(true);
    });

    it("isEven/isOdd: should detect parity", () => {
      expect(Num.isEven(4)).toBe(true);
      expect(Num.isEven(3)).toBe(false);
      expect(Num.isOdd(3)).toBe(true);
      expect(Num.isOdd(4)).toBe(false);
    });

    it("isPositive/isNegative: should detect sign", () => {
      expect(Num.isPositive(5)).toBe(true);
      expect(Num.isPositive(-5)).toBe(false);
      expect(Num.isPositive(0)).toBe(false);
      expect(Num.isNegative(-5)).toBe(true);
      expect(Num.isNegative(5)).toBe(false);
    });

    it("between: should check range inclusively", () => {
      expect(Num.between(5, 1, 10)).toBe(true);
      expect(Num.between(1, 1, 10)).toBe(true);
      expect(Num.between(10, 1, 10)).toBe(true);
      expect(Num.between(0, 1, 10)).toBe(false);
      expect(Num.between(11, 1, 10)).toBe(false);
    });
  });

  describe("random()", () => {
    it("should generate number within range", () => {
      for (let i = 0; i < 50; i++) {
        const result = Num.random(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it("should use default range (0-100)", () => {
      const result = Num.random();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
});
