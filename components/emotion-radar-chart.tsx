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
  previous: {
    label: "Previous",
    color: "hsl(var(--chart-1))",
  },
  current: {
    label: "Current",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface EmotionRadarChartProps {
  data: { emotion: string, previous: number, current: number }[];
}

export function EmotionRadarChart(props: EmotionRadarChartProps) {
  const { data } = props;

  // console.log(data);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Emotion Radar Chart</CardTitle>
        <CardDescription>
          Showing emotions counted by category
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
              dataKey="previous"
              fill="var(--color-previous)"
              fillOpacity={0.6}
              stroke="var(--color-previous)"
              strokeWidth={2}
            />
            <Radar
              dataKey="current"
              fill="var(--color-current)"
              fillOpacity={0.6}
              stroke="var(--color-current)"
              strokeWidth={2}
            />
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
