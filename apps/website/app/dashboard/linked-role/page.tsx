import { getRoleConnections } from "@/lib/discord";
import LinkedRolePage from "./LinkedRolePage";
export default async function page() {
  const data = await getRoleConnections();
  return <LinkedRolePage connections={data} />;
}
