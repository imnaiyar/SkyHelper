import { SEND_MESSAGE_DATA } from "@/modules/commands-data/owner-commands";
import type { Command } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { APIModalInteractionResponseCallbackData } from "@discordjs/core";

export default {
  ...SEND_MESSAGE_DATA,
  async messageRun({ message, args, client }) {
    const user = message.mentions[0]?.id ?? args[0]!;
    const msg = args.slice(1).join(" ");
    // not catching explicitly to know if something went wrong
    const channel = await client.api.users.createDM(user);
    await client.api.channels.createMessage(channel.id, {
      content: msg,
    });
  },
  async interactionRun({ helper, options }) {
    const user = options.getUser("user", true);
    const modal: APIModalInteractionResponseCallbackData = {
      custom_id: `send_message_modal:${helper.int.id}`,
      title: "Send Message",
      components: [
        {
          type: 1, // ActionRow
          components: [
            {
              type: 4, // TextInput
              custom_id: "message",
              placeholder: "The message to send",
              label: "The message",
              required: true,
              style: 2, // Paragraph
            },
          ],
        },
      ],
    };
    await helper.launchModal(modal);
    const modal_collect = await helper.client
      .awaitModal({
        filter: (i) => i.data.custom_id === `send_message_modal:${helper.int.id}`,
        timeout: 9e4,
      })
      .catch(() => null);
    if (!modal_collect) return;
    const modalHelper = new InteractionHelper(modal_collect, helper.client);
    await modalHelper.defer({ flags: 64 });
    const msg = helper.client.utils.getTextInput(modal_collect, "message", true).value;
    // not catching explicitly to know if something went wrong
    const channel = await helper.client.api.users.createDM(user.id);
    await helper.client.api.channels.createMessage(channel.id, {
      content: msg,
    });
    await modalHelper.editReply({ content: "Message sent!" });
  },
} satisfies Command;
