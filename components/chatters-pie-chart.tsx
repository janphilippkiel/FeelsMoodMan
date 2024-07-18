import * as React from "react";
import { Pie, PieChart, Label, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChattersPieChartProps {
  data: {
    time: string;
    viewers: number;
    chatters: { [user: string]: number };
    totalChatters: number;
    engagement: number;
    sortedChatters: { user: string; messages: number }[];
  }[];
}

// Define a type for the chart configuration
type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export function ChattersPieChart(props: ChattersPieChartProps) {
  const { data } = props;

  // Check if data is empty or undefined
  if (!data || data.length === 0) {
    return;
  }

  // Assuming the last element in data is the latest segment
  const latestSegment = data[data.length - 1];

  // Check if sortedChatters is defined for the latest segment
  if (!latestSegment.sortedChatters) {
    return;
  }

  // Get top 10 chatters based on message count from the latest segment
  const topChatters = latestSegment.sortedChatters.slice(0, 10);

  // Total chatters for the current segment (latest segment)
  const totalChatters = latestSegment.totalChatters;

  // Dynamic chart configuration based on top 10 chatters
  const COLORS = topChatters.map((chatter, index) => `hsl(${index * (360 / 10)}, 70%, 50%)`);

  // Create chartConfig for ChartContainer
  const chartConfig: ChartConfig = topChatters.reduce((config: ChartConfig, chatter, index) => {
    const color = COLORS[index % COLORS.length];
    config[chatter.user] = {
      label: chatter.user,
      color: color,
    };
    return config;
  }, {});

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Chatters</CardTitle>
          <CardDescription>
            Chatters with the most messages in the current minute
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={topChatters}
              dataKey="messages"
              nameKey="user"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
              paddingAngle={2}
            >
              {topChatters.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalChatters.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Chatters
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
