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
  baseline: {
    label: "Baseline",
    color: "hsl(var(--chart-1))",
  },
  current: {
    label: "Current Stream",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface EmotionRadarChartProps {
  data: { emotion: string, baseline: number, current: number }[];
}

export function EmotionRadarChart(props: EmotionRadarChartProps) {
  const { data } = props;

  console.log(data);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Radar Chart - Legend</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto  max-h-[250px]"
        >
          <RadarChart
            data={data}
            margin={{
              top: -40,
              bottom: -10,
            }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="emotion" />
            <PolarGrid />
            <Radar
              dataKey="baseline"
              fill="var(--color-baseline)"
              fillOpacity={0.6}
            />
            <Radar dataKey="current" fill="var(--color-current)" />
            <ChartLegend className="mt-8" content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          January - June 2024
        </div>
      </CardFooter>
    </Card>
  )
}
