import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useBack, useGetIdentity, useList } from "@refinedev/core";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useFieldArray } from "react-hook-form";
import { classSchema } from "@/lib/schema.ts";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Loader2 } from "lucide-react";
import UploadWidget from "@/components/upload-widget";
import { Subject, User, UploadWidgetValue } from "@/types";

export const ClassForm = ({ action }: { action: "create" | "edit" }) => {
  const isEdit = action === "edit";
  const back = useBack();
  const { data: identity } = useGetIdentity<{ id?: string; role?: string }>();

  const form = useForm({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: "classes",
      action,
    }
  });

  const {
    refineCore: {onFinish},
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = form;

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control,
    name: "schedules",
  });

  const onSubmit = async (values: z.infer<typeof classSchema>) => {
    try {
      await onFinish({
        ...values,
        teacherId: identity?.role === "teacher" ? identity.id : values.teacherId,
      });
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };
  const {query: subjectsQuery } = useList<Subject>({
    resource: 'subjects',
    pagination: {
      pageSize: 100
    }

  })
  const {query: teachersQuery } = useList<User>({
    resource: 'users',
    filters:[
      { field: 'role', operator: 'eq', value: 'teacher' },
    ],
    pagination: {
      pageSize: 100
    }
  })

  const subjects = subjectsQuery?.data?.data || [];
  const subjectsLoading = subjectsQuery.isLoading;

  const teachers = identity?.role === "admin" ? teachersQuery?.data?.data || [] : [];
  const teachersLoading = identity?.role === "admin" && teachersQuery.isLoading;

  const bannerPublicId = form.watch('bannerCldPubId');
  const setBannerImage = (file: UploadWidgetValue | null, field: { onChange: (value: string) => void }) => {
    if(file){
      field.onChange(file.url);
      form.setValue('bannerCldPubId', file.publicId, {
        //It re-runs zod validation after we submit it.
        shouldValidate: true,
        // This will mark the form as modified as soon as the image is uploaded.
        shouldDirty: true,
      })

    } else {
      field.onChange('');
      form.setValue('bannerCldPubId', '', {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }  

  return (
    <div className="class-view">
      <Breadcrumb />

      <h1 className="page-title">{isEdit ? "Edit a Class" : "Create a Class"}</h1>
      <div className="intro-row">
        <p>{isEdit ? "Update the class details, schedule, and capacity." : "Provide the required information below to add a class."}</p>
        <Button onClick={() => back()}>Go Back</Button>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
              Fill out form
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField 
                  control={control}
                  name="bannerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image <span className="text-orange-600">*</span></FormLabel>
                      <FormControl>
                        <UploadWidget
                          value={field.value ? { url: field.value, publicId: bannerPublicId ?? ''} :null}
                          onChange={(file) =>
                            setBannerImage(file, field)}
                        />
                      </FormControl>
                      <FormMessage />
                      {errors.bannerCldPubId && !errors.bannerUrl && (
                        <p className="text-destructive text-sm">
                          {errors.bannerCldPubId.message?.toString()}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Class Name <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Introduction to Biology - Section A"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Subject <span className="text-orange-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                          disabled={subjectsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem
                                key={subject.id}
                                value={subject.id.toString()}
                              >
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {identity?.role === "admin" && <FormField
                    control={control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Teacher <span className="text-orange-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={teachersLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem
                                key={teacher.id}
                                value={teacher.id.toString()}
                              >
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
                            value={(field.value as number | undefined) ?? ""}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEdit && <FormField
                    control={control}
                    name="status"
                    disabled={identity?.role !== "admin"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Status <span className="text-orange-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            {identity?.role === "admin" && <SelectItem value="archived">Archived</SelectItem>}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />}
                </div>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description about the class"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">Class schedule</h2>
                      <p className="text-sm text-muted-foreground">Optional meeting days and times.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => appendSchedule({ day: "Monday", startTime: "09:00", endTime: "10:00" })}>Add schedule</Button>
                  </div>
                  {scheduleFields.map((schedule, index) => (
                    <div key={schedule.id} className="grid grid-cols-1 items-end gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                      <FormField control={control} name={`schedules.${index}.day`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={control} name={`schedules.${index}.startTime`} render={({ field }) => <FormItem><FormLabel>Start time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={control} name={`schedules.${index}.endTime`} render={({ field }) => <FormItem><FormLabel>End time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
                      <Button type="button" variant="destructive" onClick={() => removeSchedule(index)}>Remove</Button>
                    </div>
                  ))}
                </section>

                <Separator />

                <Button type="submit" size="lg" className="w-full">
                  {isSubmitting ? (
                    <div className="flex gap-1">
                      <span>{isEdit ? "Saving Class..." : "Creating Class..."}</span>
                      <Loader2 className="inline-block ml-2 animate-spin" />
                    </div>
                  ) : (
                    isEdit ? "Save Class" : "Create Class"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function Create() {
  return <ClassForm action="create" />;
}
