import { mediaGallery, mediaGalleryItem, section, textDisplay, container, row, separator } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "./base.js";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import config from "@/config";
import { DisplayTabs, FilterType, PlannerAction, type NavigationState } from "@/types/planner";
import { createActionId } from "../planner-utils.js";
import { ItemType, type PlannerAssetData } from "@skyhelperbot/constants/skygame-planner";
import type { UserSchema } from "@/types/schemas";
import type { SkyHelper } from "@/structures";
import { serializeFilters } from "./filter.manager.js";

export class WingedLightsDisplay extends BasePlannerHandler {
  constructor(
    data: PlannerAssetData,
    planner: typeof SkyPlannerData,
    state: NavigationState,
    settings: UserSchema,
    client: SkyHelper,
  ) {
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
            this.viewbtn(createActionId({ action: PlannerAction.ToggleWL, actionType: "filtered", navState: this.state }), {
              label: "All Found" + ` (${wls.length})`,
              disabled: wls.every((wl) => wl.unlocked),
            }),
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
          `**${i + 1}\\. Area: ${wl.area.name} | Realm: ${wl.area.realm.name}**${wl.unlocked ? ` ${this.formatemoji(emojis.checkmark)}` : ""}\n${wl.description ? `${emojis.tree_end} ${wl.description}` : ""}`,
          wl.unlocked ? `- **Found**` : "",
        ),
        row(
          this.viewbtn(createActionId({ action: PlannerAction.ToggleWL, guid: wl.guid, navState: this.state }), {
            label: wl.unlocked ? "Uncollect" : "Collect",
            style: wl.unlocked ? 4 : 1,
          }),
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

  public filterWls(wls: SkyPlannerData.IWingedLight[]) {
    let winged = [...wls];
    const realms = this.filterManager!.getFilterValues(FilterType.Realms);
    if (realms.length) winged = winged.filter((wl) => realms.includes(wl.area.realm.guid));

    const areas = this.filterManager!.getFilterValues(FilterType.Areas);
    if (areas.length) winged = winged.filter((wl) => areas.includes(wl.area.guid));
    return winged;
  }

  private getTopBtns() {
    const remainingWls = this.data.wingedLights.filter((wl) => !wl.unlocked);
    return row(
      [
        this.createFilterButton("Filter"),
        this.viewbtn(createActionId({ action: PlannerAction.ToggleWL, actionType: "all", navState: this.state }), {
          label: "All Found" + ` (${remainingWls.length}/${this.data.wingedLights.length})`,
          disabled: remainingWls.length === 0,
        }),
        this.viewbtn(createActionId({ action: PlannerAction.ToggleWL, actionType: "reset", navState: this.state }), {
          label: "Reset All",
          style: 4,
          disabled: remainingWls.length === this.data.wingedLights.length,
        }),
        this.state.b ? this.backbtn(this.createCustomId({ it: null, f: null, ...this.state.b, b: undefined })) : null,
        this.viewbtn(
          this.createCustomId({
            t: DisplayTabs.Items,
            f: serializeFilters(new Map([[FilterType.ItemTypes, [ItemType.WingBuff]]])),
          }),
          { label: "Wing Buffs" },
        ),
      ].filter((s) => !!s),
    );
  }
}
