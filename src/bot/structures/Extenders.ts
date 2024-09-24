/* eslint-disable space-before-function-paren */
import { BaseInteraction, Message } from "discord.js";
import { getTranslator } from "#bot/i18n";
import { getSettings, getUser } from "#bot/database/index";

BaseInteraction.prototype.t = async function () {
  const guild = this.guild;
  const user = this.user;
  let gSettings;
  if (guild) gSettings = await getSettings(guild);
  const uSettings = await getUser(user);
  return getTranslator(uSettings.language?.value || gSettings?.language?.value || "en-US");
};

Message.prototype.t = async function () {
  const guild = this.guild;
  const user = this.author;
  let gSettings;
  if (guild) gSettings = await getSettings(guild);
  const uSettings = await getUser(user);
  return getTranslator(uSettings.language?.value || gSettings?.language?.value || "en-US");
};

// Array
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.last = function () {
  return this[this.length - 1];
};
