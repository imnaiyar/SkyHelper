import { ANNOUNCEMENT_DATA } from "@/modules/commands-data/owner-commands";
import type { Command } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { CustomId } from "@/utils/customId-store";
import {
  ComponentType,
  MessageFlags,
  type APIMessageComponentButtonInteraction,
  type APIModalInteractionResponseCallbackData,
} from "@discordjs/core";
import { SendableChannels } from "@skyhelperbot/constants";
import { textDisplay } from "@skyhelperbot/utils";
export default {
  ...ANNOUNCEMENT_DATA,
  async messageRun({ message, client }) {
    const msg = await client.api.channels.createMessage(message.channel_id, {
      content: "Please send the text you want to announce through the modal.",
      components: [
        {
          type: 1, // ActionRow
          components: [
            {
              type: 2, // Button
              label: "Announcement Text",
              custom_id: client.utils.store.serialize(CustomId.Default, {
                data: "announcement_text_button",
                user: message.author.id,
              }),
              style: 2, // Secondary
            },
          ],
        },
      ],
    });
    const filter = (i: APIMessageComponentButtonInteraction) =>
      (i.member?.user ?? i.user)!.id === message.author.id && client.config.OWNER.includes((i.member?.user ?? i.user)!.id);
    const collected = await client
      .awaitComponent<ComponentType.Button>({
        filter,
        componentType: ComponentType.Button,
        idle: 60_000,
        message: msg,
      })
      .catch(() => null);
    if (!collected) return;
    const helper = new InteractionHelper(collected, client);
    await handleModal(helper);
  },
  async interactionRun({ helper }) {
    await handleModal(helper);
  },
} satisfies Command;

async function handleModal(helper: InteractionHelper) {
  const aModal: APIModalInteractionResponseCallbackData = {
    custom_id: "announcement_text_modal" + helper.int.id,
    title: "Announcement Text",
    components: [
      {
        type: 1, // ActionRow
        components: [
          {
            type: 4, // TextInput
            custom_id: "announcement_text_input",
            label: "Announcement Text",
            placeholder: "Enter the announcement text here",
            style: 2, // Paragraph
            required: true,
          },
        ],
      },
    ],
  };

  await helper.launchModal(aModal);
  const modalSubmit = await helper.client
    .awaitModal({
      filter: (i) =>
        (i.member?.user ?? i.user)!.id === helper.user.id &&
        helper.client.config.OWNER.includes((i.member?.user ?? i.user)!.id) &&
        i.data.custom_id === "announcement_text_modal" + helper.int.id,
      timeout: 2_60_000,
    })
    .catch(() => null);

  if (!modalSubmit) return;
  const modalHelper = new InteractionHelper(modalSubmit, helper.client);
  await modalHelper.defer();
  let text = helper.client.utils.getTextInput(modalSubmit, "announcement_text_input", true).value;

  // Parse and format command mentions
  text = text.replace(/::cmd::(.*?)::/g, (match, commandPath) => {
    const parts = commandPath.split(" ");
    const commandName = parts.shift();
    const subCommandPath = parts.join(" ");

    const command = helper.client.applicationCommands.find((cmd) => cmd.name === commandName);

    if (!command) return match;

    const subCommand = subCommandPath ? ` ${subCommandPath}` : "";

    return `</${command.name}${subCommand}:${command.id}>`;
  });

  const data = await helper.client.schemas.getAnnouncementGuilds();

  for (const { annoucement_channel } of data) {
    const channel = helper.client.channels.get(annoucement_channel!);
    if (!channel) continue;
    if (!SendableChannels.includes(channel.type)) continue;
    await helper.client.api.channels
      .createMessage(channel.id, { components: [textDisplay(text)], flags: MessageFlags.IsComponentsV2 })
      .catch(() => {});
  }
  await modalHelper.editReply({ content: "Announcement sent to all the announcement channels.", components: [] }).catch(() => {});
}
