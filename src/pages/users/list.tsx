import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useGetIdentity } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import type { User } from "@/types";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users } from "lucide-react";

export default function UsersList() {
  const { data: identity, isLoading: identityLoading } = useGetIdentity<{ role?: string }>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("all");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = [
    ...(debouncedSearch ? [{ field: "search", operator: "contains" as const, value: debouncedSearch }] : []),
    ...(role !== "all" ? [{ field: "role", operator: "eq" as const, value: role }] : []),
  ];
  const table = useTable<User>({
    columns: useMemo<ColumnDef<User>[]>(() => [
      { accessorKey: "name", header: "Name", size: 220 },
      { accessorKey: "email", header: "Email", size: 280 },
      { accessorKey: "role", header: "Role", size: 120, cell: ({ getValue }) => <Badge variant="outline" className="capitalize">{getValue<string>()}</Badge> },
      { accessorKey: "createdAt", header: "Created", size: 150, cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString() },
      { id: "actions", header: "Actions", size: 260, cell: ({ row }) => <div className="flex gap-2"><ShowButton resource="users" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton><EditButton resource="users" recordItemId={row.original.id} variant="outline" size="sm">Edit</EditButton><DeleteButton resource="users" recordItemId={row.original.id} size="sm">Delete</DeleteButton></div> },
    ], []),
    refineCoreProps: { resource: "users", pagination: { pageSize: 10, mode: "server" }, filters: { permanent: filters }, sorters: { initial: [{ field: "createdAt", order: "desc" }] } },
  });

  if (identityLoading) return <p>Checking permissions…</p>;
  if (identity?.role !== "admin") return <p role="alert">Only administrators can manage user accounts.</p>;

  return <ListView>
    <Breadcrumb />
    <div className="mt-2 flex items-center gap-2"><Users className="h-6 w-6 text-primary" /><h1 className="page-title text-2xl font-bold">Users</h1></div>
    <div className="my-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <p className="text-sm text-muted-foreground">Manage administrator, teacher, and student accounts.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <Select value={role} onValueChange={setRole}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All roles" /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="teacher">Teacher</SelectItem><SelectItem value="student">Student</SelectItem></SelectContent></Select>
        <CreateButton resource="users">Create user</CreateButton>
      </div>
    </div>
    <DataTable table={table} />
  </ListView>;
}