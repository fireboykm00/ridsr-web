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
        <div className="animate-pulse rounded-lg bg-gray-100" style={{ height }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700" style={{ height }}>
          Unable to load chart data. {error}
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="rounded-lg bg-gray-50 px-4 py-6 text-sm text-gray-500" style={{ height }}>
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
