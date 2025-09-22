import { ApplicationRoleConnectionMetadataType, Routes, type APIApplicationRoleConnectionMetadata } from "@discordjs/core";
import { REST } from "@discordjs/rest";

const data: APIApplicationRoleConnectionMetadata[] = [
  {
    type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
    name: "Max Wings",
    key: "wings",
    description: "Max wings must be greater than this",
  },
  {
    type: ApplicationRoleConnectionMetadataType.DatetimeGreaterThanOrEqual,
    name: "Sky Bday",
    key: "since",
    description: "Must be playing sky for at least this many days",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "CR/WLs Runner",
    key: "cr",
    description: "Must like to do CR/WLs Run",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "Eden Runner",
    key: "eden",
    description: "Must like to do Eden Run.",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "Hangout With Friends",
    key: "hangout",
    description: "Must like to hangout with friends",
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
