"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getSheetData } from "@/app/actions";
import { useEffect, useState, useTransition } from "react";
import React from "react";

const mttrConfig = {
  mttr: {
    label: "MTTR (Minutes)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const mtbfConfig = {
  mtbf: {
    label: "MTBF (Minutes)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface MTTRMTBFChartsProps {
  selectedMachine: string;
}

export default function MTTRMTBFCharts({
  selectedMachine,
}: MTTRMTBFChartsProps) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    startTransition(async () => {
      const result = await getSheetData("SETIAP MESIN");
      setData(result.data);
    });
  }, []);

  const chartData = React.useMemo(() => {
    let filteredData = data || [];

    if (selectedMachine !== "SETIAP MESIN") {
      filteredData = data.filter((item) => item.machine === selectedMachine);
    }

    return filteredData.map((item) => ({
      month: item?.month || "",
      mttr: item?.mttr ? parseFloat(item.mttr.toString().replace(",", ".")) : 0,
      mtbf: item?.mtbf ? parseFloat(item.mtbf.toString().replace(",", ".")) : 0,
    }));
  }, [data, selectedMachine]);

  const mttrTrend =
    chartData.length > 1 && chartData[0]?.mttr !== 0
      ? (
          ((chartData[chartData.length - 1]?.mttr - chartData[0]?.mttr) /
            chartData[0]?.mttr) *
          100
        ).toFixed(1)
      : "0";

  const mtbfTrend =
    chartData.length > 1 && chartData[0]?.mtbf !== 0
      ? (
          ((chartData[chartData.length - 1]?.mtbf - chartData[0]?.mtbf) /
            chartData[0]?.mtbf) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="flex flex-col lg:flex-row mt-10 space-y-4 lg:space-y-0 lg:space-x-3 w-full">
      {/* MTTR Chart */}
      <Card className="w-full lg:w-1/2">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            Mean Time To Repair (MTTR)
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {selectedMachine}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {isPending ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="text-muted-foreground">No data available</div>
            </div>
          ) : (
            <ChartContainer
              config={mttrConfig}
              className="min-h-[200px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
                width={undefined}
                height={undefined}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="mttr"
                  type="natural"
                  stroke="var(--color-mttr)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter className="pt-2 sm:pt-6">
          <div className="flex w-full items-start gap-2 text-xs sm:text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {parseFloat(mttrTrend) > 0 ? "Meningkat" : "Menurun"}{" "}
                {Math.abs(parseFloat(mttrTrend))}%
                {parseFloat(mttrTrend) > 0 ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </div>
              {chartData.length > 0 &&
                chartData[0]?.month &&
                chartData[chartData.length - 1]?.month && (
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    <span className="hidden sm:inline">Dari </span>
                    {chartData[0].month}
                    <span className="hidden sm:inline"> sampai </span>
                    <span className="sm:hidden">-</span>
                    {chartData[chartData.length - 1].month}
                  </div>
                )}
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* MTBF Chart */}
      <Card className="w-full lg:w-1/2">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">
            Mean Time Between Failures (MTBF)
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {selectedMachine}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {isPending ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="text-muted-foreground">No data available</div>
            </div>
          ) : (
            <ChartContainer
              config={mtbfConfig}
              className="min-h-[200px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
                width={undefined}
                height={undefined}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 50]}
                  fontSize={12}
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="mtbf"
                  type="natural"
                  stroke="var(--color-mtbf)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter className="pt-2 sm:pt-6">
          <div className="flex w-full items-start gap-2 text-xs sm:text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {parseFloat(mtbfTrend) > 0 ? "Meningkat" : "Menurun"}{" "}
                {Math.abs(parseFloat(mtbfTrend))}%
                {parseFloat(mtbfTrend) > 0 ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </div>
              {chartData.length > 0 &&
                chartData[0]?.month &&
                chartData[chartData.length - 1]?.month && (
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    <span className="hidden sm:inline">Dari </span>
                    {chartData[0].month}
                    <span className="hidden sm:inline"> sampai </span>
                    <span className="sm:hidden">-</span>
                    {chartData[chartData.length - 1].month}
                  </div>
                )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
