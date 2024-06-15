import { BaseInteraction, Message } from "discord.js";
import { getTranslator } from "#src/il8n";
import { getSettings, getUser } from "#src/database/index";
BaseInteraction.prototype.t = async function() {
  const guild = this.guild;
  const user = this.user;
  let gSettings;
  if (guild) gSettings = await getSettings(guild);
  const uSettings = await getUser(user);
  return getTranslator(uSettings.language?.value || gSettings?.language?.value || "en-US");
};

Message.prototype.t = async function() {
  const guild = this.guild;
  const user = this.author;
  let gSettings;
  if (guild) gSettings = await getSettings(guild);
  const uSettings = await getUser(user);
  return getTranslator(uSettings.language?.value || gSettings?.language?.value || "en-US");
};
