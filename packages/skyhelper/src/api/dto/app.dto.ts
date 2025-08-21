import { ApiProperty } from "@nestjs/swagger";

export class GetShardsParamsDto {
  @ApiProperty({
    description: "Date in YYYY-MM-DD format",
    example: "2024-01-15",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  })
  date?: string;

  @ApiProperty({
    description: "Whether to exclude buttons from the embed",
    example: "false",
    enum: ["true", "false"],
  })
  noBtn?: "true" | "false";

  @ApiProperty({
    description: "User ID for personalized content",
    example: "123456789012345678",
  })
  user?: string;

  @ApiProperty({
    description: "Locale for language-specific content",
    example: "en-US",
  })
  locale?: string;
}

export class GetTimesParamsDto {
  @ApiProperty({
    description: "Locale for language-specific content",
    example: "en-US",
  })
  locale?: string;
}

export class EventDataDto {
  @ApiProperty({
    description: "Event name",
    example: "Days of Bloom",
  })
  name!: string;

  @ApiProperty({
    description: "Event start date in DD-MM-YYYY format",
    example: "15-01-2024",
    pattern: "^\\d{2}-\\d{2}-\\d{4}$",
  })
  startDate!: string;

  @ApiProperty({
    description: "Event end date in DD-MM-YYYY format",
    example: "29-01-2024",
    pattern: "^\\d{2}-\\d{2}-\\d{4}$",
  })
  endDate!: string;
}

export class TSDataDto {
  @ApiProperty({
    description: "Spirit identifier",
    example: "abyss-spirit",
  })
  spirit!: string;

  @ApiProperty({
    description: "Visit date in DD-MM-YYYY format",
    example: "15-01-2024",
    pattern: "^\\d{2}-\\d{2}-\\d{4}$",
  })
  visitDate!: string;

  @ApiProperty({
    description: "Index of the traveling spirit",
    example: "1",
  })
  index!: string;
}

export class DiscordEmbedDto {
  @ApiProperty({
    description: "Embed title",
    example: "Shard Information",
  })
  title?: string;

  @ApiProperty({
    description: "Embed description",
    example: "Today's shard information for Sky: Children of the Light",
  })
  description?: string;

  @ApiProperty({
    description: "Embed color in decimal format",
    example: 3447003,
  })
  color?: number;

  @ApiProperty({
    description: "Embed timestamp",
    example: "2024-01-15T10:30:00.000Z",
  })
  timestamp?: string;
}
