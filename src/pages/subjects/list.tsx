import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { Search, BookOpen, Layers } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Department, Subject } from "@/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity, useList } from "@refinedev/core";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

const SubjectsList = () => {
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const isAdmin = identity?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { query: departmentsQuery } = useList<Department>({ resource: "departments", pagination: { pageSize: 100 } });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const departmentFilters =
    selectedDepartment === "all"
      ? []
      : [{ field: "department", operator: "eq" as const, value: selectedDepartment }];

  const searchFilters = debouncedSearch
    ? [{ field: "search", operator: "contains" as const, value: debouncedSearch }]
    : [];

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 110,
          header: () => <p className="column-title ml-2 font-medium">Code</p>,
          cell: ({ getValue }) => (
            <Badge variant="outline" className="font-mono font-semibold ml-1">
              {getValue<string>()}
            </Badge>
          ),
        },
        {
          id: "name",
          accessorKey: "name",
          size: 220,
          header: () => <p className="column-title font-medium">Subject Name</p>,
          cell: ({ getValue }) => (
            <span className="font-medium text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "department",
          accessorFn: (row) => row.department?.name ?? "General",
          size: 180,
          header: () => <p className="column-title font-medium">Department</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary" className="font-medium">
              {getValue<string>()}
            </Badge>
          ),
        },
        {
          id: "description",
          accessorKey: "description",
          size: 320,
          header: () => <p className="column-title font-medium">Description</p>,
          cell: ({ getValue }) => {
            const desc = getValue<string>();
            return (
              <span className="text-muted-foreground text-sm line-clamp-2" title={desc}>
                {desc || "No description provided"}
              </span>
            );
          },
        },
        {
          id: "actions",
          size: 220,
          header: () => <p className="column-title font-medium">Actions</p>,
          cell: ({ row }) => <div className="flex gap-2">
            <ShowButton resource="subjects" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            {isAdmin && <EditButton resource="subjects" recordItemId={row.original.id} variant="outline" size="sm">Edit</EditButton>}
            {isAdmin && <DeleteButton resource="subjects" recordItemId={row.original.id} size="sm">Delete</DeleteButton>}
          </div>,
        },
      ],
      [isAdmin]
    ),
    refineCoreProps: {
      resource: "subjects",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [...departmentFilters, ...searchFilters],
      },
      sorters: {
        initial: [{ field: "id", order: "desc" }],
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />

      <div className="flex items-center gap-2 mt-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="page-title text-2xl font-bold tracking-tight">Subjects</h1>
      </div>

      <div className="intro-row flex flex-col md:flex-row md:items-center justify-between gap-4 my-4">
        <p className="text-muted-foreground text-sm">
          Browse academic courses, filter by department, or search by subject code and name.
        </p>

        <div className="actions-row flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="search-field relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search code or name..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Departments" />
                </div>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {(departmentsQuery.data?.data ?? []).map((department) => (
                  <SelectItem key={department.id} value={department.id.toString()}>{department.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAdmin && <CreateButton resource="subjects" className="w-full sm:w-auto">Create Subject</CreateButton>}
        </div>
      </div>

      <DataTable table={subjectTable} />
    </ListView>
  );
};

export default SubjectsList;
