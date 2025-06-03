"use client";

import React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MTTRMTBFCharts from "@/components/mttr-mtbf";

export default function Home({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: addDays(new Date(2024, 0, 20), 20),
  });

  const [selectedMachine, setSelectedMachine] =
    React.useState<string>("SETIAP MESIN");

  const ahuList = [
    101, 102, 103, 104, 105, 106, 107, 108, 110, 111, 112, 113, 114, 115, 116,
    201, 202, 203, 204, 205, 206, 207, 208, 210, 211, 212, 213, 215, 216, 217,
    218, 219, 220, 221, 301, 302, 303, 304, 305, 306, 307, 308,
  ];

  return (
    <div className="m-10">
      <h1 className="text-3xl font-bold underline mb-5">AHU Dashboard</h1>
      <div className="flex space-x-3">
        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 bg-slate-50 shadow px-4 py-2 rounded-md hover:bg-slate-100 text-sm font-medium">
              {selectedMachine}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64">
            <div className="p-1">
              <DropdownMenuItem
                className="text-sm focus:bg-slate-100"
                onClick={() => setSelectedMachine("SETIAP MESIN")}
              >
                SETIAP MESIN
              </DropdownMenuItem>

              <div className="grid grid-cols-2 gap-1">
                {ahuList.map((ahu) => (
                  <DropdownMenuItem
                    key={ahu}
                    className="text-sm focus:bg-slate-100"
                    onClick={() => setSelectedMachine(`AHU ${ahu}`)}
                  >
                    AHU {ahu}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Picker */}
        <div className={cn("grid gap-2", className)}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <MTTRMTBFCharts selectedMachine={selectedMachine} />
    </div>
  );
}
