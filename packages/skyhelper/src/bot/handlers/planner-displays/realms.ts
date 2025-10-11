import { container, row, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { ComponentType, type APIComponentInContainer } from "discord-api-types/v10";
import { type IRealm, SpiritType } from "@skyhelperbot/constants/skygame-planner";
import { serializeFilters, FilterType } from "./filter.manager.js";
import { spiritTreeDisplay } from "./shared.js";

export class RealmsDisplay extends BasePlannerHandler {
  override handle() {
    const realm = this.data.realms.find((r) => r.guid === this.state.it);
    if (realm) return this.realmdisplay(realm);
    return { components: [this.realmslist()] };
  }
  realmslist() {
    const realms = this.data.realms;
    return container(
      textDisplay(`# Realms (${realms.length})`),
      ...this.displayPaginatedList({
        items: realms,
        page: this.state.p ?? 1,
        perpage: 7,
        itemCallback: (realm) => [
          section(
            {
              type: ComponentType.Button,
              label: "View",
              custom_id: this.createCustomId({ it: realm.guid }),
              style: 1,
            },
            `**${realm.name}**`,
            `${realm.areas?.length ?? 0} Areas • ${this.planner.getSpiritsInRealm(realm.guid, this.data).length} Spirits • ${this.planner.getWingedLightsInRealm(realm.guid, this.data).length} Winged Light`,
          ),
        ],
      }),
    );
  }
  async realmdisplay(realm: IRealm) {
    const constellations = realm.constellation?.icons.map((icon) => icon.spirit).filter((s) => !!s) ?? [];
    const index = this.state.v?.[0] ? parseInt(this.state.v[0]) : 0;
    const constellation = constellations[index];
    const realmSpirits = this.planner.getSpiritsInRealm(realm.guid, this.data);
    const { regular, seasonal } = realmSpirits.reduce(
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

    const title: [string, ...string[]] = [
      `# ${this.formatemoji(realm.emoji, realm.name)} ${realm.name}`,
      `${realm.areas?.length ?? 0} Areas \u2022 ${regular} regular and ${seasonal} seasonal spirits \u2022 ${this.planner.getWingedLightsInRealm(realm.guid, this.data).length} winged lights`,
    ];

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
            b: { ...this.state, b: undefined },
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
            b: { ...this.state, b: undefined },
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
}
