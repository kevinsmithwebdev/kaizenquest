import { describe, expect, it } from "vitest";

import {
  clampAmount,
  clampHours,
  clampMinutes,
  clampOccurrences,
  formatAdjustedTimeDisplay,
  getAdjustedTimeParts,
  getTotalMinutes,
  isPositiveAmountValue,
  isPositiveOccurrenceValue,
  isPositiveTimeValue,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "./goal-event-input";

describe("goal-event-input", () => {
  describe("clampOccurrences", () => {
    it("clamps values below the minimum to 1", () => {
      expect(clampOccurrences(0)).toBe(1);
      expect(clampOccurrences(-5)).toBe(1);
    });

    it("clamps values above the maximum to 1000", () => {
      expect(clampOccurrences(1500)).toBe(1000);
    });

    it("rounds fractional values to the nearest integer within bounds", () => {
      expect(clampOccurrences(2.4)).toBe(2);
      expect(clampOccurrences(2.6)).toBe(3);
    });
  });

  describe("clampHours and clampMinutes", () => {
    it("clamps hours to 0 through 100", () => {
      expect(clampHours(-1)).toBe(0);
      expect(clampHours(150)).toBe(100);
    });

    it("clamps minutes to 0 through 1000", () => {
      expect(clampMinutes(-10)).toBe(0);
      expect(clampMinutes(1200)).toBe(1000);
    });
  });

  describe("getAdjustedTimeParts", () => {
    it("converts overflow minutes into hours", () => {
      expect(getAdjustedTimeParts(2, 75)).toEqual({ hours: 3, minutes: 15 });
    });

    it("returns zeroed values for invalid input", () => {
      expect(getAdjustedTimeParts(Number.NaN, 30)).toEqual({
        hours: 0,
        minutes: 30,
      });
    });
  });

  describe("formatAdjustedTimeDisplay", () => {
    it("formats mixed hour and minute values", () => {
      expect(formatAdjustedTimeDisplay(2, 75)).toBe("3 hr 15 min");
    });

    it("formats hour-only values", () => {
      expect(formatAdjustedTimeDisplay(2, 0)).toBe("2 hr");
    });
  });

  describe("minutesToIso8601Duration", () => {
    it("converts adjusted time to ISO 8601 duration", () => {
      expect(minutesToIso8601Duration(2, 75)).toBe("PT3H15M");
      expect(minutesToIso8601Duration(0, 30)).toBe("PT30M");
      expect(minutesToIso8601Duration(2, 0)).toBe("PT2H");
    });
  });

  describe("clampAmount and roundAmountToThirdDecimal", () => {
    it("clamps amount values to 0 through 1000", () => {
      expect(clampAmount(-1)).toBe(0);
      expect(clampAmount(1500)).toBe(1000);
    });

    it("rounds to three decimal places on submit", () => {
      expect(roundAmountToThirdDecimal(12.34567)).toBe(12.346);
      expect(roundAmountToThirdDecimal(0.0004)).toBe(0);
    });
  });

  describe("validation helpers", () => {
    it("checks positive occurrence values", () => {
      expect(isPositiveOccurrenceValue(1)).toBe(true);
      expect(isPositiveOccurrenceValue(0)).toBe(false);
    });

    it("checks positive time values", () => {
      expect(isPositiveTimeValue(0, 30)).toBe(true);
      expect(isPositiveTimeValue(0, 0)).toBe(false);
    });

    it("checks positive amount values", () => {
      expect(isPositiveAmountValue(0.5)).toBe(true);
      expect(isPositiveAmountValue(0)).toBe(false);
    });
  });

  describe("getTotalMinutes", () => {
    it("sums clamped hours and minutes", () => {
      expect(getTotalMinutes(2, 75)).toBe(195);
    });
  });
});
