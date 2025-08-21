import { ApiProperty } from "@nestjs/swagger";

export class BotStatsDto {
  @ApiProperty({
    description: "Total number of servers the bot is in",
    example: 150,
  })
  totalServers!: number;

  @ApiProperty({
    description: "Total number of members across all servers",
    example: 50000,
  })
  totalMembers!: number;

  @ApiProperty({
    description: "Bot latency in milliseconds",
    example: 45,
  })
  ping!: number;

  @ApiProperty({
    description: "Total number of commands available",
    example: 25,
  })
  commands!: number;

  @ApiProperty({
    description: "Total number of user installations",
    example: 1000,
  })
  totalUserInstalls!: number;
}

export class SpiritDataDto {
  @ApiProperty({
    description: "Display name of the spirit",
    example: "Abyss Spirit",
  })
  name!: string;

  @ApiProperty({
    description: "Internal value/identifier for the spirit",
    example: "abyss-spirit",
  })
  value!: string;

  @ApiProperty({
    description: "URL to the spirit icon image",
    example: "https://cdn.discordapp.com/emojis/1206501060303130664.png",
  })
  icon?: string;
}

export class UserInfoDto {
  @ApiProperty({
    description: "User preferred language",
    example: "en-US",
  })
  language?: string;
}
