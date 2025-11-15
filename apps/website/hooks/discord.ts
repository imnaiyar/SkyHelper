import { useEffect, useState } from "react";
import { useSession } from "./auth";
import { useQuery } from "@tanstack/react-query";
import { APIGuild, Routes } from "discord-api-types/v10";
export default function useFetchHook<T>(route: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetch(route).then((r) => r.json());
        setData(data as T);
        setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, [route]);
  return { loading, data, error };
}

export async function makeRequest<T>(route: string, options?: RequestInit) {
  const req = await fetch(route, { ...options, credentials: "include" });
  if (!req.ok) {
    throw { error: req.statusText, status: req.status };
  }
  return req.json() as Promise<T>;
}
export function useGuildsQuery() {
  const { session } = useSession();
  return useQuery<APIGuild[]>({
    queryKey: ["guilds"],
    queryFn: () =>
      makeRequest(`https://discord.com/api/v10` + Routes.userGuilds() + "?with_counts=true", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      }),
    enabled: !!session?.access_token,
  });
}
