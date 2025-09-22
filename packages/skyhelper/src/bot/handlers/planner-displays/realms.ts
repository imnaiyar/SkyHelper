import {
  container,
  generateSpiritTree,
  mediaGallery,
  mediaGalleryItem,
  row,
  section,
  separator,
  textDisplay,
  thumbnail,
} from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { ComponentType, type APIComponentInContainer } from "discord-api-types/v10";
import { type IRealm, SpiritType } from "@skyhelperbot/constants/skygame-planner";
import type { RawFile } from "@discordjs/rest";

export class RealmsDisplay extends BasePlannerHandler {
  override handle() {
    const realm = this.data.realms.find((r) => r.guid === this.state.item);
    if (realm) return this.realmdisplay(realm);
    return { components: [this.realmslist()] };
  }
  realmslist() {
    const realms = this.data.realms;
    return container(
      this.createTopCategoryRow(DisplayTabs.Realms, this.state.user),
      textDisplay(`# Realms (${realms.length})`),
      ...this.displayPaginatedList({
        items: realms,
        page: this.state.page ?? 1,
        perpage: 7,
        itemCallback: (realm) => [
          section(
            {
              type: ComponentType.Button,
              label: "View",
              custom_id: this.createCustomId({ item: realm.guid }),
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
    const index = this.state.values?.[0] ? parseInt(this.state.values[0]) : 0;
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
        emoji: c.icon ? { id: c.icon } : undefined,
      })),
    });

    const title: [string, ...string[]] = [
      `# ${this.formatemoji(realm.icon, realm.name)} ${realm.name}`,
      `${realm.areas?.length ?? 0} Areas \u2022 ${regular} regular and ${seasonal} seasonal spirits \u2022 ${this.planner.getWingedLightsInRealm(realm.guid, this.data).length} winged lights`,
    ];

    let file: RawFile | undefined;
    if (constellation) {
      const buffer = await generateSpiritTree(constellation.tree!);
      file = { name: "tree.png", data: buffer };
    }
    const components: APIComponentInContainer[] = [
      realm.imageUrl ? section(thumbnail(realm.imageUrl), ...title) : textDisplay(...title),
      row(
        this.viewbtn(
          this.createCustomId({
            tab: DisplayTabs.Areas,
            filter: `realm-${realm.guid}`,
            // @ts-expect-error `back` is not in the type but `state` may include `back` so reset it to prevent infinite depth
            // we only want to go one level back
            back: { ...this.state, back: undefined },
          }),
          { label: `Areas (${realm.areas?.length ?? 0})`, disabled: !realm.areas?.length },
        ),
        this.viewbtn(
          this.createCustomId({
            tab: DisplayTabs.Spirits,
            filter: `type-Guide,Season&realm-${realm.guid}`,
            // @ts-expect-error same as above
            back: { ...this.state, back: undefined },
          }),
          { label: `Spirits (${realmSpirits.length})`, disabled: !realmSpirits.length },
        ),
        this.backbtn(this.createCustomId({ item: "", filter: "", ...this.state.back })),
        this.homebtn(),
      ),
      separator(),
    ];
    if (constellations.length) components.push(textDisplay("### Constellations"));
    if (constellations.length > 1) components.push(c_row);
    if (constellation) {
      components.push(
        section(
          this.viewbtn(this.createCustomId({ tab: DisplayTabs.Spirits, item: constellation.guid }), {
            label: "View",
          }),
          `# ${this.formatemoji(constellation.icon, constellation.name)} ${constellation.name}`,
        ),
        section(
          this.viewbtn(this.createCustomId({}), { label: "Modify" }),
          this.planner.getFormattedTreeCost(constellation.tree!),
          "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
        ),
        mediaGallery(mediaGalleryItem("attachment://tree.png")),
      );
    }
    return { files: file ? [file] : undefined, components: [container(components)] };
  }
}
