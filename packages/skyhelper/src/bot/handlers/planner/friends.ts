import { SpiritTreeHelper, type ISkyData, type ISpiritTree } from "skygame-data";
import { BasePlannerHandler } from "./base.js";
import { DisplayTabs, FilterType, OrderType, PlannerAction, type NavigationState } from "@/types/planner";
import type { UserSchema } from "@/types/schemas";
import type { SkyHelper } from "@/structures";
import {
  button,
  container,
  createEmojiProgressBar,
  mediaGallery,
  mediaGalleryItem,
  row,
  section,
  separator,
  textDisplay,
} from "@skyhelperbot/utils";
import { createActionId, FriendsTreeGuid, PlannerDataService, spiritTreeDisplay } from "./index.js";
import { getNodeProgress } from "./helpers/tree.progress.js";
import type { ResponseData } from "@/utils/classes/InteractionUtil";

export interface IPlannerFriend {
  guid: string;
  date: string;
  name: string;
  unlocked: string;
}
export class FriendsDisplay extends BasePlannerHandler {
  private friends: IPlannerFriend[] = [];
  constructor(data: ISkyData, state: NavigationState, settings: UserSchema, client: SkyHelper) {
    super(data, state, settings, client);
    this.friends = settings.plannerData?.keys.friends?.friends ?? [];

    this.initializeFilters([FilterType.Order], { [FilterType.Order]: { defaultValues: [OrderType.NameDesc] } });
    this.sortFriends();
  }

  override handle() {
    if (this.state.it) {
      const friend = this.friends.find((f) => f.guid === this.state.it);
      if (!friend) throw new Error("Unknown friend: " + this.state.it);
      return this.friendDisplay(friend);
    }
    return {
      components: [
        container(
          textDisplay("# Friends", this.createFilterIndicator() ?? ""),
          row(this.createFilterButton(), button({ custom_id: this.getAction("", "add"), label: "Add Friend", style: 3 })),
          separator(),
          ...(this.friends.length ? this.friendsList() : [textDisplay("No friends added yet.")]),
        ),
      ],
    };
  }

  private friendsList() {
    return this.displayPaginatedList({
      items: this.friends,
      page: this.state.p ?? 1,
      perpage: 7,
      itemCallback: (item) => {
        const friendTree = FriendsDisplay.treeUnlocked(item, this.data);
        const progress = getNodeProgress(SpiritTreeHelper.getNodes(friendTree), false);
        return [section(this.viewbtn(this.createCustomId({ it: item.guid })), `### ${item.name}`, `Unlocked: ${progress}`)];
      },
    });
  }

  private async friendDisplay(friend: IPlannerFriend): Promise<ResponseData> {
    const friendTree = FriendsDisplay.treeUnlocked(friend, this.data);
    const progress = getNodeProgress(SpiritTreeHelper.getNodes(friendTree), true);
    const tree = await spiritTreeDisplay(
      { tree: friendTree, planner: this, spiritView: false, friendGuid: friend.guid },
      { spiritName: friend.name },
    );

    return {
      files: [tree.file],
      components: [
        container(
          textDisplay(`# ${friend.name}`, progress ?? ""),
          row(
            button({
              custom_id: this.getAction(friend.guid, "edit"),
              label: "Edit Name",
            }),
            button({
              custom_id: this.getAction(friend.guid, "delete"),
              label: "Delete",
              style: 4,
            }),
            this.backbtn(this.createCustomId({ t: DisplayTabs.Friends, it: null })),
          ),
          separator(),
          ...tree.components,
        ),
      ],
    };
  }

  private sortFriends() {
    const order = (this.filterManager?.getFilterValues(FilterType.Order)[0] ?? OrderType.NameDesc) as OrderType;
    switch (order) {
      case OrderType.NameAsc:
        this.friends.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case OrderType.NameDesc:
        this.friends.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case OrderType.DateAsc:
      case OrderType.DateDesc:
        this.friends.sort((a, b) => {
          const aDate = new Date(a.date).getTime();
          const bDate = new Date(b.date).getTime();
          return order === OrderType.DateAsc ? aDate - bDate : bDate - aDate;
        });
    }
  }
  private getAction(guid: string, type: string) {
    return createActionId({
      action: PlannerAction.Friends,
      guid,
      actionType: type,
      navState: this.state,
    });
  }
  static treeUnlocked(friend: IPlannerFriend, data: ISkyData): ISpiritTree {
    const tree = PlannerDataService.deepClone(data.guids.get(FriendsTreeGuid)) as ISpiritTree;
    const unlocked = friend.unlocked.match(/.{1,3}/g)?.map((s) => parseInt(s, 36)) ?? [];
    const nodes = SpiritTreeHelper.getNodes(tree);

    for (const node of nodes) {
      if (!unlocked.includes(node.item?.id ?? -1)) continue;
      node.unlocked = true;
      node.item!.unlocked = true;
    }
    return tree;
  }
}
