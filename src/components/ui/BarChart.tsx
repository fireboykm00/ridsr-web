import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
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

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title?: string;
  height?: number;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  isLoading = false,
  error,
  emptyMessage = "No data available for selected period.",
}) => {
  const chartConfig = {
    value: { label: "Count", color: "var(--chart-2)" },
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

  if (!data?.length) {
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
      <ChartContainer config={chartConfig} className="min-h-[220px] w-full" style={{ height }}>
        <RechartsBarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value) => String(value).slice(0, 12)}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
};
