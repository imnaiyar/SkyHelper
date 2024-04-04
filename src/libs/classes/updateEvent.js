import moment from 'moment-timezone';

/**
 * @class
 * @classdesc A class to update Events details in the client constructor
 * @method update Updates the event details
 * @returns {Object}
 */

class UpdateEvent {
  /**
   * @param {import('@src/frameworks').SkyHelper} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * @param {boolean} boolean
   */
  setActive(boolean) {
    if (boolean === undefined || typeof boolean !== "boolean") {
      throw new TypeError("Active must be a boolean.");
    }
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventActive: boolean });
    return this;
  }

  /**
   * @param {string} name
   */
  setName(name) {
    if (!name || typeof name !== "string") {
      throw new TypeError("Name must be a non-empty string.");
    }
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventName: name });
    return this;
  }

  /**
   * @param {string} date - format DD-MM-YYYY
   * @example
   * new UpdateEvent().setDate('22-09-2023')
   */
  setStart(date) {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    const mDate = moment.tz(date, "DD-MM-YYYY", "America/Los_Angeles").startOf("day");
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventStarts: mDate });
    return this;
  }

  /**
   * @param {string} date - format DD-MM-YYYY
   * @example
   * new UpdateEvent().setDate('22-09-2023')
   */
  setEnd(date) {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    const mDate = moment.tz(date, "DD-MM-YYYY", "America/Los_Angeles").endOf("day");
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventEnds: mDate });
    return this;
  }

  setDuration(duration) {
    if (!duration || typeof duration !== "number") {
      throw new TypeError("Duration must be a number.");
    }
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventDuration: `${duration}` });
    return this;
  }

  update() {
    return this.client.skyEvents.get("event");
  }
}

export default { UpdateEvent };
