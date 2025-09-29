import { mediaGallery, mediaGalleryItem, section, textDisplay, container, row, separator, button } from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs, type NavigationState } from "./base.js";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import config from "@/config";
import { FilterType } from "./filter.manager.js";

export class WingedLightsDisplay extends BasePlannerHandler {
  constructor(data: SkyPlannerData.TransformedData, planner: typeof SkyPlannerData, state: NavigationState) {
    super(data, planner, state);
    // initialize first time to populate realms
    this.initializeFilters([FilterType.Realms, FilterType.Areas]);

    const realm = data.realms.find(
      (r) => r.guid === (this.filterManager!.getFilterValues(FilterType.Realms)[0] ?? "E1RwpAdA8l") /* Dawn guid */,
    )!;
    const areas = realm.areas?.filter((a) => a.wingedLights?.length) ?? [];
    // second initialize with areas
    this.initializeFilters(areas.length ? [FilterType.Realms, FilterType.Areas] : [FilterType.Realms], {
      [FilterType.Realms]: { defaultValues: ["E1RwpAdA8l"], multiSelect: false },
      [FilterType.Areas]: {
        // TODO: there'll be conflict if realm is changed but areas values remain according to previous realms, remember to fix it
        defaultValues: [areas[0]?.guid ?? ""],
      },
    });
  }
  override handle() {
    const wls = this.filterWls(this.data.wingedLights);

    return {
      components: [
        container(
          this.getTopBtns(),
          separator(true, 1),
          section(
            this.viewbtn(this.createCustomId({}), { label: "All Found" }),
            `# Winged Lights (${wls.length})`,
            this.createFilterIndicator() ?? "",
          ),
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
          // TODO: it's handling
          this.viewbtn(this.createCustomId({ item: wl.guid }), { label: "Found" }),
          ...(wl.mapData?.videoUrl
            ? [
                /** Keep it video, bcz initial data can be empty, that way it can fall back to `video` which is default state */
                this.viewbtn(
                  this.createCustomId({
                    item: wl.guid,
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

  private filterWls(wls: SkyPlannerData.IWingedLight[]) {
    let winged = [...wls];
    const realm = this.filterManager!.getFilterValues(FilterType.Realms)[0];
    if (realm) winged = winged.filter((wl) => wl.area.realm.guid === realm);

    const areas = this.filterManager!.getFilterValues(FilterType.Areas);
    if (areas.length) winged = winged.filter((wl) => areas.includes(wl.area.guid));
    return winged;
  }

  private getTopBtns() {
    return row(
      this.createFilterButton("Filter"),
      this.viewbtn(this.createCustomId({}), { label: "All Found" + ` (${this.data.wingedLights.length})` }),
      this.viewbtn(this.createCustomId({}), { label: "Reset All", style: 4 }),
      button({ label: "Home", custom_id: this.createCustomId({ tab: DisplayTabs.Home }), style: 4 }),
    );
  }
}
