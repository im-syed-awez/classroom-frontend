import { useShow } from "@refinedev/core";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subject } from "@/types";

export default function SubjectDetail() {
  const { query } = useShow<Subject>({ resource: "subjects" });
  const subject = query.data?.data;
  return (
    <ShowView>
      <ShowViewHeader resource="subjects" title="Subject details" />
      {query.isLoading ? <p>Loading subject…</p> : query.isError || !subject ? <p role="alert">Could not load this subject.</p> : (
        <Card className="max-w-2xl">
          <CardHeader><div className="flex items-center justify-between gap-4"><CardTitle>{subject.name}</CardTitle><Badge variant="outline">{subject.code}</Badge></div></CardHeader>
          <CardContent className="space-y-4">
            <div><h2 className="text-sm font-medium text-muted-foreground">Department</h2><p>{subject.department?.name ?? "Unknown"} {subject.department?.code ? `(${subject.department.code})` : ""}</p></div>
            <div><h2 className="text-sm font-medium text-muted-foreground">Description</h2><p>{subject.description || "No description provided."}</p></div>
          </CardContent>
        </Card>
      )}
    </ShowView>
  );
}