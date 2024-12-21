import { ApplicationRoleConnectionMetadataType, REST, Routes, type APIApplicationRoleConnectionMetadata } from "discord.js";

const data: APIApplicationRoleConnectionMetadata[] = [
  {
    type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
    name: "Max Wings",
    key: "wings",
    description: "Max amount of wings tht can be collected by you.",
  },
  {
    type: ApplicationRoleConnectionMetadataType.DatetimeGreaterThanOrEqual,
    name: "Sky Bday",
    key: "since",
    description: "Playing Sky Since.",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "CR/WLs Runner",
    key: "cr",
    description: "Likes to do CR/WLs Run.",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "Eden Runner",
    key: "eden",
    description: "Likes to do Eden Run.",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "Hangout With Friends",
    key: "hangout",
    description: "Likes to hangout with friends.",
  },
];

/** Register/update the role connection metadate */
export async function registerMetadata() {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  const d = await rest.put(Routes.applicationRoleConnectionMetadata(process.env.CLIENT_ID), {
    body: data,
  });

  console.log("Successfuly register connection metadata: ", d);
}

registerMetadata();
