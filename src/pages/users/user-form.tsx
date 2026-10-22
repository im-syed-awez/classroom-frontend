import { zodResolver } from "@hookform/resolvers/zod";
import { useGetIdentity } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import * as z from "zod";
import { userAdminSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UserForm({ action }: { action: "create" | "edit" }) {
  const isEdit = action === "edit";
  const { data: identity, isLoading: identityLoading } = useGetIdentity<{ role?: string }>();
  const form = useForm({ resolver: zodResolver(userAdminSchema), refineCoreProps: { resource: "users", action } });
  const { control, handleSubmit, formState: { isSubmitting }, refineCore: { onFinish } } = form;
  const onSubmit = async (values: z.infer<typeof userAdminSchema>) => {
    const { password, ...userData } = values;
    await onFinish(isEdit ? userData : { ...userData, password });
  };
  const View = isEdit ? EditView : CreateView;

  if (identityLoading) return <p>Checking permissions…</p>;
  if (identity?.role !== "admin") return <p role="alert">Only administrators can manage user accounts.</p>;

  return <View>
    <Breadcrumb />
    <h1 className="page-title">{isEdit ? "Edit user" : "Create user"}</h1>
    <Card className="max-w-2xl"><CardHeader><CardTitle>User account</CardTitle></CardHeader><CardContent>
      <Form {...form}><form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField control={control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} autoComplete="name" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" autoComplete="email" /></FormControl><FormMessage /></FormItem>} />
        <FormField control={control} name="role" render={({ field }) => <FormItem><FormLabel>Role</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="teacher">Teacher</SelectItem><SelectItem value="student">Student</SelectItem></SelectContent></Select><FormMessage /></FormItem>} />
        {!isEdit && <FormField control={control} name="password" render={({ field }) => <FormItem><FormLabel>Temporary password</FormLabel><FormControl><Input {...field} type="password" autoComplete="new-password" /></FormControl><p className="text-xs text-muted-foreground">The user can sign in with this initial password. It is not displayed again.</p><FormMessage /></FormItem>} />}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : isEdit ? "Save user" : "Create user"}</Button>
      </form></Form>
    </CardContent></Card>
  </View>;
}