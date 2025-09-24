import { useEffect, useState } from "react";
interface BotStats {
  totalServers: number;
  totalMembers: number;
  ping: number;
  commands: number;
  totalUserInstalls: number;
}
export default function () {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<BotStats | null>(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetch(process.env.NEXT_PUBLIC_API_URL! + "/stats").then((r) => r.json());
        setStats(data as BotStats);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { loading, stats, error };
}
