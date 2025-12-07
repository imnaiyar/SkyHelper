"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/app/hooks/auth";
import { makeRequest } from "@/app/hooks/discord";
import Loading from "@components/ui/Loading";
import PlannerBreakdownView from "./components/PlannerBreakdownView";
import type { PlannerBreakdownData } from "./types";

export default function PlannerBreakdownPage() {
  const { session } = useSession();
  const [data, setData] = useState<PlannerBreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    async function fetchBreakdown() {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const response = await makeRequest<PlannerBreakdownData>(`${apiUrl}/users/${session.user.id}/planner/breakdown`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to load breakdown data");
      } finally {
        setLoading(false);
      }
    }

    fetchBreakdown();
  }, [session]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" variant="bot" />
      </div>
    );
  }

  //   if (!session?.user) {
  //     return (
  //       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
  //         <div className="text-red-400 text-xl mb-2">🔒 Authentication Required</div>
  //         <div className="text-slate-300">Please log in to view your planner breakdown.</div>
  //       </div>
  //     );
  //   }
  //
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-red-400 text-xl mb-2">⚠️ Error Loading Data</div>
        <div className="text-slate-300">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-slate-300 text-xl mb-2">📊 No Data Available</div>
        <div className="text-slate-400">
          No planner data found. Start using the planner in Discord to see your breakdown here!
        </div>
      </div>
    );
  }

  return <PlannerBreakdownView data={data} />;
}
