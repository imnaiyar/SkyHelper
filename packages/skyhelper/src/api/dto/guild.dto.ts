import { ApiProperty } from "@nestjs/swagger";

export class GuildInfoDto {
  @ApiProperty({
    description: "Guild Discord ID",
    example: "123456789012345678",
  })
  id?: string;

  @ApiProperty({
    description: "Guild name",
    example: "Sky Helper Community",
  })
  name?: string;

  @ApiProperty({
    description: "Guild icon hash",
    example: "a1b2c3d4e5f6",
    nullable: true,
  })
  icon?: string | null;

  @ApiProperty({
    description: "Bot command prefix for the guild",
    example: "!",
  })
  prefix?: string;

  @ApiProperty({
    description: "Channel ID for announcements",
    example: "987654321098765432",
  })
  announcement_channel?: string;

  @ApiProperty({
    description: "Whether beta features are enabled",
    example: false,
  })
  beta?: boolean;

  @ApiProperty({
    description: "Guild language preference",
    example: "en-US",
  })
  language?: string;

  @ApiProperty({
    description: "List of enabled features",
    example: ["reminders", "live-updates"],
    enum: ["reminders", "live-updates"],
    isArray: true,
  })
  enabledFeatures?: Array<"reminders" | "live-updates">;
}

export class ChannelDto {
  @ApiProperty({
    description: "Discord channel ID",
    example: "123456789012345678",
  })
  id!: string;

  @ApiProperty({
    description: "Channel name",
    example: "general",
  })
  name!: string;

  @ApiProperty({
    description: "Channel type",
    example: 0,
  })
  type!: number;

  @ApiProperty({
    description: "Position of the channel in the channel list",
    example: 1,
  })
  position!: number;
}

export class RoleDto {
  @ApiProperty({
    description: "Discord role ID",
    example: "123456789012345678",
  })
  id!: string;

  @ApiProperty({
    description: "Role name",
    example: "Member",
  })
  name!: string;

  @ApiProperty({
    description: "Role color in hex",
    example: 0x99aab5,
  })
  color!: number;

  @ApiProperty({
    description: "Whether the role is hoisted",
    example: false,
  })
  hoist!: boolean;

  @ApiProperty({
    description: "Position of the role in the role hierarchy",
    example: 1,
  })
  position!: number;

  @ApiProperty({
    description: "Role permissions bitfield",
    example: "104324673",
  })
  permissions!: string;

  @ApiProperty({
    description: "Whether the role is managed by an integration",
    example: false,
  })
  managed!: boolean;

  @ApiProperty({
    description: "Whether the role is mentionable",
    example: true,
  })
  mentionable!: boolean;
}
