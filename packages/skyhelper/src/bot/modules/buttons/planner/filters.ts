import { type DisplayTabs, type NavigationState, FilterType } from "@/types/planner";
import { defineButton } from "@/structures";
import Utils from "@/utils/classes/Utils";
import { CustomId } from "@/utils/customId-store";
import { type APILabelComponent, ComponentType, type APITextDisplayComponent } from "@discordjs/core";
import { textDisplay } from "@skyhelperbot/utils";
import { fetchSkyData, handlePlannerNavigation } from "@/planner";
import { FilterManager } from "@/planner/filter.manager";

export default defineButton({
  data: { name: "filter" },
  id: CustomId.PlannerFilters,
  async execute(_interaction, _t, helper, props) {
    const { tab, filters } = props;
    const data = await fetchSkyData(helper.client);

    const filterManager = new FilterManager(data);

    const supportedFilters: FilterType[] = [];
    const filterDefaults: Record<string, string[]> = {};

    for (const filter of filters) {
      const [key, defaults] = filter.split(":");
      const filterType = key as FilterType;

      if (Object.values(FilterType).includes(filterType)) {
        supportedFilters.push(filterType);
        if (defaults) {
          filterDefaults[key!] = defaults.split(",");
        }
      }
    }
    const custom = FilterManager.tabsCustomConfig(data, tab as DisplayTabs, filters);

    const filterConfigs = FilterManager.getFilterConfigs(supportedFilters, data, custom);

    const components: Array<APILabelComponent | APITextDisplayComponent> = [];

    components.push(
      textDisplay(
        "Please select the filters you'd like to apply. You can select multiple options in each filter. If you leave out a filter, all options may be selected by default.\n**Note: Due to certain limitations, only three of the each filter type can be selected at a time**",
      ),
    );

    // Add filter components
    for (const config of filterConfigs) {
      const currentValues = filterManager.getFilterValues(config.type);
      const defaultValues = filterDefaults[config.type] ?? currentValues;

      components.push({
        type: ComponentType.Label,
        label: config.label,
        description: config.description ?? `Filter by ${config.label}`,
        component: {
          type: ComponentType.StringSelect,
          custom_id: config.type,
          options: config.options.map((option) => ({
            ...option,
            default: defaultValues.includes(option.value),
          })),
          min_values: config.required ? 1 : 0,
          max_values: config.max ? config.options.length : config.multiSelect ? 3 : 1, // keep it 3 to limit data size
          required: false,
        },
      });
    }

    if (components.length > 5) {
      throw new Error(`Too many filter components (${components.length}). Maximum is 5 including the instruction text.`);
    }

    await helper.launchModal({
      title: `${Utils.capitalize(tab)} Filters`,
      custom_id: "filter_submission" + _interaction.id,
      components,
    });

    const modalSubmission = await helper.client
      .awaitModal({
        filter: (i) => i.data.custom_id === "filter_submission" + _interaction.id,
        timeout: 3 * 60_000,
      })
      .catch(() => null);

    if (!modalSubmission) return;
    await helper.client.api.interactions.deferMessageUpdate(modalSubmission.id, modalSubmission.token);

    // Process the submitted filter values
    const newFilterManager = new FilterManager(data);

    for (const config of filterConfigs) {
      const comp = Utils.getModalComponent(modalSubmission, config.type, ComponentType.StringSelect);
      if (comp?.values) newFilterManager.setFilterValues(comp.custom_id as FilterType, comp.values);
    }

    const newFilterString = newFilterManager.serializeFilters();
    const state = Utils.parseCustomId(tab) as unknown as NavigationState;
    const comps = await handlePlannerNavigation(
      {
        ...state,
        // eslint-disable-next-line
        f: newFilterString || undefined,
        p: 1, // Reset to first page when filters change
      },
      helper.user,
      helper.client,
    );

    await helper.api.interactions.editReply(modalSubmission.application_id, modalSubmission.token, comps);
  },
});
