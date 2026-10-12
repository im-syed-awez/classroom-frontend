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
import { Subject } from "@/types";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

const SubjectsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

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
      ],
      []
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
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable table={subjectTable} />
    </ListView>
  );
};

export default SubjectsList;
