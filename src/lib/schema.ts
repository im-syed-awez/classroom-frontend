import * as z from "zod";
export const facultySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "teacher", "student"], {
    required_error: "Please select a role",
  }),
  department: z.string(),
  image: z.string().optional(),
  imageCldPubId: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(3, "Subject name must be at least 3 characters"),
  code: z.string().min(5, "Subject code must be at least 5 characters"),
  description: z.string().trim().max(255).nullable().optional().or(z.literal("")),
  departmentId: z.coerce.number().int().positive("Select a department"),
});

export const departmentSchema = z.object({
  code: z.string().trim().min(1, "Department code is required").max(50),
  name: z.string().trim().min(1, "Department name is required").max(255),
  description: z.string().trim().max(255).nullable().optional().or(z.literal("")),
});

const scheduleSchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid start time"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid end time"),
}).refine((schedule) => schedule.startTime < schedule.endTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const classSchema = z.object({
  name: z
    .string()
    .min(2, "Class name must be at least 2 characters")
    .max(50, "Class name must be at most 50 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .min(5, "Description must be at least 5 characters"),
  subjectId: z.coerce
    .number({
      required_error: "Subject is required",
      invalid_type_error: "Subject is required",
    })
    .min(1, "Subject is required"),
  teacherId: z.string().optional(),
  capacity: z.coerce
    .number({
      required_error: "Capacity is required",
      invalid_type_error: "Capacity is required",
    })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),
  status: z.enum(["active", "inactive", "archived"]),
  bannerUrl: z.string().optional().or(z.literal("")),
  bannerCldPubId: z.string().optional().or(z.literal("")),
  inviteCode: z.string().optional(),
  schedules: z.array(scheduleSchema).optional(),
});

export const enrollmentSchema = z.object({
  classId: z.coerce
    .number({
      required_error: "Class ID is required",
      invalid_type_error: "Class ID is required",
    })
    .min(1, "Class ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
});
