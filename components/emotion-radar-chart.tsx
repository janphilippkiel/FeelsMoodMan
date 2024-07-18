"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
  current: {
    label: "Current",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface EmotionRadarChartProps {
  data: { emotion: string, total: number, current: number }[];
}

export function EmotionRadarChart(props: EmotionRadarChartProps) {
  const { data } = props;

  // console.log(data);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Emotion Data</CardTitle>
          <CardDescription>
            Collecting six basic emotions from the current minute
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto max-h-[250px]"
        >
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="emotion" />
            <PolarGrid />
            {/* <Radar
              dataKey="total"
              fill="var(--color-total)"
              fillOpacity={0.6}
              stroke="var(--color-total)"
              strokeWidth={2}
            /> */}
            <Radar
              dataKey="current"
              fill="#ccc"
              fillOpacity={(new Date().getSeconds() / 60)}
              stroke="hsl(var(--card-foreground))"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
