import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface MapVisualizationProps {
  data: Array<{
    district: string;
    value: number;
  }>;
  title?: string;
  height?: number;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({
  data,
  title,
  height = 400,
  isLoading = false,
  error,
  emptyMessage = "No district distribution available for selected period.",
}) => {
  const sorted = [...(data || [])].sort((a, b) => b.value - a.value).slice(0, 12);
  const chartData = sorted.map((d) => ({ name: d.district, value: d.value }));
  const chartConfig = {
    value: { label: "Cases", color: "var(--chart-3)" },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="animate-pulse rounded-md bg-muted" style={{ height }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive" style={{ height }}>
          Unable to load chart data. {error}
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="rounded-md bg-muted px-4 py-6 text-sm text-muted-foreground" style={{ height }}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ChartContainer config={chartConfig} className="min-h-[260px] w-full" style={{ height }}>
        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 24, right: 12 }}>
          <CartesianGrid horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={90}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => String(value).slice(0, 12)}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
