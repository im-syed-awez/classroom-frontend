import { useShow } from "@refinedev/core";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Department } from "@/types";

export default function DepartmentDetail() {
  const { query } = useShow<Department>({ resource: "departments" });
  const department = query.data?.data;
  return (
    <ShowView>
      <ShowViewHeader resource="departments" title="Department details" />
      {query.isLoading ? <p>Loading department…</p> : query.isError || !department ? <p role="alert">Could not load this department.</p> : (
        <Card className="max-w-2xl"><CardHeader><div className="flex items-center justify-between gap-4"><CardTitle>{department.name}</CardTitle><Badge variant="outline">{department.code}</Badge></div></CardHeader>
          <CardContent><h2 className="text-sm font-medium text-muted-foreground">Description</h2><p>{department.description || "No description provided."}</p></CardContent>
        </Card>
      )}
    </ShowView>
  );
}