import {
  Refine,
  Authenticated,
  useGetIdentity,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { Layout } from "./components/refine-ui/layout/layout";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import "./App.css";
import Dashboard from "./pages/dashboard";
import { BookOpen, Building2, GraduationCap, Home, Users } from "lucide-react";
import SubjectsList from "./pages/subjects/list";
import SubjectsCreate from "./pages/subjects/create";
import SubjectsEdit from "./pages/subjects/edit";
import SubjectDetail from "./pages/subjects/detail";
import DepartmentsList from "./pages/departments/index.tsx";
import DepartmentsCreate from "./pages/departments/create.tsx";
import DepartmentsEdit from "./pages/departments/edit.tsx";
import DepartmentDetail from "./pages/departments/detail.tsx";

import ClassesList from "./pages/classes/list";
import ClassesCreate from "./pages/classes/create";
import ClassesEdit from "./pages/classes/edit";
import ClassesShow from "./pages/classes/show";
import Login from "./pages/login";
import Register from "./pages/register";
import UsersList from "./pages/users/list";
import UsersCreate from "./pages/users/create";
import UsersEdit from "./pages/users/edit";
import UserDetail from "./pages/users/detail";

function AdminRouteGuard() {
  const { data: identity, isLoading } = useGetIdentity<{ role?: string }>();

  if (isLoading) return <p>Checking permissions…</p>;
  if (identity?.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "TMGc6g-uZfuMi-ij8Y1L",
              }}
              resources={[
                {
                  name: 'dashboard',
                  list: '/',
                  meta: { label:'Home', icon:<Home />}
                },
                {
                  name: 'users',
                  list: '/users',
                  create: '/users/create',
                  edit: '/users/edit/:id',
                  show: '/users/show/:id',
                  meta: { label: 'Users', icon: <Users /> }
                },
                {
                  name: 'departments',
                  list: '/departments',
                  create: '/departments/create',
                  edit: '/departments/edit/:id',
                  show: '/departments/show/:id',
                  meta: { label: 'Departments', icon: <Building2 /> }
                },
                {
                  name: 'subjects',
                  list: '/subjects',
                  create: '/subjects/create',
                  edit: '/subjects/edit/:id',
                  show: '/subjects/show/:id',
                  meta: { label: 'Subjects', icon: <BookOpen />}
                },
                {
                  name: 'classes',
                  list: '/classes',
                  create: '/classes/create',
                  edit: '/classes/edit/:id',
                  show: '/classes/show/:id',
                  meta: { label: 'Classes', icon: <GraduationCap />}
                }
              ]}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="auth-pages"
                      fallback={<Outlet />}
                    >
                      <NavigateToResource resource="dashboard" />
                    </Authenticated>
                  }
                >
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                <Route
                  element={
                    <Authenticated key="protected" redirectOnFail="/login">
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route path="/" element={<Dashboard />} />

                  <Route element={<AdminRouteGuard />}>
                    <Route path="users">
                      <Route index element={<UsersList />} />
                      <Route path="create" element={<UsersCreate />} />
                      <Route path="edit/:id" element={<UsersEdit />} />
                      <Route path="show/:id" element={<UserDetail />} />
                    </Route>
                  </Route>

                  <Route path="departments">
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={<DepartmentsCreate />} />
                    <Route path="edit/:id" element={<DepartmentsEdit />} />
                    <Route path="show/:id" element={<DepartmentDetail />} />
                  </Route>

                  <Route path="subjects">
                    <Route index element={<SubjectsList />}/>
                    <Route path="create" element={<SubjectsCreate />}/>
                    <Route path="edit/:id" element={<SubjectsEdit />} />
                    <Route path="show/:id" element={<SubjectDetail />} />
                  </Route>

                  <Route path="classes">
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={<ClassesCreate />} />
                    <Route path="edit/:id" element={<ClassesEdit />} />
                    <Route path="show/:id" element={<ClassesShow />} />
                  </Route>

                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
