import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardCard({ title, value }) {
  return (
    <Card className="bg-zinc-800 text-white">
      <CardHeader>
        <CardTitle className="text-xs text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
