import { ApiProperty } from "@nestjs/swagger";

export class ReminderFeatureBaseDto {
  @ApiProperty({
    description: "Whether the reminder is active",
    example: true,
  })
  active!: boolean;

  @ApiProperty({
    description: "Discord channel ID where reminders will be sent",
    example: "123456789012345678",
    nullable: true,
  })
  channelId!: string | null;

  @ApiProperty({
    description: "Discord role ID to mention in reminders",
    example: "987654321098765432",
    nullable: true,
  })
  role!: string | null;

  @ApiProperty({
    description: "Offset in minutes before the event (1-15)",
    example: 5,
    minimum: 1,
    maximum: 15,
    nullable: true,
  })
  offset!: number | null;
}

export class ShardsEruptionReminderDto extends ReminderFeatureBaseDto {
  @ApiProperty({
    description: "Types of shards to remind about",
    example: ["black", "red"],
    enum: ["red", "black"],
    isArray: true,
    nullable: true,
  })
  shard_type!: Array<"red" | "black"> | null;
}

export class ReminderFeatureDto {
  @ApiProperty({
    description: "Eden reminder settings",
    type: ReminderFeatureBaseDto,
  })
  eden!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Daily quests reminder settings",
    type: ReminderFeatureBaseDto,
  })
  dailies!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Grandma reminder settings",
    type: ReminderFeatureBaseDto,
  })
  grandma!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Turtle reminder settings",
    type: ReminderFeatureBaseDto,
  })
  turtle!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Geyser reminder settings",
    type: ReminderFeatureBaseDto,
  })
  geyser!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Daily reset reminder settings",
    type: ReminderFeatureBaseDto,
  })
  reset!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Aurora reminder settings",
    type: ReminderFeatureBaseDto,
  })
  aurora!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Traveling Spirit reminder settings",
    type: ReminderFeatureBaseDto,
  })
  ts!: ReminderFeatureBaseDto;

  @ApiProperty({
    description: "Shards eruption reminder settings",
    type: ShardsEruptionReminderDto,
  })
  "shards-eruption"!: ShardsEruptionReminderDto;

  @ApiProperty({
    description: "Fireworks festival reminder settings",
    type: ReminderFeatureBaseDto,
  })
  "fireworks-festival"!: ReminderFeatureBaseDto;
}

export class LiveUpdatesDto {
  @ApiProperty({
    description: "Channel ID for shard updates",
    example: "123456789012345678",
    nullable: true,
  })
  shards!: string | null;

  @ApiProperty({
    description: "Channel ID for event times updates",
    example: "123456789012345678",
    nullable: true,
  })
  times!: string | null;
}

export class FeaturesDto {
  @ApiProperty({
    description: "Live updates feature settings",
    type: LiveUpdatesDto,
  })
  "live-updates"!: LiveUpdatesDto;

  @ApiProperty({
    description: "Reminders feature settings",
    type: ReminderFeatureDto,
  })
  reminders!: ReminderFeatureDto;
}
