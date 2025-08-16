import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function LogTable({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="rounded-md border border-zinc-700">
      <Table>
        <TableHeader className="bg-zinc-800">
          <TableRow>
            <TableHead className="text-white">ID</TableHead>
            <TableHead className="text-white">IP Address</TableHead>
            <TableHead className="text-white">Anomaly</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index} className="hover:bg-zinc-800/50 transition">
              <TableCell className="font-medium text-gray-200">{index + 1}</TableCell>
              <TableCell className="text-gray-200">{log.ip_address}</TableCell>
              <TableCell className="text-gray-200">
                {log.is_anomaly ? (
                  <span className="text-red-500 font-semibold">Yes</span>
                ) : (
                  <span className="text-green-400">No</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


