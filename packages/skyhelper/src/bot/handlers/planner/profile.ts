import { button, container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "./base.js";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { formatBreakdownCost } from "./breakdown.js";
import { CustomId, store } from "@/utils/customId-store";
import Utils from "@/utils/classes/Utils";
import { PlannerDataService, type IBreakdownData } from "./helpers/data.service.js";
import { generatePlannerProfileCard } from "@/utils/image-generators/PlannerStatsCard";

export class ProfileDisplay extends BasePlannerHandler {
  override async handle(): Promise<ResponseData> {
    this.state.d ??= "profile";
    let res;
    switch (this.state.d) {
      case "profile":
        res = await this.profiledisplay();
        break;
      case "currency":
        res = this.currencydisplay();
        break;
      default:
        throw new Error("unknown");
    }
    return { ...res, components: [this.topBtns(), ...res.components] };
  }
  async profiledisplay() {
    const currencies = PlannerDataService.userCurrencyToEmoji(
      this.data,
      this.settings.plannerData ?? PlannerDataService.createEmpty(),
    );
    const unlocked = PlannerDataService.formatUnlockedItems(this.data);
    const user = await this.client.api.users.get(this.state.user);
    const profilecard = await generatePlannerProfileCard({
      botIcon: this.client.utils.getUserAvatar(this.client.user),
      botName: this.client.user.username,
      user,
      currencies: this.settings.plannerData?.currencies,
      progress: PlannerDataService.calculateUserProgress(this.data),
    });
    return {
      components: [
        container(
          textDisplay("# User Stats", "You Have:", currencies, unlocked),
          mediaGallery(mediaGalleryItem("attachment://profile.png")),
        ),
      ],
      files: [{ name: "profile.png", data: profilecard }],
    };
  }

  currencydisplay() {
    const breakdown = PlannerDataService.calculateCurrencyBreakdown(this.data);

    // Check if there's any spent currency data
    const hasSpentData = !PlannerDataService.isEmptyCost(breakdown.total.cost) || breakdown.total.price > 0;
    const seasonSpent = this.seasonsSpent(breakdown);
    const breakdownBtn = (id: string) => {
      return button({
        label: "Breakdown (Not implemented yet)",
        custom_id: store.serialize(CustomId.Default, { data: "breakdown_" + id, user: this.state.user }),
        disabled: true,
      });
    };
    const eventsSpent = this.eventsSpent(breakdown);
    const seasonComp = seasonSpent.length
      ? this.displayPaginatedList(
          {
            perpage: 3,
            page: this.state.it === "season" ? this.state.p : 1,
            items: seasonSpent,
            itemCallback(texts, i) {
              return [section(breakdownBtn(`s_${i}`), texts)];
            },
          },
          { it: "season" },
        )
      : null;
    const eventsComp = eventsSpent.length
      ? this.displayPaginatedList(
          {
            perpage: 3,
            page: this.state.it === "event" ? this.state.p : 1,
            items: eventsSpent,
            itemCallback(texts, i) {
              return [section(breakdownBtn(`e_${i}`), texts)];
            },
          },
          { it: "event" },
        )
      : null;
    return {
      components: [
        container(
          separator(),
          textDisplay(
            "# 💰 Currency Breakdown",
            "-# Track your spending across the game",
            !PlannerDataService.isEmptyCost(breakdown.total.cost) || breakdown.total.price > 0
              ? `# Total Spent:\n${formatBreakdownCost(breakdown.total)}`
              : "",
            !PlannerDataService.isEmptyCost(breakdown.regular.cost) || breakdown.regular.price > 0
              ? `# Regular:\n${formatBreakdownCost(breakdown.regular)}`
              : "",
          ),
        ),
        ...(hasSpentData
          ? [seasonComp ? container(seasonComp) : null, eventsComp ? container(eventsComp) : null].filter((s) => !!s)
          : [textDisplay("## You have not spent any currencies yet! Go out there and get some drips!!")]),
      ],
    };
  }

  private seasonsSpent(breakdown: IBreakdownData) {
    const texts = [];
    const sortedSeasons = Array.from(breakdown.seasons.entries())
      .map(([guid, cost]) => ({
        season: this.data.seasons.items.find((s) => s.guid === guid),
        cost,
      }))
      .filter((s) => s.season)
      .sort((a, b) => (b.season!.number || 0) - (a.season!.number || 0));

    for (const { season, cost } of sortedSeasons) {
      if (!season || (PlannerDataService.isEmptyCost(cost.cost) && cost.price === 0)) continue;

      texts.push(`**${Utils.formatEmoji(season.emoji, season.name)} ${season.name}**\n` + formatBreakdownCost(cost));
    }
    return texts;
  }

  private eventsSpent(breakdown: IBreakdownData) {
    const texts = [];
    const sortedEvents = Array.from(breakdown.events.entries())
      .map(([guid, cost]) => ({
        event: this.data.events.items.find((e) => e.guid === guid),
        cost,
      }))
      .filter((e) => e.event)
      .sort((a, b) => {
        const aDate = a.event!.instances?.[a.event!.instances.length - 1]?.date;
        const bDate = b.event!.instances?.[b.event!.instances.length - 1]?.date;
        if (!aDate || !bDate) return 0;
        return bDate.toMillis() - aDate.toMillis();
      });

    for (const { event, cost } of sortedEvents) {
      if (!event || (PlannerDataService.isEmptyCost(cost.cost) && cost.price === 0)) continue;

      texts.push(`**${event.name}**\n` + formatBreakdownCost(cost));
    }
    return texts;
  }

  private topBtns() {
    return row(
      this.viewbtn(this.createCustomId({ it: null, p: null, d: "profile" }), {
        label: "Profile",
        disabled: this.state.d === "profile",
        style: this.state.d === "profile" ? 3 : 2,
      }),
      this.viewbtn(this.createCustomId({ d: "currency" }), {
        label: "Currency Usage",
        disabled: this.state.d === "currency",
        style: this.state.d === "currency" ? 3 : 2,
      }),
    );
  }
}
