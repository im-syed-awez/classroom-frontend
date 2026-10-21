import { useState } from "react";
import { ClassDetails } from "@/types";
import { useGetIdentity, useShow } from "@refinedev/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdvancedImage } from "@cloudinary/react";
import { bannerPhoto } from "@/lib/cloudinary";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { API_URL } from "@/providers/constants";

type Enrollment = {
  id: number;
  studentId: string;
  name: string;
  image?: string | null;
  enrolledAt: string;
};

type StudentOption = { id: string; name: string; image?: string | null };

const apiRequest = async <T,>(
  url: string,
  method = "GET",
  body?: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch(`${API_URL}${url}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(payload?.error ?? "Request failed. Please try again.");
  return payload?.data as T;
};

const Show = () => {
  const { query } = useShow<ClassDetails>({ resource: "classes" });
  const { data: identity } = useGetIdentity<{ role?: string }>();
  const { id: routeId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const canManage = identity?.role === "admin" || identity?.role === "teacher";
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");

  const classDetails = query.data?.data;
  const { isLoading, isError } = query;

  const ownEnrollmentQuery = useQuery({
    queryKey: ["class-enrollment", routeId, identity?.role],
    queryFn: () =>
      apiRequest<{ id: number; enrolledAt: string } | null>(
        `/classes/${routeId}/enrollment`,
      ),
    enabled: Boolean(routeId && identity?.role === "student"),
  });
  const rosterQuery = useQuery({
    queryKey: ["class-enrollments", routeId],
    queryFn: () => apiRequest<Enrollment[]>(`/classes/${routeId}/enrollments`),
    enabled: Boolean(routeId && canManage),
  });
  const studentsQuery = useQuery({
    queryKey: ["enrollment-student-options"],
    queryFn: () => apiRequest<StudentOption[]>(`/users?role=student&limit=100`),
    enabled: Boolean(canManage),
  });

  const refreshEnrollmentData = async () => {
    setEnrollmentError("");
    await Promise.all([
      ownEnrollmentQuery.refetch(),
      rosterQuery.refetch(),
      query.refetch(),
      queryClient.invalidateQueries({
        queryKey: ["class-enrollments", routeId],
      }),
    ]);
  };
  const enrollMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest(`/classes/${routeId}/enrollments`, "POST", body),
    onSuccess: refreshEnrollmentData,
    onError: (error: Error) => setEnrollmentError(error.message),
  });
  const removeEnrollmentMutation = useMutation({
    mutationFn: (studentId?: string) =>
      studentId
        ? apiRequest(
            `/classes/${routeId}/enrollments/${encodeURIComponent(studentId)}`,
            "DELETE",
          )
        : apiRequest(`/classes/${routeId}/enrollment`, "DELETE"),
    onSuccess: refreshEnrollmentData,
    onError: (error: Error) => setEnrollmentError(error.message),
  });

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader
          resource="classes"
          title="Class Details"
          showEditButton={canManage}
        />
        <p className="state-message">
          {isLoading
            ? "Loading Class details..."
            : isError
            ? "Failed to load class details..."
            : "Class details not found"}
        </p>
      </ShowView>
    );
  }
  const teacherName = classDetails.teacher?.name ?? "Unknown";
  const teacherInitials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
    teacherInitials || "NA",
  )}`;

  const {
    name,
    description,
    status,
    capacity,
    bannerUrl,
    bannerCldPubId,
    subject,
    teacher,
    department,
    inviteCode,
    schedules,
    enrollmentCount = 0,
  } = classDetails;
  const capacityRatio = capacity > 0 ? enrollmentCount / capacity : 0;
  const isFull = enrollmentCount >= capacity;
  const isNearFull = capacityRatio >= 0.9;

  return (
    <ShowView className="class-view class-show">
      <ShowViewHeader
        resource="classes"
        title="Class Details"
        showEditButton={canManage}
        actionsSlot={
          canManage ? (
            <DeleteButton
              resource="classes"
              recordItemId={classDetails.id}
              size="sm"
            >
              Delete Class
            </DeleteButton>
          ) : null
        }
      />
      <div className="banner">
        {bannerCldPubId ? (
          <AdvancedImage
            alt="Class Banner"
            cldImg={bannerPhoto(bannerCldPubId, name)}
          />
        ) : bannerUrl ? (
          <img src={bannerUrl} alt="Class Banner" />
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        <div className="details-header">
          <div>
            <h1>{name}</h1>
            <p>{description}</p>
          </div>
          <div>
            <Badge variant="outline">
              {enrollmentCount} / {capacity} students
            </Badge>
            <Badge
              variant={status === "active" ? "default" : "secondary"}
              data-status={status}
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {isFull ? (
          <p
            role="status"
            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            This class has reached capacity.
          </p>
        ) : isNearFull ? (
          <p
            role="status"
            className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm"
          >
            This class is nearly full.
          </p>
        ) : null}

        {canManage && inviteCode && (
          <div className="mt-4 rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Student invite code</p>
            <p className="font-mono text-lg font-semibold tracking-wider">
              {inviteCode}
            </p>
          </div>
        )}

        {identity?.role === "student" && (
          <section className="mt-5 space-y-3 rounded-md border p-4">
            <h2 className="font-semibold">Your enrollment</h2>
            {ownEnrollmentQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                Checking enrollment…
              </p>
            ) : ownEnrollmentQuery.data ? (
              <div className="space-y-2">
                <p>You are enrolled in this class.</p>
                <Button
                  variant="outline"
                  disabled={removeEnrollmentMutation.isPending}
                  onClick={() => removeEnrollmentMutation.mutate()}
                >
                  {removeEnrollmentMutation.isPending
                    ? "Leaving…"
                    : "Leave class"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  aria-label="Class invite code"
                  placeholder="Enter invite code"
                  value={inviteCodeInput}
                  onChange={(event) =>
                    setInviteCodeInput(event.target.value.toUpperCase())
                  }
                />
                <Button
                  disabled={
                    !inviteCodeInput.trim() ||
                    enrollMutation.isPending ||
                    isFull ||
                    status !== "active"
                  }
                  onClick={() =>
                    enrollMutation.mutate({
                      inviteCode: inviteCodeInput.trim(),
                    })
                  }
                >
                  {enrollMutation.isPending ? "Joining…" : "Join class"}
                </Button>
              </div>
            )}
          </section>
        )}

        {canManage && (
          <section className="mt-5 space-y-4 rounded-md border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Enrolled students</h2>
                <p className="text-sm text-muted-foreground">
                  {enrollmentCount} of {capacity} seats used
                </p>
              </div>
              <Badge variant={isFull ? "destructive" : "secondary"}>
                {isFull ? "Full" : `${capacity - enrollmentCount} seats left`}
              </Badge>
            </div>
            {enrollmentError && (
              <p role="alert" className="text-sm text-destructive">
                {enrollmentError}
              </p>
            )}
            {rosterQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading roster…</p>
            ) : rosterQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                Could not load the enrolled students.
              </p>
            ) : rosterQuery.data?.length ? (
              <ul className="divide-y">
                {rosterQuery.data.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          student.image ||
                          `https://placehold.co/40x40?text=${encodeURIComponent(
                            student.name.slice(0, 1),
                          )}`
                        }
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Enrolled{" "}
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={removeEnrollmentMutation.isPending}
                      onClick={() =>
                        removeEnrollmentMutation.mutate(student.studentId)
                      }
                    >
                      Unenroll
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No students are enrolled yet.
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger aria-label="Select a student">
                  <SelectValue placeholder="Select student to enroll" />
                </SelectTrigger>
                <SelectContent>
                  {(studentsQuery.data ?? [])
                    .filter(
                      (student) =>
                        !rosterQuery.data?.some(
                          (enrolled) => enrolled.studentId === student.id,
                        ),
                    )
                    .map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                disabled={
                  !selectedStudentId ||
                  isFull ||
                  status !== "active" ||
                  enrollMutation.isPending
                }
                onClick={() =>
                  enrollMutation.mutate({ studentId: selectedStudentId })
                }
              >
                {enrollMutation.isPending ? "Enrolling…" : "Enroll student"}
              </Button>
            </div>
            {studentsQuery.isError && (
              <p role="alert" className="text-sm text-destructive">
                Could not load student accounts.
              </p>
            )}
          </section>
        )}

        <div className="details-grid">
          <div className="instructor">
            <p>Instructor</p>
            <div>
              <img
                src={teacher?.image || placeholderUrl}
                alt={teacherName}
                onError={(event) => {
                  if (event.currentTarget.src !== placeholderUrl) {
                    event.currentTarget.src = placeholderUrl;
                  }
                }}
              />

              <div>
                <p>{teacherName}</p>
                <p>{teacher?.email}</p>
              </div>
            </div>
          </div>

          <div className="department">
            <p>Department</p>

            <div>
              <p>{department?.name}</p>
              <p>{department?.description}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="subject">
          <p>Subject</p>

          <div>
            <Badge variant="outline">Code: {subject?.code}</Badge>
            <p>{subject?.name}</p>
            <p>{subject?.description}</p>
          </div>
        </div>

        <Separator />

        <div className="schedule">
          <h2>Schedule</h2>
          {schedules?.length ? (
            <ul>
              {schedules.map((schedule, index) => (
                <li key={`${schedule.day}-${schedule.startTime}-${index}`}>
                  {schedule.day}: {schedule.startTime}–{schedule.endTime}
                </li>
              ))}
            </ul>
          ) : (
            <p>No schedule set.</p>
          )}
        </div>

        <Separator />

        <div className="join">
          <h2>Join Class</h2>

          <ol>
            <li>Ask your teacher for the invite code</li>
            <li>Click on "Join Class" button</li>
            <li>Paste the code and click "join"</li>
          </ol>
        </div>
        <Button size="lg" className="w-full" disabled>
          Join Class
        </Button>
      </Card>
    </ShowView>
  );
};

export default Show;
