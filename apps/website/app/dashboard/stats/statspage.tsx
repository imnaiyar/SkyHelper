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
import { BotStats } from "@/hooks/useStats";

export const description = "An interactive area chart";

const chartConfig = {
  guilds: {
    label: "Total Servers",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const commandColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function ChartAreaInteractive({ stats }: { stats: BotStats }) {
  const [timeRange, setTimeRange] = React.useState("30d");

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

  // Process commands data to get top 5 commands
  const getTop5Commands = () => {
    const commandTotals = new Map<string, number>();
    stats.statistics.commands.forEach((cmd) => {
      const current = commandTotals.get(cmd.commandName) || 0;
      commandTotals.set(cmd.commandName, current + cmd.count);
    });
    return Array.from(commandTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  };

  const top5Commands = getTop5Commands();

  // Create command chart config dynamically
  const commandChartConfig = top5Commands.reduce(
    (config, cmd, index) => ({
      ...config,
      [cmd]: {
        label: cmd,
        color: commandColors[index] || "var(--chart-1)",
      },
    }),
    {} as ChartConfig,
  );

  // Aggregate commands data by date for the top 5 commands
  const commandsDataMap = new Map<string, Record<string, number>>();
  stats.statistics.commands.forEach((cmd) => {
    if (top5Commands.includes(cmd.commandName)) {
      const existing = commandsDataMap.get(cmd.date) || {};
      existing[cmd.commandName] = (existing[cmd.commandName] || 0) + cmd.count;
      commandsDataMap.set(cmd.date, existing);
    }
  });

  const commandsChartData = Array.from(commandsDataMap.entries())
    .map(([date, commands]) => ({
      date,
      ...commands,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((item) => {
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
    <div className="flex flex-col gap-4">
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
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Servers Statistics</CardTitle>
            <CardDescription>Showing server join statistics for the last 1 month</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillServer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-guilds)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-guilds)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => {
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

              <Area dataKey="guilds" type="natural" fill="url(#fillServer)" stroke="var(--color-guilds)" stackId="a" />
              <Area dataKey="join" type="natural" fill="transparent" stroke="transparent" strokeWidth={0} />
              <Area dataKey="leave" type="natural" fill="transparent" stroke="transparent" strokeWidth={0} />
              {/* @ts-expect-error idk how to fix this */}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Commands Statistics</CardTitle>
            <CardDescription>Showing top 5 most used commands</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={commandChartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={commandsChartData}>
              <defs>
                {top5Commands.map((cmd, index) => (
                  <linearGradient key={cmd} id={`fill${cmd}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={commandColors[index]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={commandColors[index]} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => {
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

              {top5Commands.map((cmd) => (
                <Area
                  key={cmd}
                  dataKey={cmd}
                  type="natural"
                  fill={`url(#fill${cmd})`}
                  stroke={`var(--color-${cmd})`}
                  stackId="a"
                />
              ))}
              {/* @ts-expect-error idk how to fix this */}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
