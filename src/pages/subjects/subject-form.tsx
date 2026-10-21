import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useGetIdentity, useList } from "@refinedev/core";
import * as z from "zod";
import { subjectSchema } from "@/lib/schema";
import type { Department } from "@/types";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function SubjectForm({ action }: { action: "create" | "edit" }) {
  const isEdit = action === "edit";
  const { data: identity, isLoading: isLoadingIdentity } = useGetIdentity<{ role?: string }>();
  const form = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: "", code: "", description: "" },
    refineCoreProps: { resource: "subjects", action },
  });
  const { query } = useList<Department>({ resource: "departments", pagination: { pageSize: 100 } });
  const departments = query.data?.data ?? [];
  const View = isEdit ? EditView : CreateView;
  const { control, handleSubmit, formState: { isSubmitting }, refineCore: { onFinish } } = form;
  const onSubmit = async (values: z.infer<typeof subjectSchema>) => { await onFinish(values); };

  return (
    <View>
      <Breadcrumb />
      <h1 className="page-title">{isEdit ? "Edit Subject" : "Create Subject"}</h1>
      {!isLoadingIdentity && identity?.role !== "admin" ? <p role="alert">Only administrators can modify subjects.</p> : null}
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Subject information</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <FormField control={control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="Subject name" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Code</FormLabel><FormControl><Input {...field} placeholder="SUB-101" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={control} name="departmentId" render={({ field }) => (
                <FormItem><FormLabel>Department</FormLabel>
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))} disabled={query.isLoading}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                    <SelectContent>{departments.map((department) => <SelectItem key={department.id} value={department.id.toString()}>{department.name} ({department.code})</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Brief subject description" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={isLoadingIdentity || identity?.role !== "admin" || isSubmitting || query.isLoading || departments.length === 0}>
                {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create subject"}
              </Button>
              {!query.isLoading && departments.length === 0 && <p className="text-sm text-destructive">Create a department before adding subjects.</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </View>
  );
}