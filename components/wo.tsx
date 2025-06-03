import { getSheetData } from "@/app/actions";
import { useEffect, useMemo, useState, useTransition } from "react";
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
  TableCaption,
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
}: {
  selectedMachine: string;
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

  const filteredData = useMemo(() => {
    return selectedMachine === "SETIAP MESIN"
      ? data
      : data.filter((item) => item.machine === selectedMachine);
  }, [data, selectedMachine]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // reset ke halaman pertama
  };

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Work Order</CardTitle>
        <CardDescription>WO</CardDescription>
      </CardHeader>
      <CardContent>
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
      </CardContent>
    </Card>
  );
}
