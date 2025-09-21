"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import type { Score, ScoreHistoryItem } from "@/lib/types";

interface ScoreCardProps {
  scores: Score;
  history: ScoreHistoryItem[];
}

const chartConfig = {
  calm: {
    label: "Calm",
    color: "hsl(var(--chart-1))",
  },
  productivity: {
    label: "Productivity",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function ScoreCard({ scores, history }: ScoreCardProps) {
  const chartData = history.length > 0 ? history : [{ date: 'Start', calmIndex: 0, productivityIndex: 0 }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Scores</CardTitle>
        <CardDescription>
          Here is a summary of your mental state based on your latest check-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-center">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-3xl sm:text-4xl font-bold font-headline text-primary">
              {scores.calmIndex}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Calm Index</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-3xl sm:text-4xl font-bold font-headline text-accent">
              {scores.productivityIndex}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Productivity Index</p>
          </div>
        </div>
        
        {/* Chart - Responsive height */}
        <div className="h-[180px] sm:h-[200px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      fontSize={12}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line 
                      dataKey="calmIndex" 
                      name="Calm" 
                      type="monotone" 
                      stroke="var(--color-calm)" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      dataKey="productivityIndex" 
                      name="Productivity" 
                      type="monotone" 
                      stroke="var(--color-productivity)" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                  </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
