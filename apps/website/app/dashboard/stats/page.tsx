import { BotStats } from "@/hooks/useStats";
import { botRequest } from "@/lib/bot";
import ChartAreaInteractive from "./statspage";

export default async function page() {
  const stats = await botRequest<BotStats>("/stats");
  return <ChartAreaInteractive stats={stats} />;
}
