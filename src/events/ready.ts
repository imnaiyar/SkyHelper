import { type SkyHelper } from "#structures";

/* eslint-disablespace-before-function-paren*/
export default function Ready(client: SkyHelper) {
  console.log(`Logged in as ${client.user.username}`);
}
