import { SchemaStore, Schema, t, type UnwrapSchemaEntries } from "@sapphire/string-store";

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
  .add(new Schema(CustomId.SkyGameLeaderboard).string("type").nullable("user", t.string));
