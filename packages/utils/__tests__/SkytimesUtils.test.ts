/**
 * Tests for SkytimesUtils
 * Focus on DST edge cases and event time calculations
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { DateTime, Settings } from "luxon";
import { SkytimesUtils } from "../src/classes/SkytimesUtils";

describe("SkytimesUtils", () => {
  // Save original timezone settings
  let originalZone: string;

  beforeEach(() => {
    originalZone = Settings.defaultZone.name;
  });

  afterEach(() => {
    Settings.defaultZone = originalZone;
  });

  describe("DST Transition Handling", () => {
    it("should handle spring forward DST transition correctly", () => {
      // March 10, 2024: DST spring forward in America/Los_Angeles (2 AM -> 3 AM)
      // Testing at 5 PM on the day when DST changed
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 3,
          day: 10,
          hour: 17,
          minute: 0,
        },
        { zone: "America/Los_Angeles" },
      );

      // Mock DateTime.now() to return our test time
      Settings.now = () => testTime.toMillis();

      try {
        // Get geyser event (starts at offset 0, interval 2 hours)
        const details = SkytimesUtils.getEventDetails("geyser");

        // The next occurrence should be calculated correctly without 1-hour offset
        expect(details.nextOccurence).toBeDefined();
        expect(details.nextOccurence.isValid).toBe(true);

        // Verify the next occurrence is in the future
        expect(details.nextOccurence.toMillis()).toBeGreaterThan(testTime.toMillis());

        // The difference should be less than the interval (2 hours = 120 minutes)
        const diffMinutes = details.nextOccurence.diff(testTime, "minutes").minutes;
        expect(diffMinutes).toBeLessThanOrEqual(120);
        expect(diffMinutes).toBeGreaterThan(0);
      } finally {
        Settings.now = () => Date.now();
      }
    });

    it("should evaluate times based on current hour, not start of day", () => {
      // This test specifically validates the fix for the reported issue
      // On DST day, times should be calculated from current time context
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 3,
          day: 10,
          hour: 14, // 2 PM PDT (after DST change)
          minute: 45,
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        const details = SkytimesUtils.getEventDetails("geyser");

        // Next occurrence should be within the next 2 hours
        const diffMinutes = details.nextOccurence.diff(testTime, "minutes").minutes;

        // Should be > 0 and <= 120 minutes (the interval)
        expect(diffMinutes).toBeGreaterThan(0);
        expect(diffMinutes).toBeLessThanOrEqual(120);

        // Verify it's actually in the correct timezone (PDT, not PST)
        expect(details.nextOccurence.zoneName).toBe("America/Los_Angeles");

        // The calculated time should be 15:00
        // On DST spring forward day, the 2 AM hour is skipped
        // So times are: 0, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23
        // At 14:45, next occurrence is 15:00
        expect(details.nextOccurence.hour).toBe(15);
        expect(details.nextOccurence.minute).toBe(0);
      } finally {
        Settings.now = () => Date.now();
      }
    });

    it("should handle fall back DST transition correctly", () => {
      // November 3, 2024: DST fall back in America/Los_Angeles (2 AM -> 1 AM)
      // Testing at 5 PM on the day when DST changed
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 11,
          day: 3,
          hour: 17,
          minute: 0,
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        const details = SkytimesUtils.getEventDetails("geyser");

        expect(details.nextOccurence).toBeDefined();
        expect(details.nextOccurence.isValid).toBe(true);
        expect(details.nextOccurence.toMillis()).toBeGreaterThan(testTime.toMillis());

        const diffMinutes = details.nextOccurence.diff(testTime, "minutes").minutes;
        expect(diffMinutes).toBeLessThanOrEqual(120);
        expect(diffMinutes).toBeGreaterThan(0);
      } finally {
        Settings.now = () => Date.now();
      }
    });

    it("should calculate all event times correctly on DST transition day", () => {
      // March 10, 2024: DST spring forward
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 3,
          day: 10,
          hour: 12,
          minute: 0,
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        const details = SkytimesUtils.getEventDetails("geyser");

        // Parse all occurrences (format: <t:timestamp:t>)
        const occurrences = details.allOccurences.split(" • ");
        expect(occurrences.length).toBeGreaterThan(0);

        // Each occurrence should be a valid Discord timestamp
        occurrences.forEach((occurrence) => {
          expect(occurrence).toMatch(/^<t:\d+:t>$/);
        });

        // Verify occurrences are evenly spaced (2-hour intervals for geyser)
        const timestamps = occurrences.map((occ) => {
          const match = occ.match(/<t:(\d+):t>/);
          return match ? parseInt(match[1]) : 0;
        });

        for (let i = 1; i < timestamps.length; i++) {
          const diff = timestamps[i] - timestamps[i - 1];
          // Should be 2 hours (7200 seconds) for geyser
          expect(diff).toBe(7200);
        }
      } finally {
        Settings.now = () => Date.now();
      }
    });
  });

  describe("Event Time Calculations", () => {
    it("should calculate next occurrence correctly for regular day", () => {
      // Use a regular day without DST transition
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 6,
          day: 15,
          hour: 14,
          minute: 30,
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        const details = SkytimesUtils.getEventDetails("geyser");

        expect(details.nextOccurence).toBeDefined();
        expect(details.nextOccurence.isValid).toBe(true);
        expect(details.nextOccurence.toMillis()).toBeGreaterThan(testTime.toMillis());
      } finally {
        Settings.now = () => Date.now();
      }
    });

    it("should handle events with offset correctly", () => {
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 6,
          day: 15,
          hour: 10,
          minute: 0,
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        // Grandma has offset of 30 minutes
        const details = SkytimesUtils.getEventDetails("grandma");

        expect(details.nextOccurence).toBeDefined();
        expect(details.nextOccurence.minute).toBe(30);
      } finally {
        Settings.now = () => Date.now();
      }
    });

    it("should return all occurrences for the current day", () => {
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 6,
          day: 15,
          hour: 8,
          minute: 0,
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        const details = SkytimesUtils.getEventDetails("geyser");

        // Should have multiple occurrences (12 for 2-hour intervals in a day)
        const occurrences = details.allOccurences.split(" • ");
        expect(occurrences.length).toBe(12);
      } finally {
        Settings.now = () => Date.now();
      }
    });
  });

  describe("Event Status", () => {
    it("should detect active events correctly", () => {
      // Set time to exactly when geyser starts (midnight)
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 6,
          day: 15,
          hour: 0,
          minute: 5, // 5 minutes after start
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        const details = SkytimesUtils.getEventDetails("geyser");

        // Geyser has 15-minute duration, so at 5 minutes it should be active
        expect(details.status.active).toBe(true);
        if (details.status.active) {
          expect(details.status.startTime).toBeDefined();
          expect(details.status.endTime).toBeDefined();
        }
      } finally {
        Settings.now = () => Date.now();
      }
    });

    it("should detect inactive events correctly", () => {
      const testTime = DateTime.fromObject(
        {
          year: 2024,
          month: 6,
          day: 15,
          hour: 0,
          minute: 20, // 20 minutes after start (past 15-minute duration)
        },
        { zone: "America/Los_Angeles" },
      );

      Settings.now = () => testTime.toMillis();

      try {
        const details = SkytimesUtils.getEventDetails("geyser");

        expect(details.status.active).toBe(false);
      } finally {
        Settings.now = () => Date.now();
      }
    });
  });
});
