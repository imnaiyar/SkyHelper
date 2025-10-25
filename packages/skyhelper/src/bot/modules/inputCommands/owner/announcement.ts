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
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { SendableChannels } from "@skyhelperbot/constants";
import { textDisplay } from "@skyhelperbot/utils";
export default {
  ...ANNOUNCEMENT_DATA,
  async messageRun({ message, client }) {
    const msg = await client.api.channels.createMessage(message.channel_id, {
      content: "Please send the text you want to announce through the modal.",
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Announcement Text",
              custom_id: client.utils.store.serialize(CustomId.Default, {
                data: "announcement_text_button",
                user: message.author.id,
              }),
              style: 2,
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
  async interactionRun({ helper, options }) {
    await handleModal(helper, options);
  },
} satisfies Command;

async function handleModal(helper: InteractionHelper, options?: InteractionOptionResolver) {
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
      {
        type: ComponentType.Label,
        label: "Files",
        description: "Any file attachments that should be sent with annoucements",
        component: {
          type: ComponentType.FileUpload,
          custom_id: "attachments",
          max_values: 10,
          required: false,
        },
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
  text = text.replace(/::cmd::(.*?)::/g, (_match, commandPath) => {
    const parts = commandPath.split(" ");
    const commandName = parts.shift();
    const subCommandPath = parts.join(" ");

    const subCommand = subCommandPath ? ` ${subCommandPath}` : "";

    return helper.client.utils.mentionCommand(helper.client, commandName, subCommand);
  });

  const atchs = helper.client.utils.getModalComponent(modalSubmit, "attachments", ComponentType.FileUpload, true).values;
  const files = await Promise.all(
    atchs.map(async (id) => {
      const ats = modalSubmit.data.resolved!.attachments![id]!;
      const arrayBuff = await fetch(ats.proxy_url).then((res) => res.arrayBuffer());
      return { name: ats.filename, data: Buffer.from(arrayBuff) };
    }),
  );

  const data = await helper.client.schemas.getAnnouncementGuilds();
  const guilds = options
    ?.getString("guilds")
    // eslint-disable-next-line
    ?.split(",")
    .map((s) => s.trim());
  for (const { annoucement_channel, _id } of data) {
    const channel = helper.client.channels.get(annoucement_channel!);
    if (!channel) continue;
    if (!SendableChannels.includes(channel.type)) continue;
    if (!guilds?.includes(_id)) continue;
    await helper.client.api.channels
      .createMessage(channel.id, { components: [textDisplay(text)], files, flags: MessageFlags.IsComponentsV2 })
      .catch(() => {});

    await new Promise((r) => setTimeout(r, 2_000));
  }
  await modalHelper.editReply({ content: "Announcement sent to all the announcement channels.", components: [] }).catch(() => {});
}
