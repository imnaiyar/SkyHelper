import { useEffect, useState } from "react";
interface BotStats {
  totalServers: number;
  totalMembers: number;
  ping: number;
  commands: number;
  totalUserInstalls: number;
  statistics: {
    commands: Array<{ date: string; commandName: string; count: number }>;
    guildEvents: Array<{ date: string; join: number; leave: number; guilds: number }>;
  };
}
export default function useStats() {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<BotStats | null>(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetch(process.env.NEXT_PUBLIC_API_URL! + "/stats").then((r) => r.json());
        setStats(data as BotStats);
        setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { loading, stats, error };
}
