import { container, section, textDisplay } from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { ComponentType } from "discord-api-types/v10";
import { CustomId, store } from "@/utils/customId-store";

export class RealmsDisplay extends BasePlannerHandler {
  override handle() {
    return { components: [this.realmslist()] };
  }
  realmslist() {
    const realms = this.data.realms;
    return container(
      this.createTopCategoryRow(DisplayTabs.Realms, this.state.user),
      textDisplay(`# Realms (${realms.length})`),
      ...this.displayPaginatedList({
        items: realms,
        user: this.state.user,
        tab: this.state.tab,
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
            `${realm.areas?.length || 0} Areas • ${this.planner.getSpiritsInRealm(realm.guid, this.data).length} Spirits • ${this.planner.getWingedLightsInRealm(realm.guid, this.data).length} Winged Light`,
          ),
        ],
      }),
    );
  }
}
