import { createDtoFromZod as createZodDto } from "./createDto.js";
import {
  ReminderFeatureSchema,
  GuildInfoSchema,
  FeaturesSchema,
  SpiritSchema,
  EventDataSchema,
  TSDataSchema,
  GetShardsParams,
  GetTimesParams,
} from "./types.js";

export class ReminderFeatureDto extends createZodDto(ReminderFeatureSchema) {}
export class GuildInfoDto extends createZodDto(GuildInfoSchema) {}
export class FeaturesDto extends createZodDto(FeaturesSchema) {}
export class SpiritDto extends createZodDto(SpiritSchema) {}
export class EventDataDto extends createZodDto(EventDataSchema) {}
export class TSDataDto extends createZodDto(TSDataSchema) {}
export class GetShardsParamsDto extends createZodDto(GetShardsParams) {}
export class GetTimesParamsDto extends createZodDto(GetTimesParams) {}
