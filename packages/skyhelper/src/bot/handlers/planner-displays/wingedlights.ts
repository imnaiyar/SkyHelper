import { mediaGallery, mediaGalleryItem, section, textDisplay, container, row, separator } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "./base.js";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import config from "@/config";
import { FilterType } from "@/types/planner";

export class WingedLightsDisplay extends BasePlannerHandler {
  constructor(data: any, planner: any, state: any, settings: any, client: any) {
    super(data, planner, state, settings, client);

    this.initializeFilters(
      [FilterType.Realms, FilterType.Areas] /* {
      [FilterType.Realms]: { defaultValues: ["E1RwpAdA8l"] }, // dawn guid
    } */,
    );
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
          this.viewbtn(this.createCustomId({ it: wl.guid }), { label: "Found" }),
          ...(wl.mapData?.videoUrl
            ? [
                /** Keep it video, bcz initial data can be empty, that way it can fall back to `video` which is default state */
                this.viewbtn(
                  this.createCustomId({
                    it: wl.guid,
                    d: this.verifyRefWl(wl, "video") ? "minimize" : "video",
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
    return this.state.it === wl.guid && (!data || this.state.d === data);
  }

  private resolveVidURL(url: string) {
    return config.SKY_PLANNER_URL + `/assets/game/col/${url}`;
  }

  private filterWls(wls: SkyPlannerData.IWingedLight[]) {
    let winged = [...wls];
    const realms = this.filterManager!.getFilterValues(FilterType.Realms);
    if (realms.length) winged = winged.filter((wl) => realms.includes(wl.area.realm.guid));

    const areas = this.filterManager!.getFilterValues(FilterType.Areas);
    if (areas.length) winged = winged.filter((wl) => areas.includes(wl.area.guid));
    return winged;
  }

  private getTopBtns() {
    return row(
      [
        this.createFilterButton("Filter"),
        this.viewbtn(this.createCustomId({}), { label: "All Found" + ` (${this.data.wingedLights.length})` }),
        this.viewbtn(this.createCustomId({}), { label: "Reset All", style: 4 }),
        this.state.b ? this.backbtn(this.createCustomId({ it: null, f: null, ...this.state.b, b: undefined })) : null,
      ].filter((s) => !!s),
    );
  }
}
