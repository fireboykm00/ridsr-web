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

  if (!data?.length) {
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
