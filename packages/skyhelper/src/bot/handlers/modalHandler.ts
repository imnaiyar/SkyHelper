import type { SkyHelper } from "@/structures";
import { buildCalendarResponse } from "@/utils/classes/Embeds";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import {
  ComponentType,
  MessageFlags,
  type APIButtonComponentWithCustomId,
  type APIContainerComponent,
  type APIEmbed,
  type APIGuildForumChannel,
  type APIGuildMember,
  type APIModalSubmitInteraction,
  type APINewsChannel,
  type APITextChannel,
} from "@discordjs/core";
import { PermissionsUtil, resolveColor, separator, textDisplay } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import { fetchSkyData, handlePlannerNavigation, PlannerDataService } from "@/planner";
import { DisplayTabs } from "@/types/planner";
import { nanoid } from "nanoid";
import { setLoadingState } from "@/utils/loading";
import { supportedLang } from "@skyhelperbot/constants";
import { DiscordAPIError } from "@discordjs/rest";
import { customizeEmbed } from "@/modules/inputCommands/utility/sub/bot";

export async function handleShardsCalendarModal(helper: InteractionHelper) {
  const int = helper.int as APIModalSubmitInteraction;

  const monthValue = Utils.getModalComponent(int, "month", ComponentType.StringSelect, true).values[0];
  const yearValue = Utils.getTextInput(int, "year", true).value;

  const month = Number(monthValue);
  const year = Number(yearValue);

  if (isNaN(year) || !Number.isInteger(year)) {
    await helper.reply({
      content: helper.t("commands:SHARDS_CALENDAR.RESPONSES.INVALID_DATE", {
        DATE: `${monthValue}-${yearValue}`,
      }),
      flags: 64,
    });
    return;
  }

  const testDate = DateTime.fromObject({ month, year });
  if (!testDate.isValid) {
    await helper.reply({
      content: helper.t("commands:SHARDS_CALENDAR.RESPONSES.INVALID_DATE", {
        DATE: `${month}-${year}`,
      }),
      flags: 64,
    });
    return;
  }

  const legacy = int.data.custom_id.split(";")[1] === "true";

  const accessory = (int.message?.components?.[0] as APIContainerComponent).components.find(
    (c) => c.type == ComponentType.Section,
  )?.accessory;

  const loadingState = setLoadingState(int.message!.components!, (accessory as APIButtonComponentWithCustomId).custom_id);

  await helper.update({ components: loadingState });

  const data = await buildCalendarResponse(helper.t, helper.user.id, { month, year, index: 0 }, legacy);

  await helper.editReply({ ...data, flags: MessageFlags.IsComponentsV2 });
  return;
}

export async function handleErrorModal(helper: InteractionHelper) {
  await helper.reply({
    content: helper.t("errors:ERROR_MODAL.SUCCESS"),
    flags: 64,
  });
  const { int, client } = helper as { int: APIModalSubmitInteraction; client: SkyHelper };
  const commandUsed = client.utils.getTextInput(int, "commandUsed")?.value;
  const whatHappened = client.utils.getTextInput(int, "whatHappened")?.value;
  const errorId = client.utils.getTextInput(int, "errorId")?.value;
  const guild = client.guilds.get(int.guild_id ?? "");
  const embed: APIEmbed = {
    title: "BUG REPORT",
    fields: [
      { name: "Command Used", value: `\`${commandUsed}\`` },
      {
        name: "User",
        value: `${helper.user.username} \`[${helper.user.id}]\``,
      },
      {
        name: "Server",
        value: `${guild?.name} \`[${int.guild?.id}]\``,
      },
      { name: "What Happened", value: `${whatHappened}` },
    ],
    color: resolveColor("Blurple"),
    timestamp: new Date().toISOString(),
  };
  const errorWb = process.env.BUG_REPORTS ? Utils.parseWebhookURL(process.env.BUG_REPORTS) : null;
  if (errorWb) {
    await client.api.webhooks.execute(errorWb.id, errorWb.token, {
      username: "Bug Report",
      content: `Error ID: \`${errorId}\``,
      embeds: [embed],
    });
  }
}

// TODO: Handle this later
export async function breakdownModalDisplay(helper: InteractionHelper, _type: string) {
  const settings = await helper.client.schemas.getUser(helper.user);
  const data = PlannerDataService.resolveProgress(await fetchSkyData(helper.client), settings.plannerData);
  const _breakdowns = PlannerDataService.calculateCurrencyBreakdown(data);
}

