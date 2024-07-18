"use client"

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { time: "2024-07-18T07:10", viewers: 5459, chatters: 22, engagement: 4.0300421322586555 },
  { time: "2024-07-18T07:11", viewers: 5459, chatters: 41, engagement: 7.510533064663858 },
  { time: "2024-07-18T07:12", viewers: 5459, chatters: 89, engagement: 16.30335226231911 },
  { time: "2024-07-18T07:13", viewers: 5459, chatters: 66, engagement: 12.090126396775966 },
  { time: "2024-07-18T07:14", viewers: 5459, chatters: 57, engagement: 10.441472797215608 },
  { time: "2024-07-18T07:15", viewers: 5459, chatters: 44, engagement: 8.060084264517311 },
  { time: "2024-07-18T07:16", viewers: 5459, chatters: 42, engagement: 7.693716797948342 },
  { time: "2024-07-18T07:17", viewers: 5459, chatters: 91, engagement: 16.669719728888076 },
  { time: "2024-07-18T07:18", viewers: 5459, chatters: 86, engagement: 15.753801062465651 },
  { time: "2024-07-18T07:19", viewers: 5459, chatters: 52, engagement: 9.525554130793186 },
];

// Define chart configuration for each data key
const chartConfig = {
  viewers: { label: "Viewers", color: "#FFD700" },
  totalChatters: { label: "Chatters", color: "#1E90FF" },
  engagement: { label: "Engagement", color: "#FF4500" },
} satisfies ChartConfig;

// Define interface for the props of EngagementLineChart component
interface EngagementLineChartProps {
  data: {
    time: string;
    viewers: number;
    chatters: { [user: string]: number };
    totalChatters: number;
    engagement: number;
    sortedChatters: { user: string; messages: number }[];
  }[];
}

export function EngagementLineChart(props: EngagementLineChartProps) {
  const { data } = props;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Engagement Time Segments</CardTitle>
          <CardDescription>
            Showing engagement metrics over time
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF0000">
                  <animate attributeName="offset" values="0;1" dur="1s" repeatCount="indefinite" />
                </stop>
                <stop offset="16.67%" stopColor="#FF7F00">
                  <animate attributeName="offset" values="0.1667;1.1667" dur="1s" repeatCount="indefinite" />
                </stop>
                <stop offset="33.33%" stopColor="#FFFF00">
                  <animate attributeName="offset" values="0.3333;1.3333" dur="1s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#00FF00">
                  <animate attributeName="offset" values="0.5;1.5" dur="1s" repeatCount="indefinite" />
                </stop>
                <stop offset="66.67%" stopColor="#0000FF">
                  <animate attributeName="offset" values="0.6667;1.6667" dur="1s" repeatCount="indefinite" />
                </stop>
                <stop offset="83.33%" stopColor="#4B0082">
                  <animate attributeName="offset" values="0.8333;1.8333" dur="1s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#9400D3">
                  <animate attributeName="offset" values="1;2" dur="1s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(-5)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="engagement"
              type="monotone"
              stroke="url(#animatedGradient)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
