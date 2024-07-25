import { BaseInteraction, DMMessageManager, Message, PartialGroupDMChannel } from "discord.js";
import { getTranslator } from "#src/i18n";
import { getSettings, getUser } from "#src/database/index";
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

// TODO: Remove this when djs fixes this issue
Object.defineProperty(PartialGroupDMChannel.prototype, "messages", {
  // prettier-ignore
  get() {
    if (!this._messages) {
      // @ts-ignore
      this._messages = new DMMessageManager(this);
    }
    return this._messages;
  },
});
