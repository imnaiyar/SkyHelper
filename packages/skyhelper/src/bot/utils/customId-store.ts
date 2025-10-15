import { SchemaStore, Schema, t } from "@sapphire/string-store";

export enum CustomId {
  CandleButton,
  QuestVideo,
  SpiritCollectible,
  SpiritExpression,
  BugReports,
  CalendarDate,
  CalenderNav,
  ShardsScroll,
  TimesRefresh,
  ShardsTimeline,
  SkyGamePlaySingle,
  SkyGameEndGame,
  ShardsTimelineLeft,
  ShardsTimelineRight,
  TimesDetailsRow,
  RealmsBaseNav,
  SeasonalQuestSelect,
  SeasonalQuestNav,
  SeasonalSpiritRow,
  /**
   * This is mostly used where components is only handled by collectors, passing arbitrary data
   */
  Default,
  SkyHagman,
  SkyGameLeaderboard,
  ShardsRemindersDetails,
  RemindersManage,
  SpiritButton,
  PlannerTopLevelNav,
  PlannerFilters,
  PlannerSelectNav,
  PlannerActions,
}

export const store = new SchemaStore()
  .add(new Schema(CustomId.CandleButton).string("type").string("date").nullable("user", t.string))
  .add(new Schema(CustomId.QuestVideo).uint4("index").string("date").nullable("user", t.string))
  .add(new Schema(CustomId.SpiritCollectible).string("spirit").nullable("user", t.string))
  .add(new Schema(CustomId.SpiritExpression).string("spirit").nullable("user", t.string))
  .add(new Schema(CustomId.BugReports).string("error").nullable("user", t.string))
  .add(new Schema(CustomId.CalendarDate).uint4("month").uint32("year").nullable("user", t.string))
  .add(new Schema(CustomId.CalenderNav).uint4("month").uint32("year").uint4("index").nullable("user", t.string))
  .add(new Schema(CustomId.ShardsScroll).string("date").nullable("user", t.string))
  .add(new Schema(CustomId.TimesRefresh).nullable("user", t.string))
  .add(new Schema(CustomId.ShardsTimeline).string("date").nullable("user", t.string))
  .add(new Schema(CustomId.SkyGamePlaySingle).nullable("user", t.string))
  .add(new Schema(CustomId.SkyGameEndGame).nullable("user", t.string))
  .add(new Schema(CustomId.ShardsTimelineLeft).nullable("user", t.string))
  .add(new Schema(CustomId.ShardsTimelineRight).nullable("user", t.string))
  .add(new Schema(CustomId.TimesDetailsRow).nullable("user", t.string))
  .add(new Schema(CustomId.RealmsBaseNav).string("user").string("type"))
  .add(new Schema(CustomId.SeasonalQuestSelect).nullable("user", t.string))
  .add(new Schema(CustomId.SeasonalQuestNav).uint4("page").nullable("user", t.string))
  .add(new Schema(CustomId.SeasonalSpiritRow).nullable("user", t.string))
  .add(new Schema(CustomId.Default).nullable("user", t.string).nullable("data", t.string))
  .add(new Schema(CustomId.SkyHagman).string("action").nullable("user", t.string))
  .add(new Schema(CustomId.SkyGameLeaderboard).string("type").nullable("user", t.string))
  .add(new Schema(CustomId.ShardsRemindersDetails).string("date").nullable("user", t.string))
  .add(new Schema(CustomId.RemindersManage).string("key").uint8("page").string("user"))
  .add(new Schema(CustomId.SpiritButton).string("spirit_key").nullable("user", t.string))
  .add(
    new Schema(CustomId.PlannerTopLevelNav)
      // tab
      .string("t")
      // filter
      .nullable("f", t.string)
      // item
      .nullable("it", t.string)
      // data
      .nullable("d", t.string)
      // page
      .nullable("p", t.uint8)
      // random number or arbitrary data, for any use
      .nullable("i", t.string)
      // previous state for back button
      .nullable("back", t.string)
      // random nonce to ensure uniqueness
      .nullable("r", t.string)
      .nullable("user", t.string),
  )
  .add(new Schema(CustomId.PlannerFilters).string("tab").array("filters", t.string).nullable("user", t.string))

  .add(new Schema(CustomId.PlannerSelectNav).nullable("user", t.string))
  .add(
    new Schema(CustomId.PlannerActions)
      // action type: toggle-item, toggle-node, toggle-iap, etc.
      .string("action")

      .nullable("actionType", t.string)
      // guid of the entity to act on
      .string("guid")
      // serialized navigation state to refresh after action
      .string("navState")
      .nullable("user", t.string),
  );
