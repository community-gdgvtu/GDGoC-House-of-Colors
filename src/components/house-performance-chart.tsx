
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { type House } from "@/lib/data";

export function HousePerformanceChart({ houses }: { houses: House[] }) {
    const housePoints = houses.map(h => ({
        house: h.name,
        points: h.points >= 0 ? h.points : 0,
        fill: h.color,
    }));

    const chartConfig: ChartConfig = {
        points: {
          label: "Points",
        },
        ...housePoints.reduce((acc, cur) => {
          acc[cur.house] = { label: cur.house, color: cur.fill };
          return acc;
        }, {} as ChartConfig)
    };
    
    return (
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>House Performance</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
                data={housePoints}
                layout="vertical"
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                accessibilityLayer
            >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="house"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                    width={90}
                />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                />
                <Bar dataKey="points" radius={8}>
                {housePoints.map((entry) => (
                    <Cell key={entry.house} fill={entry.fill} />
                ))}
                </Bar>
            </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
    )
}
