import { useEffect, useState } from "react";
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
