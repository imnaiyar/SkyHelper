import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { type IArea, SpiritType } from "@skyhelperbot/constants/skygame-planner";
import { FilterType, OrderType, serializeFilters } from "./filter.manager.js";
import { section, container, row, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType } from "discord-api-types/v10";
export class AreasDisplay extends BasePlannerHandler {
  constructor(data: any, planner: any, state: any) {
    super(data, planner, state);
    this.state.it ??= this.state.v?.[0];
    this.initializeFilters([FilterType.Realms, FilterType.Order], {
      [FilterType.Realms]: { defaultValues: ["E1RwpAdA8l"] }, // dawn guid
    });
  }
  override handle() {
    const area = this.state.it ? this.data.areas.find((a) => a.guid === this.state.it) : null;
    if (area) {
      return { components: [container(this.areadisplay(area))] };
    }
    const areas = this.filterAreas(this.data.areas);
    return {
      components: [
        container(
          textDisplay(`# Areas (${areas.length})`, this.createFilterIndicator() ?? ""),
          row(
            [
              this.createFilterButton(),
              this.state.b
                ? this.backbtn(this.createCustomId({ it: null, f: null, p: this.state.p, ...this.state.b, b: undefined }))
                : null,
              this.homebtn(),
            ].filter((s) => !!s),
          ),
          separator(true, 1),
          ...this.arealistdisplay(areas),
        ),
      ],
    };
  }

  private arealistdisplay(areas: IArea[]) {
    return this.displayPaginatedList({
      items: areas,
      page: this.state.p ?? 1,
      perpage: 6,
      user: this.state.user,
      itemCallback: (area) => [
        section(
          this.viewbtn(this.createCustomId({ it: area.guid, b: { t: this.state.t, f: this.state.f, p: this.state.p ?? 1 } })),
          `## ${area.name}`,
          [
            `${this.formatemoji(area.realm.emoji, area.realm.shortName)} ${area.realm.name}`,
            area.spirits?.length ? `${area.spirits.length} Spirits` : null,
            area.wingedLights?.length ? `${area.wingedLights.length} Winged Lights` : null,
            area.mapShrines?.length ? `${area.mapShrines.length} Map Shrines` : null,
          ]
            .filter((a) => !!a)
            .join(" • "),
        ),
      ],
    });
  }

  private areadisplay(area: IArea) {
    const title = [`# ${area.name}`, `${this.formatemoji(area.realm.emoji, area.realm.shortName)} ${area.realm.name}`].join("\n");
    const filters = new Map<FilterType, string[]>([
      [FilterType.SpiritTypes, [SpiritType.Regular, SpiritType.Season, SpiritType.Guide]],
      [FilterType.Areas, [area.guid]],
    ]);
    const quick_links = [
      area.spirits?.length
        ? this.viewbtn(
            this.createCustomId({
              t: DisplayTabs.Spirits,
              f: serializeFilters(filters),
              b: { ...this.state, v: undefined, b: undefined },
            }),
            { label: `Spirits (${area.spirits.length})`, style: 2 },
          )
        : null,
      area.wingedLights?.length
        ? this.viewbtn(
            this.createCustomId({
              t: DisplayTabs.WingedLights,
              f: serializeFilters(new Map([[FilterType.Areas, [area.guid]]])),
              b: { ...this.state, v: undefined, b: undefined },
            }),
            { label: `Winged Lights (${area.wingedLights.length})`, style: 2 },
          )
        : null,
      this.viewbtn(
        this.createCustomId({ t: DisplayTabs.Realms, it: area.realm.guid, b: { ...this.state, v: undefined, b: undefined } }),
        { label: `Realm: ${area.realm.shortName}`, style: 2 },
      ),
      this.backbtn(this.createCustomId({ it: null, f: null, p: this.state.p, ...this.state.b })),
      this.homebtn(),
    ].filter((s) => !!s);
    return [
      area.imageUrl ? section(thumbnail(area.imageUrl, area.name), title) : textDisplay(title),
      area.connections?.length
        ? [
            textDisplay("Connections", "-# This area connects to:"),
            row({
              type: ComponentType.StringSelect,
              custom_id: this.createCustomId({ it: null }),
              options: area.connections.map((c) => ({ label: c.area.name, value: c.area.guid })),
              max_values: 1,
              placeholder: "Select an area to view",
            }),
          ]
        : null,
      separator(true, 1),
      textDisplay(`## Quick Navigations`),
      row(quick_links),
    ]
      .filter((s) => !!s)
      .flat();
  }

  private filterAreas(areas: IArea[]) {
    let filtered = [...areas];

    const realms = this.filterManager!.getFilterValues(FilterType.Realms);
    if (realms.length > 0) {
      filtered = filtered.filter((area) => realms.includes(area.realm.guid));
    }
    const order = this.filterManager!.getFilterValues(FilterType.Order)[0];
    if (order) {
      filtered = this.sortAreas(filtered, order as OrderType);
    }
    return filtered;
  }

  private sortAreas(areas: IArea[], order: OrderType) {
    switch (order) {
      case OrderType.NameAsc:
        return areas.sort((a, b) => a.name.localeCompare(b.name));
      case OrderType.NameDesc:
        return areas.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return areas;
    }
  }
}
