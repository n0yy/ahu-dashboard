import { getSheetData } from "@/app/actions";
import { useEffect, useMemo, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import { parse, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function AllWo({
  selectedMachine,
  dateRange,
}: {
  selectedMachine: string;
  dateRange?: DateRange;
}) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    startTransition(async () => {
      const result = await getSheetData("WO SELURUH");
      setData(result.data);
    });
  }, []);

  // Reset halaman ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMachine, dateRange]);

  // Fungsi untuk membandingkan tanggal
  const isDateInRange = (dateString: string, range?: DateRange): boolean => {
    if (!range?.from || !range?.to) return true;

    try {
      // Coba parse berbagai format tanggal yang mungkin ada
      let parsedDate: Date;

      // Format yang mungkin: "2024-01-20", "20/01/2024", "Jan 20, 2024", dll
      if (dateString.includes("-")) {
        // Format: "2024-01-20"
        parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
      } else if (dateString.includes("/")) {
        // Format: "20/01/2024" atau "01/20/2024"
        const parts = dateString.split("/");
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // Format: "2024/01/20"
            parsedDate = parse(dateString, "yyyy/MM/dd", new Date());
          } else {
            // Format: "20/01/2024" atau "01/20/2024"
            parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
          }
        } else {
          return true; // Jika format tidak dikenali, tampilkan semua
        }
      } else {
        // Format lain, coba parse dengan date-fns
        parsedDate = new Date(dateString);
        if (isNaN(parsedDate.getTime())) {
          return true; // Jika tidak bisa di-parse, tampilkan semua
        }
      }

      return isWithinInterval(parsedDate, {
        start: startOfDay(range.from),
        end: endOfDay(range.to),
      });
    } catch (error) {
      console.warn("Error parsing date:", dateString, error);
      return true; // Jika ada error, tampilkan semua
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter berdasarkan mesin
    if (selectedMachine !== "SETIAP MESIN") {
      filtered = filtered.filter((item) => item.machine === selectedMachine);
    }

    // Filter berdasarkan rentang tanggal
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((item) => isDateInRange(item.date, dateRange));
    }

    return filtered;
  }, [data, selectedMachine, dateRange]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Work Order</CardTitle>
        <CardDescription>
          WO{" "}
          {dateRange?.from && dateRange?.to ? (
            <span className="text-sm text-muted-foreground">
              ({filteredData.length} data ditemukan)
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              ({filteredData.length} total data)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="text-center py-8">Memuat data WorkOrder...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {dateRange?.from && dateRange?.to ? (
                <>
                  Tidak ada WorkOrder yang ditemukan untuk rentang tanggal yang
                  dipilih
                  {selectedMachine !== "SETIAP MESIN" && (
                    <span> dan {selectedMachine}</span>
                  )}
                </>
              ) : selectedMachine !== "SETIAP MESIN" ? (
                <>Tidak ada WorkOrder yang ditemukan untuk {selectedMachine}</>
              ) : (
                "Tidak ada data WorkOrder tersedia"
              )}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cause Breakdown</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Actual Start</TableHead>
                  <TableHead>Complete</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.causeBreakdown}</TableCell>
                    <TableCell>{item.machine}</TableCell>
                    <TableCell>{item.actualStart}</TableCell>
                    <TableCell>{item.complete}</TableCell>
                    <TableCell>{item.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredData.length > 10 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <Select
                    defaultValue={rowsPerPage.toString()}
                    onValueChange={handleRowsPerPageChange}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50].map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
