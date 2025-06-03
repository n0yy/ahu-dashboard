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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSheetData } from "@/app/actions";
import { useEffect, useState, useTransition } from "react";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

// Config Chart
const mttrConfig = {
  mttr: {
    label: "MTTR (Minutes)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const mtbfConfig = {
  mtbf: {
    label: "MTBF (Minutes)",
    color: "var(--chart-2)",
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

  // Filter data berdasarkan mesin
  const filteredData = React.useMemo(() => {
    return selectedMachine === "SETIAP MESIN"
      ? data
      : data.filter((item) => item.machine === selectedMachine);
  }, [data, selectedMachine]);

  // Pisahkan data untuk MTTR dan MTBF
  const mttrChartData = React.useMemo(() => {
    return (
      filteredData.map((item) => ({
        date: item?.date || "",
        month: item?.month || "",
        machine: item?.machine || "",
        duration: item?.bdDuration || 0,
        freq: item?.bdFreq || 0,
        mttr: item?.mttr
          ? parseFloat(item.mttr.toString().replace(",", "."))
          : 0,
      })) || []
    );
  }, [filteredData]);

  const mtbfChartData = React.useMemo(() => {
    return (
      filteredData.map((item) => ({
        date: item?.date || "",
        month: item?.month || "",
        machine: item?.machine || "",
        duration: item?.bdDuration || 0,
        freq: item?.bdFreq || 0,
        mtbf: item?.mtbf
          ? parseFloat(item.mtbf.toString().replace(",", "."))
          : 0,
      })) || []
    );
  }, [filteredData]);

  // Hitung tren
  const calculateTrend = (data: { value: number }[]) => {
    if (data.length < 2 || data[0].value === 0) return "0";
    const trend =
      ((data[data.length - 1].value - data[0].value) / data[0].value) * 100;
    return trend.toFixed(1);
  };

  const mttrTrend = calculateTrend(
    mttrChartData.map((d) => ({ value: d.mttr }))
  );
  const mtbfTrend = calculateTrend(
    mtbfChartData.map((d) => ({ value: d.mtbf }))
  );

  return (
    <section className="w-full max-w-none">
      <Tabs defaultValue="mttr" className=" mt-6">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
          <TabsTrigger value="mttr">MTTR</TabsTrigger>
          <TabsTrigger value="mtbf">MTBF</TabsTrigger>
        </TabsList>

        {/* Tab MTTR */}
        <TabsContent value="mttr">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Grafik MTTR */}
            <Card className="w-full lg:3/4">
              <CardHeader>
                <CardTitle>Mean Time To Repair (MTTR)</CardTitle>
                <CardDescription>{selectedMachine}</CardDescription>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="text-center py-8">Memuat...</div>
                ) : mttrChartData.length === 0 ? (
                  <div className="text-center py-8">Tidak ada data</div>
                ) : (
                  <ChartContainer
                    config={mttrConfig}
                    className="aspect-auto h-[250px] w-full"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={mttrChartData}
                      margin={{ top: 20, left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
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
                        fill="var(--color-mttr)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-2 font-medium leading-none">
                  {parseFloat(mttrTrend) > 0 ? "Meningkat" : "Menurun"}{" "}
                  {Math.abs(parseFloat(mttrTrend))}%
                  {parseFloat(mttrTrend) > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Tabel MTTR Data */}
            <Card className="w-full lg:w-1/4">
              <CardHeader>
                <CardTitle>Breakdown</CardTitle>
                <CardDescription>
                  <Badge>{selectedMachine}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="text-center py-4">Memuat data...</div>
                ) : mttrChartData.length === 0 ? (
                  <div className="text-center py-4">
                    Tidak ada data tersedia.
                  </div>
                ) : (
                  <ScrollArea className="max-h-[350px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted text-left">
                          <TableHead>Month</TableHead>
                          <TableHead>Machine</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>MTTR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mttrChartData.map((row, index) => (
                          <TableRow
                            key={index}
                            className="border-t hover:bg-muted/30"
                          >
                            <TableCell>{row.month}</TableCell>
                            <TableCell>{row.machine}</TableCell>
                            <TableCell>{row.duration}</TableCell>
                            <TableCell>{row.freq}</TableCell>
                            <TableCell>{row.mttr}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab MTBF */}
        <TabsContent value="mtbf">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Grafik MTBF */}
            <Card className="w-full lg:w-3/4">
              <CardHeader>
                <CardTitle>Mean Time Between Failures (MTBF)</CardTitle>
                <CardDescription>{selectedMachine}</CardDescription>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="text-center py-8">Memuat...</div>
                ) : mtbfChartData.length === 0 ? (
                  <div className="text-center py-8">Tidak ada data</div>
                ) : (
                  <ChartContainer
                    config={mtbfConfig}
                    className="aspect-auto h-[250px] w-full"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={mtbfChartData}
                      margin={{ top: 20, left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        domain={[0, 50]}
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
                        fill="var(--color-mtbf)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-2 font-medium leading-none">
                  {parseFloat(mtbfTrend) > 0 ? "Meningkat" : "Menurun"}{" "}
                  {Math.abs(parseFloat(mtbfTrend))}%
                  {parseFloat(mtbfTrend) > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Tabel MTBF Data */}
            <Card className="w-full lg:w-1/4">
              <CardHeader>
                <CardTitle>Breakdown</CardTitle>
                <CardDescription>
                  <Badge>{selectedMachine}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <div className="text-center py-4">Memuat data...</div>
                ) : mtbfChartData.length === 0 ? (
                  <div className="text-center py-4">
                    Tidak ada data tersedia.
                  </div>
                ) : (
                  <ScrollArea className="max-h-[350px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted text-left">
                          <TableHead>Month</TableHead>
                          <TableHead>Machine</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>MTBF</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mtbfChartData.map((row, index) => (
                          <TableRow
                            key={index}
                            className="border-t hover:bg-muted/30"
                          >
                            <TableCell>{row.month}</TableCell>
                            <TableCell>{row.machine}</TableCell>
                            <TableCell>{row.duration}</TableCell>
                            <TableCell>{row.freq}</TableCell>
                            <TableCell>{row.mtbf}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
