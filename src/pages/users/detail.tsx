import { useGetIdentity, useShow } from "@refinedev/core";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";

export default function UserDetail() {
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const { query } = useShow<User>({ resource: "users" });
  const person = query.data?.data;
  if (identity?.role !== "admin") return <p role="alert">Only administrators can view user account details.</p>;
  return <ShowView>
    <ShowViewHeader resource="users" title="User details" />
    {query.isLoading ? <p>Loading user…</p> : query.isError || !person ? <p role="alert">Could not load this user.</p> : <Card className="max-w-2xl">
      <CardHeader><div className="flex items-center justify-between gap-4"><CardTitle>{person.name}</CardTitle><Badge variant="outline" className="capitalize">{person.role}</Badge></div></CardHeader>
      <CardContent className="space-y-3"><p><span className="font-medium">Email:</span> {person.email}</p><p><span className="font-medium">Email verified:</span> {person.emailVerified ? "Yes" : "No"}</p><p><span className="font-medium">Created:</span> {new Date(person.createdAt).toLocaleDateString()}</p></CardContent>
    </Card>}
  </ShowView>;
}