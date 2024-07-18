"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { time: "2024-07-17T19:39", joy: 8, anger: 0, sadness: 2, fear: 0, disgust: 3, surprise: 9, neutral: 96 },
  { time: "2024-07-17T19:40", joy: 13, anger: 0, sadness: 2, fear: 0, disgust: 1, surprise: 3, neutral: 152 },
  { time: "2024-07-17T19:41", joy: 11, anger: 4, sadness: 10, fear: 22, disgust: 9, surprise: 14, neutral: 171 },
  { time: "2024-07-17T19:42", joy: 12, anger: 5, sadness: 11, fear: 0, disgust: 13, surprise: 17, neutral: 99 },
  { time: "2024-07-17T19:43", joy: 2, anger: 0, sadness: 3, fear: 0, disgust: 0, surprise: 2, neutral: 13 }
]

const chartConfig = {
  joy: { label: "Joy 😀", color: "#FFD700" },
  anger: { label: "Anger 🤬", color: "#FF4500" },
  sadness: { label: "Sadness 😭", color: "#1E90FF" },
  fear: { label: "Fear 😨", color: "#8A2BE2" },
  disgust: { label: "Disgust 🤢", color: "#32CD32" },
  surprise: { label: "Surprise 😲", color: "#FF69B4" },
} satisfies ChartConfig

interface EmotionLineChartProps {
  data: { time: string, joy: number, anger: number, sadness: number, fear: number, disgust: number, surprise: number, neutral: number }[];
}

export function EmotionLineChart(props: EmotionLineChartProps) {
  const { data } = props;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Emotion Time Segments</CardTitle>
          <CardDescription>
            Showing emotion data for every minute the client was running
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
              dataKey="joy"
              type="monotone"
              stroke="var(--color-joy)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="anger"
              type="monotone"
              stroke="var(--color-anger)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="sadness"
              type="monotone"
              stroke="var(--color-sadness)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="fear"
              type="monotone"
              stroke="var(--color-fear)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="disgust"
              type="monotone"
              stroke="var(--color-disgust)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="surprise"
              type="monotone"
              stroke="var(--color-surprise)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
