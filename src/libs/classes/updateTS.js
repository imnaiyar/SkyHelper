/**
 * @class
 * @classdesc A class to update traveling spirit details in the client constructor
 * @method update updates the ts details
 * @returns {Object}
 */
class UpdateTS {
  /**
   * @param {import('#src/frameworks').SkyHelper} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Sets the name of the TS
   * @param {string} name
   */
  setName(name) {
    if (!name || typeof name !== "string") {
      throw new TypeError("Name must be a non-empty string.");
    }
    this.client.ts.name = name;
    return this;
  }

  /**
   * Sets the visit date of the ts
   * @param {string} date DD-MM-YYYY
   */
  setVisit(date) {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    this.client.ts.visitDate = date;
    return this;
  }

  /**
   * Sets the depart date of the ts
   * @param {string} date DD-MM-YYYY
   */
  setDepart(date) {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    this.client.ts.departDate = date;
    return this;
  }

  /**
   * Sets the value of the t spirit
   * @param {string} value
   */
  setValue(value) {
    if (!value || typeof value !== "string") {
      throw new TypeError("Value must be a non-empty string.");
    }
    this.client.ts.value = value;
    return this;
  }

  /**
   * Sets the image of the spirit
   * @param {string} link link to the image
   */
  setImage(link) {
    if (!link || typeof link !== "string") {
      throw new TypeError("Link must be a non-empty string.");
    }
    this.client.ts.spiritImage = link;
    return this;
  }

  /**
   * Sers the emote of the ts
   * @param {string} emote
   */
  setEmote(emote) {
    if (!emote || typeof emote !== "string") {
      throw new TypeError("Emote must be a non-empty string.");
    }
    this.client.ts.emote = emote;
    return this;
  }

  /**
   * Sets the index of the returning ts
   * @param {number} index
   */
  setIndex(index) {
    if (!index || typeof index !== "number") {
      throw new TypeError("Index must be a number.");
    }
    this.client.ts.index = index;
    return this;
  }

  /**
   * returns the updated ts details
   */
  update() {
    return this.client.ts;
  }
}

export default { UpdateTS };
