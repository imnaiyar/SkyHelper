import { ApplicationRoleConnectionMetadataType, REST, Routes, type APIApplicationRoleConnectionMetadata } from "discord.js";
import { version } from "os";

const data: APIApplicationRoleConnectionMetadata[] = [
  {
    type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
    name: "Wings",
    key: "wings",
    description: "Hmmm",
  },
  {
    type: ApplicationRoleConnectionMetadataType.DatetimeGreaterThanOrEqual,
    name: "Playing Since",
    key: "since",
    description: "Hmmm",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "CR Runner",
    key: "cr",
    description: "Hmmm",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "WLs Runner",
    key: "wls",
    description: "Hmmm",
  },
  {
    type: ApplicationRoleConnectionMetadataType.BooleanEqual,
    name: "Beuty Queen",
    key: "beuty",
    description: "Hmmm",
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
