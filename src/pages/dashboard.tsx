import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { useGetIdentity } from "@refinedev/core";
import { Activity, BookOpen, Building2, GraduationCap, Users } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { API_URL } from "@/providers/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardData = {
  totals: { users: number; departments: number; subjects: number; classes: number; enrollments: number };
  usersByRole: { name: string; value: number }[];
  enrollmentsByMonth: { month: string; count: number }[];
  classesByDepartment: { name: string; value: number }[];
  capacityStatus: { available: number; nearlyFull: number; full: number };
  activity: { id: string; type: string; label: string; createdAt: string }[];
};

const COLORS = ["#2dd4bf", "#38bdf8", "#a78bfa", "#fbbf24"];

async function loadDashboard(): Promise<DashboardData> {
  const response = await fetch(`${API_URL}/analytics/dashboard`, { credentials: "include" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? "Could not load dashboard analytics");
  return payload.data as DashboardData;
}

const Dashboard = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity<{ role?: string }>();
  const dashboardQuery = useQuery({ queryKey: ["dashboard-analytics"], queryFn: loadDashboard, enabled: identity?.role === "admin" });

  if (identityLoading) return <p className="p-6 text-muted-foreground">Loading dashboard…</p>;
  if (identity?.role !== "admin") return <div className="p-6"><h1 className="text-2xl font-bold">Dashboard</h1><p className="mt-2 text-muted-foreground">Organization-wide analytics are available to administrators.</p></div>;
  if (dashboardQuery.isLoading) return <p className="p-6 text-muted-foreground">Loading dashboard analytics…</p>;
  if (dashboardQuery.isError || !dashboardQuery.data) return <p className="p-6 text-destructive" role="alert">{dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Could not load analytics."}</p>;

  const data = dashboardQuery.data;
  const capacityData = [
    { name: "Available", value: data.capacityStatus.available },
    { name: "Nearly full", value: data.capacityStatus.nearlyFull },
    { name: "Full", value: data.capacityStatus.full },
  ];
  const cards = [
    { label: "Users", value: data.totals.users, icon: Users },
    { label: "Departments", value: data.totals.departments, icon: Building2 },
    { label: "Subjects", value: data.totals.subjects, icon: BookOpen },
    { label: "Classes", value: data.totals.classes, icon: GraduationCap },
    { label: "Enrollments", value: data.totals.enrollments, icon: Activity },
  ];

  return <div className="flex flex-col gap-6 p-2 md:p-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div><h1 className="text-3xl font-bold tracking-tight">Classroom dashboard</h1><p className="mt-1 text-sm text-muted-foreground">Current totals, enrollment activity, and capacity overview.</p></div>
      <Badge variant="outline">Administrator view</Badge>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><Icon className="h-4 w-4 text-primary" /></CardHeader><CardContent><p className="text-2xl font-bold">{value.toLocaleString()}</p></CardContent></Card>)}
    </div>

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Card><CardHeader><CardTitle>Enrollment trends</CardTitle><CardDescription>New enrollments by month, trailing six months</CardDescription></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.enrollmentsByMonth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" name="Enrollments" stroke="#2dd4bf" strokeWidth={3} /></LineChart></ResponsiveContainer></div></CardContent></Card>

      <Card><CardHeader><CardTitle>Classes by department</CardTitle><CardDescription>Number of classes associated with each department</CardDescription></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.classesByDepartment} margin={{ bottom: 36 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={70} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" name="Classes" fill="#38bdf8" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>

      <Card><CardHeader><CardTitle>Class capacity</CardTitle><CardDescription>Classes by remaining capacity status</CardDescription></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip /><Pie data={capacityData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={4}>{capacityData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}</Pie></PieChart></ResponsiveContainer></div><div className="flex flex-wrap justify-center gap-4 text-sm">{capacityData.map((entry, index) => <span key={entry.name} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />{entry.name}: {entry.value}</span>)}</div></CardContent></Card>

      <Card><CardHeader><CardTitle>User distribution</CardTitle><CardDescription>Registered accounts by role</CardDescription></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip /><Pie data={data.usersByRole} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={4}>{data.usersByRole.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer></div><div className="flex flex-wrap justify-center gap-4 text-sm">{data.usersByRole.map((entry, index) => <span key={entry.name} className="flex items-center gap-2 capitalize"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{entry.name}: {entry.value}</span>)}</div></CardContent></Card>
    </div>

    <Card><CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Latest registrations, classes, subjects, and enrollments</CardDescription></CardHeader><CardContent>{data.activity.length ? <ul className="divide-y">{data.activity.map((item) => <li key={item.id} className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center"><span>{item.label}</span><span className="text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No recent activity.</p>}</CardContent></Card>

    <div className="flex gap-3 text-sm"><Link className="text-primary underline-offset-4 hover:underline" to="/classes">Browse classes</Link><Link className="text-primary underline-offset-4 hover:underline" to="/users">Manage users</Link></div>
  </div>;
};

export default Dashboard;
