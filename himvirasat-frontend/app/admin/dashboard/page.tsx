import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundDecor } from "@/components/layout/background-decor";
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Language Experts</CardTitle>
          </CardHeader>

          <CardContent>0</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
          </CardHeader>

          <CardContent>0</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datasets</CardTitle>
          </CardHeader>

          <CardContent>0</CardContent>
        </Card>
      </div>
    </div>
  );
}
