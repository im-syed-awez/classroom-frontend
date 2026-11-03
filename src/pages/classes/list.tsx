import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useGetIdentity, useList } from "@refinedev/core";
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
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { useSearchParams } from "react-router";

type Classroom = {
  id: number;
  bannerUrl: string | null;
  name: string;
  status: "active" | "inactive" | "archived";
  capacity: number;
  enrollmentCount: number;
  subject?: Subject | null;
  teacher?: User | null;
};

const ClassesList = () => {
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const canManageClasses = identity?.role === "admin" || identity?.role === "teacher";
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const selectedSubject = searchParams.get("subject") ?? "all";
  const selectedTeacher = searchParams.get("teacher") ?? "all";
  const selectedStatus = searchParams.get("status") ?? "all";
  const selectedCapacity = searchParams.get("capacity") ?? "all";
  const createdFrom = searchParams.get("from") ?? "";
  const createdTo = searchParams.get("to") ?? "";

  const updateParam = (key: string, value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
      next.delete("currentPage");
      next.delete("page");
      return next;
    }, { replace: true });
  };

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
    queryOptions: { enabled: identity?.role === "admin" },
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
    ...(selectedStatus !== "all" ? [{ field: "status", operator: "eq" as const, value: selectedStatus }] : []),
    ...(selectedCapacity !== "all" ? [{ field: "capacityStatus", operator: "eq" as const, value: selectedCapacity }] : []),
    ...(createdFrom ? [{ field: "createdFrom", operator: "eq" as const, value: createdFrom }] : []),
    ...(createdTo ? [{ field: "createdTo", operator: "eq" as const, value: createdTo }] : []),
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
          accessorFn: (row) => `${row.enrollmentCount}/${row.capacity}`,
          size: 160,
          header: () => <p className="column-title font-medium">Enrollment</p>,
          cell: ({ row }) => {
            const { capacity, enrollmentCount } = row.original;
            const ratio = capacity > 0 ? enrollmentCount / capacity : 0;
            const full = enrollmentCount >= capacity;
            const nearFull = ratio >= 0.9;
            return <div className="flex flex-col gap-1">
              <span>{enrollmentCount} / {capacity}</span>
              {full ? <Badge variant="destructive">Full</Badge> : nearFull ? <Badge variant="outline" className="border-amber-500 text-amber-700">Nearly full</Badge> : null}
            </div>;
          },
        },
        {
          id: 'details',
          size: 290,
          header: () => <p className="column-title">Actions</p>,
          cell: ({ row }) => <div className="flex gap-2">
            <ShowButton resource="classes" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            {canManageClasses && <EditButton resource="classes" recordItemId={row.original.id} variant="outline" size="sm">Edit</EditButton>}
            {canManageClasses && <DeleteButton resource="classes" recordItemId={row.original.id} size="sm">Delete</DeleteButton>}
          </div>
        },
      ], [canManageClasses]),
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
              onChange={(event) => updateParam("q", event.target.value)}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select value={selectedSubject} onValueChange={(value) => updateParam("subject", value)}>
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
            {identity?.role === "admin" && <Select value={selectedTeacher} onValueChange={(value) => updateParam("teacher", value)}>
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
            </Select>}
          </div>

          <Select value={selectedStatus} onValueChange={(value) => updateParam("status", value)}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Any status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Any status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
          </Select>

          <Select value={selectedCapacity} onValueChange={(value) => updateParam("capacity", value)}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Any capacity" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Any capacity</SelectItem><SelectItem value="available">Available</SelectItem><SelectItem value="nearlyFull">Nearly full</SelectItem><SelectItem value="full">Full</SelectItem></SelectContent>
          </Select>

          <Input aria-label="Created from" type="date" value={createdFrom} onChange={(event) => updateParam("from", event.target.value)} className="w-full sm:w-40" />
          <Input aria-label="Created to" type="date" value={createdTo} onChange={(event) => updateParam("to", event.target.value)} className="w-full sm:w-40" />

          {canManageClasses && <CreateButton resource="classes" className="w-full sm:w-auto">Create Class</CreateButton>}
        </div>
      </div>

      {canManageClasses && <p className="text-xs text-muted-foreground">Deleting a class permanently removes its enrollments.</p>}

      <DataTable table={classTable} />
    </ListView>
  );
};

export default ClassesList;