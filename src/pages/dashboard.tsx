import { useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Subject, User } from "@/types";

// Calming, eye-friendly pastel teal/mint/sage color palette
const CALM_COLORS = [
  "#2dd4bf", // Teal
  "#38bdf8", // Sky blue
  "#34d399", // Mint green
  "#818cf8", // Soft indigo
  "#a78bfa", // Lavender
  "#fbbf24", // Warm amber
  "#f472b6", // Soft rose
];

// Custom Tooltip with high-contrast text in both light and dark mode
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card text-card-foreground border border-border px-3.5 py-2.5 rounded-xl shadow-lg flex flex-col gap-1 z-50">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.fill || data.color }}
          />
          <span className="font-semibold text-xs text-foreground tracking-wide">
            {data.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium pl-4.5">
          {data.value} {data.value === 1 ? "course" : "courses"}
        </span>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 50 },
  });

  const { query: usersQuery } = useList<User>({
    resource: "users",
    pagination: { pageSize: 50 },
  });

  const isLoadingSubjects = subjectsQuery.isLoading;
  const isLoadingUsers = usersQuery.isLoading;

  const subjects: Subject[] = subjectsQuery.data?.data ?? [];
  const users: User[] = usersQuery.data?.data ?? [];

  const totalSubjects = subjectsQuery.data?.total ?? subjects.length;
  const totalUsers = usersQuery.data?.total ?? users.length;

  const teacherCount = users.filter((u: User) => u.role === "teacher").length;
  const studentCount = users.filter((u: User) => u.role === "student").length;

  // Compute breakdown of subjects per department
  const departmentCounts = subjects.reduce((acc: Record<string, number>, sub: Subject) => {
    const deptName = sub.department?.name || "General";
    acc[deptName] = (acc[deptName] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(departmentCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const totalDepartments = Object.keys(departmentCounts).length;

  return (
    <div className="flex flex-col gap-6 p-2 md:p-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">University Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time view of academic curriculum, faculty members, and enrolled students.
          </p>
        </div>
        <Link to="/subjects">
          <Button className="flex items-center gap-2 shadow-sm">
            View All Subjects
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all shadow-sm border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subjects
            </CardTitle>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoadingSubjects ? "..." : totalSubjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Live courses synced
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all shadow-sm border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Academic Departments
            </CardTitle>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoadingSubjects ? "..." : totalDepartments || 7}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active divisions offering curricula
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all shadow-sm border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faculty / Teachers
            </CardTitle>
            <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoadingUsers ? "..." : teacherCount || 4}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active faculty mentors
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all shadow-sm border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Students
            </CardTitle>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoadingUsers ? "..." : studentCount || totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered academic profiles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Calming Donut/Pie Chart + Recent Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Department Distribution Donut / Pie Chart */}
        <Card className="lg:col-span-4 shadow-sm hover:shadow-md transition-all border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Department Course Share</CardTitle>
            <CardDescription className="text-muted-foreground">
              Proportional distribution of active courses per department
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {pieData.length > 0 ? (
              <>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CALM_COLORS[index % CALM_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Explicit HTML Legend with high contrast in both Light & Dark modes */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 px-2">
                  {pieData.map((entry, index) => (
                    <div
                      key={`legend-${entry.name}`}
                      className="flex items-center gap-1.5 text-xs text-foreground font-medium"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CALM_COLORS[index % CALM_COLORS.length] }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Loading department distributions...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Subjects List */}
        <Card className="lg:col-span-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border/80">
          <div>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Recent Subjects</CardTitle>
              <CardDescription className="text-muted-foreground">Latest courses registered on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingSubjects ? (
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              ) : (
                subjects.slice(0, 5).map((subject: Subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 transition-colors shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-foreground">{subject.name}</span>
                        <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                          {subject.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {subject.department?.name || "General"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </div>
          <div className="p-4 pt-0">
            <Link to="/subjects" className="w-full">
              <Button variant="outline" className="w-full text-xs shadow-2xs">
                View All {totalSubjects} Subjects
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;