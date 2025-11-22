import { container, createEmojiProgressBar, row, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "./base.js";
import { ComponentType, type APIComponentInContainer } from "discord-api-types/v10";
import { serializeFilters } from "./filter.manager.js";
import { spiritTreeDisplay } from "./shared.js";
import { DisplayTabs, FilterType, SpiritType } from "@/types/planner";
import { PlannerService } from "./helpers/planner.service.js";
import { NodeHelper, type ICost, type IRealm, type ITierNode } from "skygame-data";
import { currency } from "@skyhelperbot/constants";
import Utils from "@/utils/classes/Utils";
export class RealmsDisplay extends BasePlannerHandler {
  override handle() {
    const realm = this.data.realms.items.find((r) => r.guid === this.state.it);
    if (realm) {
      return this.realmdisplay(realm);
    }
    return { components: [this.realmslist()] };
  }
  realmslist() {
    const realms = this.data.realms.items;
    return container(
      textDisplay(`# Realms (${realms.length})`),
      ...this.displayPaginatedList({
        items: realms,
        page: this.state.p ?? 1,
        perpage: 7,
        itemCallback: (realm) => {
          const tier1 = this.tiernodes(realm).tier1nodes;
          const progress = this.getTierProgress(tier1, false);
          return [
            section(
              {
                type: ComponentType.Button,
                label: "View",
                custom_id: this.createCustomId({ it: realm.guid }),
                style: 1,
              },
              `**${realm.name}**`,
              `${realm.areas?.length ?? 0} Areas • ${PlannerService.getSpiritsInRealm(realm.guid, this.data).length} Spirits • ${realm.areas?.reduce((acc, ar) => (acc += ar.wingedLights?.length ?? 0), 0) ?? 0} Winged Light`,
              progress ?? "",
            ),
          ];
        },
      }),
    );
  }
  async realmdisplay(realm: IRealm) {
    const constellations = realm.constellation?.icons.map((icon) => icon.spirit).filter((s) => !!s) ?? [],
      index = this.state.v?.[0] ? parseInt(this.state.v[0]) : 0,
      constellation = constellations[index],
      realmSpirits = PlannerService.getSpiritsInRealm(realm.guid, this.data),
      { regular, seasonal } = realmSpirits.reduce(
        (acc, spirit) => {
          if (spirit.type === SpiritType.Season || spirit.type === SpiritType.Guide) acc.seasonal++;
          else acc.regular++;
          return acc;
        },
        { regular: 0, seasonal: 0 },
      );

    const c_row = row({
      type: ComponentType.StringSelect,
      custom_id: this.createCustomId({}),
      placeholder: "Select Constellation",
      options: constellations.map((c, i) => ({
        label: c.name,
        value: i.toString(),
        default: i === index,
        emoji: c.emoji ? { id: c.emoji } : undefined,
      })),
    });

    // tier progress
    const tierNodes = this.tiernodes(realm);
    const tier1 = this.getTierProgress(tierNodes.tier1nodes);
    const tier2 = this.getTierProgress(tierNodes.tier2nodes);
    const title = [
      `# ${this.formatemoji(realm.emoji, realm.name)} ${realm.name}`,
      `${realm.areas?.length ?? 0} Areas \u2022 ${regular} regular and ${seasonal} seasonal spirits \u2022 ${realm.areas?.reduce((acc, ar) => (acc += ar.wingedLights?.length ?? 0), 0) ?? 0} winged lights`,
      tier1 !== null //
        ? `### Tiers\n-# Note: Only tier 1 progress counts towards constellation completion\n-# - Tier 1. ${tier1}\n${tier2 ? `-# - Tier 2. ${tier2}` : ""}`
        : null,
    ].filter((s) => !!s) as [string, ...string[]];

    const gen = constellation ? await spiritTreeDisplay({ tree: constellation.tree!, planner: this }) : null;
    const components: APIComponentInContainer[] = [
      realm.imageUrl ? section(thumbnail(realm.imageUrl), ...title) : textDisplay(...title),
      row(
        this.viewbtn(
          this.createCustomId({
            t: DisplayTabs.Areas,
            f: serializeFilters(new Map([[FilterType.Realms, [realm.guid]]])),
            // `back` is not in the type but `state` may include `back` so reset it to prevent infinite depth
            // we only want to go one level back
            // @ts-expect-error typings don't allow b and user but they exist on state.
            b: { ...this.state, b: null, user: null },
          }),
          { label: `Areas (${realm.areas?.length ?? 0})`, disabled: !realm.areas?.length },
        ),
        this.viewbtn(
          this.createCustomId({
            t: DisplayTabs.Spirits,
            f: serializeFilters(
              new Map([
                [FilterType.Realms, [realm.guid]],
                [FilterType.SpiritTypes, [SpiritType.Regular, SpiritType.Season, SpiritType.Guide]],
              ]),
            ),
            // same as above
            // @ts-expect-error typings don't allow b and user but they exist on state.
            b: { ...this.state, b: undefined, user: null },
          }),
          { label: `Spirits (${realmSpirits.length})`, disabled: !realmSpirits.length },
        ),
        this.backbtn(this.createCustomId({ it: null, f: null, ...this.state.b })),
        this.homebtn(),
      ),
      separator(),
    ];
    if (constellations.length) components.push(textDisplay("### Constellations"));
    if (constellations.length > 1) components.push(c_row);
    if (gen) {
      components.push(...gen.components);
    }
    return { files: gen?.file ? [gen.file] : undefined, components: [container(components)] };
  }

  private tiernodes(realm: IRealm) {
    const tiers =
      realm.areas
        ?.flatMap((a) => a.spirits?.filter((s) => s.type === SpiritType.Regular).map((s) => s.tree?.node))
        .filter((s) => !!s)
        .flatMap((node) => NodeHelper.allTier(node))
        .filter((s) => typeof s.tier === "number") ?? [];
    return {
      tier1nodes: tiers.filter((s) => s.tier! < 2),
      tier2nodes: tiers.filter((s) => s.tier! >= 2),
    };
  }

  private calculateTierCosts(nodes: ITierNode[]) {
    const getNodeCosts = (type: keyof ICost) => {
      return nodes.reduce(
        (acc, tn) => {
          acc.cost += tn[type] ?? 0;
          acc.spent += tn[type] && tn.unlocked ? tn[type] : 0;
          return acc;
        },
        { cost: 0, spent: 0 },
      );
    };
    return {
      candles: getNodeCosts("c"),
      hearts: getNodeCosts("h"),
      acs: getNodeCosts("ac"),
    };
  }

  /**
   * Returns progress bar (in the form of emojis) and cost progress for the given tier nodes
   * @param tier The tier nodes to calculate progress for
   * @param withCost whether to include cost stats or not
   * @returns
   */
  private getTierProgress(tierNodes: ITierNode[], withCost = true) {
    const progress = tierNodes.length ? Math.round((tierNodes.filter((n) => n.unlocked).length / tierNodes.length) * 100) : null;
    if (progress === null) return null;
    const formatCurrency = (c: ReturnType<RealmsDisplay["calculateTierCosts"]>) => {
      const formatted: string[] = [];
      if (c.candles.cost) formatted.push(`${c.candles.spent}/${c.candles.cost} ${Utils.formatEmoji(currency.c, "Candles")}`);
      if (c.hearts.cost) formatted.push(`${c.hearts.spent}/${c.hearts.cost} ${Utils.formatEmoji(currency.h, "Hearts")}`);
      if (c.acs.cost) formatted.push(`${c.acs.spent}/${c.acs.cost} ${Utils.formatEmoji(currency.ac, "ACs")}`);
      return formatted.join(" ");
    };
    return `${createEmojiProgressBar(progress)}${withCost ? ` (${formatCurrency(this.calculateTierCosts(tierNodes))})` : ""}`;
  }
}
