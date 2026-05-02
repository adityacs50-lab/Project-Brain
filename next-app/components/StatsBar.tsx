import useSWR from "swr";
import { fetcher, getRules, getContradictions } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function StatsBar({ workspaceId }: { workspaceId: string }) {
  const { data: rules, isValidating } = useSWR(getRules(workspaceId), fetcher, { refreshInterval: 30000 });
  const { data: contradictions } = useSWR(getContradictions(workspaceId), fetcher, { refreshInterval: 30000 });
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    if (!isValidating) {
      setLastUpdated(Date.now());
    }
  }, [isValidating, rules, contradictions]);

  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const totalActive = rules?.filter((r: {status: string}) => r.status === "active").length || 0;
  const pendingReview = rules?.filter((r: {status: string}) => r.status === "pending").length || 0;
  const totalContradictions = contradictions?.length || 0;

  return (
    <div className="flex flex-col mb-8">
      <div className="flex justify-end text-xs text-muted-foreground mb-2">
        Last updated: {secondsAgo} seconds ago
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contradictions Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContradictions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