export async function handleCurrencyModifyModal(helper: InteractionHelper) {
  const { client, int } = helper;
  if (!helper.isModalSubmit(int)) throw new Error("Not modal submit");
  await helper.deferUpdate();

  const basicCurrencies = ["candles", "hearts", "ac"] as const;
  const [candles, hearts, acs] = basicCurrencies.map((id) =>
    parseFloat(client.utils.getModalComponent(int, id, ComponentType.TextInput, true).value),
  );
  const seasonComp = client.utils.getModalComponent(int, (id) => id.startsWith("season/"), ComponentType.TextInput);
  const seasonData = seasonComp
    ? {
        guid: seasonComp.custom_id.split("/")[1]!,
        values: seasonComp.value.split("/").map((num) => parseInt(num)) as [number, number],
      }
    : null;

  const eventComp = client.utils.getModalComponent(int, (id) => id.startsWith("event/"), ComponentType.TextInput);
  const eventData = eventComp
    ? {
        guid: eventComp.custom_id.split("/")[1]!,
        tickets: parseInt(eventComp.value),
      }
    : null;

  const validations = [
    { name: "candles", value: candles },
    { name: "hearts", value: hearts },
    { name: "ac", value: acs },
    ...(seasonData ? [{ name: "season currency", value: seasonData.values[0] + seasonData.values[1] }] : []),
    ...(eventData ? [{ name: "event currency", value: eventData.tickets }] : []),
  ];

  const invalidFields = validations.filter((v) => Number.isNaN(v.value)).map((v) => v.name);

  const settings = await client.schemas.getUser(helper.user);
  const plannerData = settings.plannerData ?? PlannerDataService.createEmpty();

  if (!Number.isNaN(candles)) plannerData.currencies.candles = candles ?? 0;
  if (!Number.isNaN(hearts)) plannerData.currencies.hearts = hearts ?? 0;
  if (!Number.isNaN(acs)) plannerData.currencies.ascendedCandles = acs ?? 0;

  if (seasonData && !Number.isNaN(seasonData.values[0]) && !Number.isNaN(seasonData.values[1])) {
    plannerData.currencies.seasonCurrencies[seasonData.guid] = {
      candles: seasonData.values[0],
      hearts: seasonData.values[1],
    };
    settings.markModified("plannerData.currencies.seasonCurrencies");
  }

  if (eventData && !Number.isNaN(eventData.tickets)) {
    plannerData.currencies.eventCurrencies[eventData.guid] = {
      tickets: eventData.tickets,
    };
    settings.markModified("plannerData.currencies.eventCurrencies");
  }
  await settings.save();

  const [skyData, navData] = await Promise.all([
    fetchSkyData(helper.client),
    handlePlannerNavigation({ t: DisplayTabs.Home }, helper.user, client),
  ]);

  const formatted = PlannerDataService.userCurrencyToEmoji(skyData, plannerData);

  await helper.editReply(navData);
  await helper.followUp({
    content: [
      "# Updated Currencies:\n",
      `You have:\n${formatted}`,
      invalidFields.length &&
        `-# ⚠️ The following currencies were not updated due to invalid numbers: ${invalidFields.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    flags: 64,
  });
}

export async function handlePlannerFriendNameModal(helper: InteractionHelper) {
  const int = helper.int as APIModalSubmitInteraction;
  await helper.deferUpdate();
  const friendNameInput = helper.client.utils.getModalComponent(int, "friend-name-input", ComponentType.TextInput, true);
  const friendName = friendNameInput.value.trim();
  const settings = await helper.client.schemas.getUser(helper.user);

  // eslint-disable-next-line
  settings.plannerData!.keys ??= {};
  settings.plannerData!.keys.friends ??= { friends: [] };

  const existingFriendIndex = settings.plannerData!.keys.friends.friends.findIndex(
    // friend guid is added to modal's custom id separated by `|` if its for name edit
    (f: any) => f.guid === (int.data.custom_id.split("|")[1] ?? ""),
  );
  if (existingFriendIndex !== -1) {
    // Edit existing friend
    settings.plannerData!.keys.friends.friends[existingFriendIndex].name = friendName;
  } else {
    // Add new friend
    settings.plannerData!.keys.friends.friends.push({
      guid: nanoid(10),
      date: new Date().toISOString(),
      name: friendName,
      unlocked: "",
    });
  }

  settings.markModified("plannerData.keys");
  await settings.save();
  const data = await handlePlannerNavigation(
    {
      t: DisplayTabs.Friends,
      // if this is present, then this should be for editing names and redirect approp.
      it: existingFriendIndex !== -1 ? int.data.custom_id.split("|")[1] : undefined,
    },
    helper.user,
    helper.client,
  );
  await helper.editReply(data);
}

export async function botManageModal(helper: InteractionHelper) {
  const int = helper.int as APIModalSubmitInteraction;
  const action = int.data.custom_id.split(";")[1]!;
  const client = helper.client;
  switch (action) {
    case "manage": {
      await helper.defer({ flags: MessageFlags.Ephemeral });
      const guild = client.guilds.get(int.guild_id ?? "");
      const guild_settings = guild && (await client.schemas.getSettings(guild));
      const user_settings = await client.schemas.getUser(helper.user);

      let isAdmin = false;
      if (guild && int.member && client.permUtils(int.member.permissions as `${number}`).has("ManageGuild")) isAdmin = true;
      let guild_language: string | undefined;
      let announcement_channel;
      let beta;
      // these components should be present for admins
      if (isAdmin) {
        guild_language = client.utils.getModalComponent(int, "bot-manage-server-language", ComponentType.StringSelect)?.values[0];
        announcement_channel = client.utils.getModalComponent(int, "bot-manage-announcement-channel", ComponentType.ChannelSelect)
          ?.values[0];
        beta = client.utils.getModalComponent(int, "bot-manage-beta", ComponentType.StringSelect)?.values[0];
      }
      if (announcement_channel) {
        const channel = client.channels.get(announcement_channel)! as APITextChannel | APINewsChannel | APIGuildForumChannel;
        const hasPerms = PermissionsUtil.overwriteFor(guild!.clientMember, channel, guild!).has(["ViewChannel", "SendMessages"]);
        if (!hasPerms) {
          return await helper.editReply({
            content: helper.t("errors:NO_CHANNEL_PERM", { CHANNEL: announcement_channel }),
          });
        }
      }

      const user_language = client.utils.getModalComponent(int, "bot-manage-user-language", ComponentType.StringSelect)
        ?.values[0];
      if (guild_settings && isAdmin) {
        guild_settings.annoucement_channel = announcement_channel ?? null;
        guild_settings.beta = beta === "enable";
        guild_settings.language = supportedLang.find((l) => l.value === guild_language);
      }
      user_settings.language = supportedLang.find((l) => l.value === user_language);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await Promise.all([guild_settings?.save(), user_settings.save()]);

      await helper.editReply({
        components: [
          textDisplay("# Bot Settings Updated"),
          separator(),
          textDisplay(
            "### Settings",
            `User: <@${helper.user.id}>${guild ? ` | Server: **${guild.name}**` : ""}\n`,
            `- Server Language: ${guild_language ? supportedLang.find((l) => l.value === guild_language)?.name : "Default (English)"}`,
            `- Announcement Channel: ${announcement_channel ? `<#${announcement_channel}>` : "Not Set"}`,
            `- Beta Features: ${beta === "enable" ? "Enabled" : "Disabled"}`,
            `- User Language: ${user_language ? supportedLang.find((l) => l.value === user_language)?.name : "Default (English)"}`,
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
        allowed_mentions: { parse: [] },
      });
      break;
    }
    case "customize": {
      await helper.update({});

      const followUpMsg = await helper.followUp({
        content: "Applying elder's magic on the bot...",
        flags: MessageFlags.Ephemeral,
      });
      const nick = client.utils.getModalComponent(int, "nick", ComponentType.TextInput)?.value;
      const bio = client.utils.getModalComponent(int, "bio", ComponentType.TextInput)?.value;
      const avatar = client.utils.getModalComponent(int, "avatar", ComponentType.FileUpload)?.values[0];
      const banner = client.utils.getModalComponent(int, "banner", ComponentType.FileUpload)?.values[0];

      const avatarAtt = int.data.resolved?.attachments?.[avatar ?? ""];
      const bannerAtt = int.data.resolved?.attachments?.[banner ?? ""];
      const avatarBase =
        avatarAtt && (await fetch(avatarAtt.url).then((b) => b.arrayBuffer().then((c) => Buffer.from(c).toString("base64"))));

      const bannerBase =
        bannerAtt && (await fetch(bannerAtt.url).then((b) => b.arrayBuffer().then((c) => Buffer.from(c).toString("base64"))));
      /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
      const response = await helper.client.api.users
        .editCurrentGuildMember(int.guild_id!, {
          nick: nick || null,
          bio: bio || null,
          avatar: avatarBase ? `data:${avatarAtt.content_type ?? "image/png"};base64,${avatarBase}` : null,
          banner: bannerBase ? `data:${bannerAtt.content_type ?? "image/png"};base64,${bannerBase}` : null,
        })
        .catch((c: DiscordAPIError) => c);
      /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

      if (response instanceof DiscordAPIError) {
        if (response.message.includes("RATE_LIMIT")) {
          await helper.editReply({ content: helper.t("commands:BOT.responses.customize.ratelimit") }, followUpMsg.id);
          return;
        }
        await helper.editReply(
          {
            content: `Oops! An error returned from discord's side!\n\n\`\`\`\n${response.message}\n\`\`\``,
          },
          followUpMsg.id,
        );
        return;
      }

      await helper.editReply({ content: helper.t("commands:BOT.responses.customize.success") }, followUpMsg.id);

      // update the original embed with changes
      await helper.editReply({ components: customizeEmbed(helper.t, response as APIGuildMember & { bio: string }) });
    }
  }
}
