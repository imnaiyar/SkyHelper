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
  .add(new Schema(CustomId.SkyGameEndGame).string("user"))
  .add(new Schema(CustomId.ShardsTimelineLeft).nullable("user", t.string))
  .add(new Schema(CustomId.ShardsTimelineRight).nullable("user", t.string));
