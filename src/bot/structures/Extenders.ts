import { BaseInteraction, Message } from "discord.js";
import { getTranslator } from "#bot/i18n";
import { getSettings, getUser } from "#bot/database/index";
/* prettier-ignore */
BaseInteraction.prototype.t = async function() {
  const guild = this.guild;
  const user = this.user;
  let gSettings;
  if (guild) gSettings = await getSettings(guild);
  const uSettings = await getUser(user);
  return getTranslator(uSettings.language?.value || gSettings?.language?.value || "en-US");
};

/* prettier-ignore */
Message.prototype.t = async function() {
  const guild = this.guild;
  const user = this.author;
  let gSettings;
  if (guild) gSettings = await getSettings(guild);
  const uSettings = await getUser(user);
  return getTranslator(uSettings.language?.value || gSettings?.language?.value || "en-US");
};
