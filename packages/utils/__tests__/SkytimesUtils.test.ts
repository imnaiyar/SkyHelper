import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { SkytimesUtils } from "../src/classes/SkytimesUtils.js";

const zone = "America/Los_Angeles";

function occurrenceTimes(date: DateTime, interval: number): string[] {
  const timestamps = SkytimesUtils.getAllTimes(date, interval).matchAll(/<t:(\d+):t>/g);

  return Array.from(timestamps, ([, timestamp]) => DateTime.fromSeconds(Number(timestamp), { zone }).toFormat("HH:mm ZZZZ"));
}

describe("SkytimesUtils", () => {
  describe("getAllTimes", () => {
    it("keeps minute-stepped event times aligned when entering DST", () => {
      const times = occurrenceTimes(DateTime.fromISO("2026-03-08T00:00:00", { zone }), 120);

      expect(times.slice(0, 4)).toEqual(["00:00 PST", "01:00 PST", "03:00 PDT", "05:00 PDT"]);
    });

    it("does not repeat the same occurrence when an hourly interval enters DST", () => {
      const times = occurrenceTimes(DateTime.fromISO("2026-03-08T00:00:00", { zone }), 60);

      expect(times.slice(0, 4)).toEqual(["00:00 PST", "01:00 PST", "03:00 PDT", "04:00 PDT"]);
    });

    it("keeps minute-stepped event times aligned when leaving DST", () => {
      const times = occurrenceTimes(DateTime.fromISO("2026-11-01T00:00:00", { zone }), 120);

      expect(times.slice(0, 4)).toEqual(["00:00 PDT", "02:00 PST", "04:00 PST", "06:00 PST"]);
    });

    it("keeps regular interval behavior on non-DST-transition days", () => {
      const times = occurrenceTimes(DateTime.fromISO("2026-02-01T00:00:00", { zone }), 120);

      expect(times.slice(0, 4)).toEqual(["00:00 PST", "02:00 PST", "04:00 PST", "06:00 PST"]);
    });
  });
});
