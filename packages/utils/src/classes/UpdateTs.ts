import type { TSData } from "../typings.js";
/**
 * @class
 * @classdesc A class to update traveling spirit details in the client constructor
 * @method update updates the ts details
 * @returns {Object}
 */
export class UpdateTS {
  constructor(readonly data: TSData) {}
  /**
   * Sets the name of the TS
   * @param name Name of the returning TS
   */
  setName(name: string): this {
    if (!name || typeof name !== "string") {
      throw new TypeError("Name must be a non-empty string.");
    }
    this.data.name = name;
    return this;
  }

  /**
   * Sets the visit date of the ts
   * @param date Returnig date. Format: DD-MM-YYYY
   */
  setVisit(date: string): this {
    if (!date || typeof date !== "string") {
      throw new TypeError("Date must be a non-empty string.");
    }
    this.data.visitDate = date;
    return this;
  }

  /**
   * Sets the value of the t spirit
   * @param value The value of the spirit in the spiritsData
   */
  setValue(value: string): this {
    if (!value || typeof value !== "string") {
      throw new TypeError("Value must be a non-empty string.");
    }
    this.data.value = value;
    return this;
  }

  /**
   * Sets the index of the returning ts
   * @param index The returning index of the TS
   */
  setIndex(index: number): this {
    if (!index || typeof index !== "number") {
      throw new TypeError("Index must be a number.");
    }
    this.data.index = index;
    return this;
  }

  /**
   * returns the updated ts details
   */
  async update(): Promise<TSData> {
    return await this.data.save();
  }
}
