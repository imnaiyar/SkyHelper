import config from '@root/config';
import moment from 'moment-timezone';
import fs from 'fs';

/**
 * @class
 * @classdesc A class to handle sharding and realm indexing.
 * @property {Object}
 * @returns
 */
export default class shardsUtil {
  /**
   * @method getDate - get provided date in moment
   * @param {Date} date - date to get in moment
   * @returns {moment.Moment | 'invalid' | Error}
   */
  static getDate(date) {
    const timezone = "America/Los_Angeles";

    let currentDate;
    try {
      if (date) {
        currentDate = moment.tz(date, "Y-MM-DD", timezone).startOf("day");
      } else {
        currentDate = moment().tz(timezone);
      }
      if (!currentDate.isValid()) {
        return "invalid";
      } else {
        return currentDate;
      }
    } catch (error) {
      console.log(error);
      return "error";
    }
  }

  /**
   * Returns shards index for a given date
   * @param {moment.Moment} date
   */
  static shardsIndex(date) {
    const dayOfMonth = date.date();
    const shardIndex = (dayOfMonth - 1) % config.shardSequence.length;
    const currentShard = config.shardSequence[shardIndex];
    const realmIndex = (dayOfMonth - 1) % config.realmSequence.length;
    const currentRealm = config.realmSequence[realmIndex];

    return { currentShard, currentRealm };
  }

  /**
   * returns suffix for a given number
   * @param {number} number
   */
  static getSuffix(number) {
    const suffixes = ["th", "st", "nd", "rd"];
    const remainder10 = number % 10;
    const remainder100 = number % 100;

    // Suffix for shards index
    return suffixes[
      remainder10 === 1 && remainder100 !== 11
        ? 1
        : remainder10 === 2 && remainder100 !== 12
          ? 2
          : remainder10 === 3 && remainder100 !== 13
            ? 3
            : 0
    ];
  }

  /**
   * @param {JSON} data
   */
  static saveMessageData(data) {
    fs.readFile("messageData.json", "utf8", (err, fileData) => {
      if (err) {
        if (err.code === "ENOENT") {
          fileData = "[]";
        } else {
          console.error("Error reading file:", err);
          return;
        }
      }

      const jsonData = JSON.parse(fileData);
      jsonData.push(data);

      fs.writeFile("messageData.json", JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error("Error writing file:", err);
        }
      });
    });
  }

  /**
   *
   * @param {import('discord.js').Interaction} interaction
   * @param {string} messageId
   */
  static getMessageDate(interaction, messageId) {
    const data = interaction.client.shardsData.get(messageId);

    const dateOption = data.time;

    let currentDate;
    if (dateOption) {
      currentDate = moment.tz(dateOption, "Y-MM-DD", interaction.client.timezone).startOf("day");
      if (!currentDate.isValid()) {
        throw new Error(`currentDate is not valid. Date fetched:- ${currentDate}`);
      }
    } else {
      currentDate = moment.tz(interaction.client.timezone).startOf("day");
    }

    return currentDate;
  }
};
