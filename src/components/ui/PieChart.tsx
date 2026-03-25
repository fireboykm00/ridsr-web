import React from "react";
import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface PieChartProps {
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

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  isLoading = false,
  error,
  emptyMessage = "No data available for selected period.",
}) => {
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

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
        <RechartsPieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={100}
            paddingAngle={3}
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
};
