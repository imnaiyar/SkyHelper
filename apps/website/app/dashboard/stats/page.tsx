"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useStats from "@/app/hooks/useStats";
import Loading from "@components/ui/Loading";

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  leave: {
    label: "Leave",
    color: "var(--chart-1)",
  },
  join: {
    label: "Join",
    color: "var(--chart-2)",
  },
  guilds: {
    label: "Servers",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("30d");
  const { loading, stats } = useStats();

  if (loading || !stats) return <Loading />;
  const leaveStats = stats.statistics.guildEvents;
  const filteredData = leaveStats.filter((item) => {
    const date = new Date(item.date);
    let daysToSubtract = 30;
    if (timeRange === "15d") {
      daysToSubtract = 15;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });
  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>Showing total visitors for the last 3 months</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="15d" className="rounded-lg">
              Last 15 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillJoin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-join)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-join)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillLeave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-leave)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-leave)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dashed"
                />
              }
            />
            <Area dataKey="join" type="natural" fill="url(#fillJoin)" stroke="var(--color-join)" stackId="a" />
            <Area dataKey="leave" type="natural" fill="url(#fillLeave)" stroke="var(--color-leave)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
