import moment from "moment-timezone";
import type { SkyHelper, SkyEvent, SpecialEventData } from "../typings.js";

/**
 * @class
 * @classdesc A class to update Events details in the client constructor
 * @method update Updates the event details
 */

export class UpdateEvent {
  constructor(readonly data: SpecialEventData) {}

  /**
   * @param name Name of the event
   */
  setName(name: string): this {
    if (!name || typeof name !== "string") {
      throw new TypeError("Name must be a non-empty string.");
    }
    this.data.name = name;
    return this;
  }

  /**
   * @param date Start date of the Event. Format DD-MM-YYYY
   * @example
   * new UpdateEvent().setDate('22-09-2023')
   */
  setStart(date: string): this {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    this.data.startDate = date;
    return this;
  }

  /**
   * @param date End date of the Event. Format DD-MM-YYYY
   * @example
   * new UpdateEvent().setDate('22-09-2023')
   */
  setEnd(date: string): this {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    this.data.endDate = date;
    return this;
  }

  /**
   * @returns The updated event
   */
  async update(): Promise<SpecialEventData> {
    return await this.data.save();
  }
}
