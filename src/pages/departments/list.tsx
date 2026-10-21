import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity } from "@refinedev/core";
import type { Department } from "@/types";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { Input } from "@/components/ui/input";
import { Building2, Search } from "lucide-react";

export default function DepartmentsList() {
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const isAdmin = identity?.role === "admin";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const table = useTable<Department>({
    columns: useMemo<ColumnDef<Department>[]>(() => [
      { accessorKey: "code", header: "Code", size: 140 },
      { accessorKey: "name", header: "Department", size: 240 },
      { accessorKey: "description", header: "Description", size: 360,
        cell: ({ getValue }) => <span>{getValue<string | null>() || "—"}</span> },
      ...(isAdmin ? [{ id: "actions", header: "Actions", size: 220,
        cell: ({ row }) => <div className="flex gap-2">
          <ShowButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
          <EditButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm">Edit</EditButton>
          <DeleteButton resource="departments" recordItemId={row.original.id} size="sm">Delete</DeleteButton>
        </div> } as ColumnDef<Department>] : []),
      ], [isAdmin]),
    refineCoreProps: {
      resource: "departments",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: debouncedSearch ? [{ field: "search", operator: "contains", value: debouncedSearch }] : [] },
      sorters: { initial: [{ field: "name", order: "asc" }] },
    },
  });

  return <ListView>
    <Breadcrumb />
    <div className="mt-2 flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" /><h1 className="page-title text-2xl font-bold">Departments</h1></div>
    <div className="my-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">Manage the departments used to organize subjects.</p>
      <div className="flex gap-3">
        <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search name or code" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        {isAdmin && <CreateButton resource="departments">Create Department</CreateButton>}
      </div>
    </div>
    <DataTable table={table} />
  </ListView>;
}