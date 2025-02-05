import { MessageFlags } from "@discordjs/core";
import { LINKED_ROLE_DATA } from "../../commands-data/utility-commands.js";
import type { Command } from "@/structures";

export default {
  ...LINKED_ROLE_DATA,
  async interactionRun({ helper, options }) {
    let flags = MessageFlags.SuppressEmbeds;
    if (options.getBoolean("hide")) {
      flags |= 64;
    }
    const text = `Linked role is a special kind of roles that can be used to connect an user account with an application (in this case, the SkyHelper bot).
This allows the bot to update user's role connection data to display specific information on a user's profile in a server (see the attached pic). In this case, we can use this to display basic sky profile (Preferred name, preferences, etcS).
Due to the complicated nature of linked roles, it is difficult to explain everything here, so we have prepared some guides to help you understand how to use linked roles.
- [What is a linked?](https://docs.skyhelper.xyz/linked-role/about)
- [How you can enable linked roles in your server?](https://docs.skyhelper.xyz/linked-role/how-to-enable)
- [How to get/link/update your sky profile with the bot?](https://docs.skyhelper.xyz/linked-role/how-to-link)

-# - If Linked Role connection is enabled for SkyHelper in this server, you can get it by navigating to <id:linked-roles>.`;
    const res = await fetch("https://docs.skyhelper.xyz/linked-role/connection-on-profile.png");
    const buffer = Buffer.from(await res.arrayBuffer());
    await helper.reply({
      content: text,
      flags,
      files: [{ data: buffer, name: "connection-on-profile.png", contentType: res.headers.get("content-type") ?? undefined }],
    });
  },
} satisfies Command;
