import { mediaGallery, mediaGalleryItem, section, textDisplay, container, row, separator, button } from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import config from "@/config";
import { ComponentType } from "discord-api-types/v10";

const WLRealms = ["Dawn", "Prairie", "Forest", "Valley", "Wasteland", "Vault", "Void"] as const;
type Filters = `${(typeof WLRealms)[number]}.${string}`;
export class WingedLightsDisplay extends BasePlannerHandler {
  private realm: (typeof WLRealms)[number] = "Dawn";
  private areas: string[] | null = [];
  private filters: Filters | null = null;
  override handle() {
    this.transformFilters();

    const wls = this.data.wingedLights.filter((wl) => this.areas!.includes(wl.area.guid));

    return {
      components: [
        container(
          this.getTopBtns(),
          textDisplay("Filter by Realm"),
          this.getRealmRow(),
          textDisplay("Filter by Areas:"),
          this.getAreaFilterRow(),
          separator(true, 1),
          section(this.viewbtn(this.createCustomId({}), { label: "All Found" }), `# Winged Lights (${wls.length})`),
          ...this.wlslist(wls),
        ),
      ],
    };
  }
  wlslist(wls: SkyPlannerData.IWingedLight[]) {
    return this.displayPaginatedList({
      items: wls,
      perpage: 4,
      itemCallback: (wl, i) => [
        textDisplay(
          `**${i + 1}\\. Area: ${wl.area.name} | Realm: ${wl.area.realm.name}**\n${wl.description ? `${emojis.tree_end} ${wl.description}` : ""}`,
        ),
        row(
          this.viewbtn(this.createCustomId({ item: wl.guid, filter: this.filters! }), { label: "Found" }),
          ...(wl.mapData?.videoUrl
            ? [
                /** Keep it video, bcz initial data can be empty, that way it can fall back to `video` which is default state */
                this.viewbtn(
                  this.createCustomId({
                    item: wl.guid,
                    filter: this.filters!,
                    data: this.verifyRefWl(wl, "video") ? "minimize" : "video",
                  }),
                  {
                    label: this.verifyRefWl(wl, "video") ? "Minimize" : "Video Guide",
                    emoji: { id: this.verifyRefWl(wl, "video") ? emojis.uparrow : emojis.downarrow },
                    style: this.verifyRefWl(wl, "video") ? 3 : 2,
                  },
                ),
              ]
            : []),
        ),
        ...(wl.mapData?.videoUrl
          ? [
              ...(this.verifyRefWl(wl, "video")
                ? [mediaGallery(mediaGalleryItem(this.resolveVidURL(wl.mapData.videoUrl))), separator()]
                : []),
            ]
          : []),
      ],
    });
  }

  private verifyRefWl(wl: SkyPlannerData.IWingedLight, data?: string) {
    return this.state.item === wl.guid && (!data || this.state.data === data);
  }

  private resolveVidURL(url: string) {
    return config.SKY_PLANNER_URL + `/assets/game/col/${url}`;
  }

  private getAreaFilterRow() {
    const realm = this.data.realms.find((r) => r.shortName === this.realm)!;
    const filters = this.areas ?? [realm.areas![0]!.guid];
    return row({
      type: ComponentType.StringSelect,
      min_values: 1,
      max_values: realm.areas!.filter((a) => a.wingedLights?.length).length,
      custom_id: this.createCustomId({ data: "areas", filter: this.filters! }),
      options: realm
        .areas!.filter((a) => a.wingedLights?.length /* only include areas with wls */)
        .map((a) => ({
          label: a.name,
          value: a.guid,
          default: filters.includes(a.guid),
        })),
    });
  }

  private getRealmRow() {
    return row({
      type: ComponentType.StringSelect,
      placeholder: "Select a realm to it's wls",
      custom_id: this.createCustomId({ data: "realms", filter: this.filters! }),
      options: WLRealms.map((r) => {
        const realm = this.data.realms.find((s) => s.shortName === r)!;
        return {
          label: realm.name,
          value: r,
          default: r === this.realm,
          emoji: realm.icon ? { id: realm.icon } : undefined,
        };
      }),
    });
  }

  private transformFilters() {
    const [realm, ...areas] = (this.state.filter ?? "").split(".");
    this.realm = realm ? (realm as (typeof WLRealms)[number]) : "Dawn";
    this.areas = areas.length ? areas : null;
    if (this.state.values?.length) {
      // this means it is a select menu interaction for realm/areas filter;
      if (this.state.data === "realms") {
        this.realm = this.state.values[0] as (typeof WLRealms)[number];

        this.areas = null; // reset areas on realm change
      }
      if (this.state.data === "areas") this.areas = this.state.values;

      // reset page when changing areas or realms
      this.state.page = 1;
    }
    this.areas ??= [this.data.realms.find((r) => r.shortName === this.realm)!.areas!.find((a) => a.wingedLights?.length)!.guid];

    this.filters = `${this.realm}.${this.areas.length ? this.areas.join(".") : ""}`;
  }

  private getTopBtns() {
    return row(
      this.viewbtn(this.createCustomId({}), { label: "All Found" + ` (${this.data.wingedLights.length})` }),
      this.viewbtn(this.createCustomId({}), { label: "Reset All", style: 4 }),
      button({ label: "Home", custom_id: this.createCustomId({ tab: DisplayTabs.Home }), style: 4 }),
    );
  }
}
