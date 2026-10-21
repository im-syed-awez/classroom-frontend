import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useGetIdentity } from "@refinedev/core";
import * as z from "zod";
import { departmentSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DepartmentForm({ action }: { action: "create" | "edit" }) {
  const isEdit = action === "edit";
  const { data: identity, isLoading: isLoadingIdentity } = useGetIdentity<{ role?: string }>();
  const form = useForm({ resolver: zodResolver(departmentSchema), refineCoreProps: { resource: "departments", action } });
  const { control, handleSubmit, formState: { isSubmitting }, refineCore: { onFinish } } = form;
  const onSubmit = async (values: z.infer<typeof departmentSchema>) => { await onFinish(values); };
  const View = isEdit ? EditView : CreateView;
  return (
    <View>
      <Breadcrumb />
      <h1 className="page-title">{isEdit ? "Edit Department" : "Create Department"}</h1>
      {!isLoadingIdentity && identity?.role !== "admin" ? <p role="alert">Only administrators can modify departments.</p> : null}
      <Card className="max-w-2xl"><CardHeader><CardTitle>Department information</CardTitle></CardHeader><CardContent>
        <Form {...form}><form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <FormField control={control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="Department name" /></FormControl><FormMessage /></FormItem>} />
          <FormField control={control} name="code" render={({ field }) => <FormItem><FormLabel>Code</FormLabel><FormControl><Input {...field} placeholder="DEPT-01" /></FormControl><FormMessage /></FormItem>} />
          <FormField control={control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Optional description" /></FormControl><FormMessage /></FormItem>} />
          <Button type="submit" disabled={isLoadingIdentity || identity?.role !== "admin" || isSubmitting}>{isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create department"}</Button>
        </form></Form>
      </CardContent></Card>
    </View>
  );
}