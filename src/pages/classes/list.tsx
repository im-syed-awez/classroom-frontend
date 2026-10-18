import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { Badge } from "@/components/ui/badge";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subject, User } from "@/types";
import { GraduationCap, Layers, Search } from "lucide-react";

type Classroom = {
  id: number;
  bannerUrl: string | null;
  name: string;
  status: "active" | "inactive" | "archived";
  capacity: number;
  subject?: Subject | null;
  teacher?: User | null;
};

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });
  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });

  const filterConditions = [
    ...(debouncedSearch
      ? [{ field: "name", operator: "contains" as const, value: debouncedSearch }]
      : []),
    ...(selectedSubject !== "all"
      ? [{ field: "subject", operator: "eq" as const, value: selectedSubject }]
      : []),
    ...(selectedTeacher !== "all"
      ? [{ field: "teacher", operator: "eq" as const, value: selectedTeacher }]
      : []),
  ];

  const classTable = useTable<Classroom>({
    columns: useMemo<ColumnDef<Classroom>[]>(
      () => [
        {
          id: "bannerUrl",
          accessorKey: "bannerUrl",
          size: 100,
          header: () => <p className="column-title ml-2 font-medium">Banner</p>,
          cell: ({ getValue }) => {
            const bannerUrl = getValue<string | null>();
            return bannerUrl ? (
              <img
                src={bannerUrl}
                alt="Class banner"
                className="ml-1 h-12 w-20 rounded-md object-cover"
              />
            ) : (
              <div className="ml-1 h-12 w-20 rounded-md bg-muted" aria-label="No banner" />
            );
          },
        },
        {
          id: "name",
          accessorKey: "name",
          size: 220,
          header: () => <p className="column-title font-medium">Class Name</p>,
          cell: ({ getValue }) => (
            <span className="font-medium text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "status",
          accessorKey: "status",
          size: 120,
          header: () => <p className="column-title font-medium">Status</p>,
          cell: ({ getValue }) => {
            const status = getValue<Classroom["status"]>();
            const variant = status === "active" ? "secondary" : status === "inactive" ? "outline" : "destructive";
            return <Badge variant={variant} className="capitalize">{status}</Badge>;
          },
        },
        {
          id: "subject",
          accessorFn: (row) => row.subject?.name ?? "—",
          size: 200,
          header: () => <p className="column-title font-medium">Subject</p>,
          cell: ({ getValue }) => <span>{getValue<string>()}</span>,
        },
        {
          id: "teacher",
          accessorFn: (row) => row.teacher?.name ?? "—",
          size: 200,
          header: () => <p className="column-title font-medium">Teacher</p>,
          cell: ({ getValue }) => <span>{getValue<string>()}</span>,
        },
        {
          id: "capacity",
          accessorKey: "capacity",
          size: 110,
          header: () => <p className="column-title font-medium">Capacity</p>,
          cell: ({ getValue }) => <span>{getValue<number>()}</span>,
        },
      ],
      []
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: { permanent: filterConditions },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  });

  const subjects = subjectsQuery.data?.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];

  return (
    <ListView>
      <Breadcrumb />

      <div className="flex items-center gap-2 mt-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        <h1 className="page-title text-2xl font-bold tracking-tight">Classes</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-4">
        <p className="text-muted-foreground text-sm">
          Browse classes, search by name, or filter by subject and teacher.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search class name..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Subjects" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-52">
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Teachers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CreateButton resource="classes" className="w-full sm:w-auto">
            Create Class
          </CreateButton>
        </div>
      </div>

      <DataTable table={classTable} />
    </ListView>
  );
};

export default ClassesList;