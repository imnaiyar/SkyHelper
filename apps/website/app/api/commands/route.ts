import { NextRequest, NextResponse } from "next/server";
import { Routes } from "discord-api-types/v10";

export async function GET() {
  const commands = await fetch(
    "https://discord.com/api/v10" + Routes.applicationCommands(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!),
    {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN!}`,
        "Content-Type": "application/json",
      },
    },
  ).then((d) => d.json());
  return NextResponse.json(commands);
}
