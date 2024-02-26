const moment = require("moment-timezone");
class UpdateEvent {
  constructor(client) {
    this.client = client;
  }

  setActive(boolean) {
    if (boolean === undefined || typeof boolean !== "boolean") {
      throw new TypeError("Active must be a boolean.");
    }
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventActive: boolean });
    return this;
  }

  setName(name) {
    if (!name || typeof name !== "string") {
      throw new TypeError("Name must be a non-empty string.");
    }
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventName: name });
    return this;
  }

  setStart(date) {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    const mDate = moment.tz(date, "DD-MM-YYYY", "America/Los_Angeles").startOf("day");
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventStarts: mDate });
    return this;
  }

  setEnd(date) {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    const mDate = moment.tz(date, "DD-MM-YYYY", "America/Los_Angeles").endOf("day");
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventEnds: mDate });
    return this;
  }

  setDuration(duration) {
    if (!duration || typeof duration !== "string") {
      throw new TypeError("Duration must be a non-empty string.");
    }
    this.client.skyEvents.set("event", { ...this.client.skyEvents.get("event"), eventDuration: duration });
    return this;
  }

  update() {
    return this.client.skyEvents.get("event");
  }
}

module.exports = { UpdateEvent };
