import { getRoleConnections } from "@/app/lib/discord";
import LinkedRolePage from "./LinkedRolePage";
export default async function page() {
  const data = await getRoleConnections();
  return <LinkedRolePage connections={data} />;
}
