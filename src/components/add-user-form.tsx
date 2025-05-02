import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
} from "@/components/ui/select";
import { toast } from "sonner";
import { createUser } from "@/services/userApi";
import { User } from "@/types";

const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email" }),
    full_name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" }),
    phone: z.string().optional(),
    role: z.string().min(1, { message: "Please select a role" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    re_password: z.string(),
  })
  .refine((data) => data.password === data.re_password, {
    message: "Passwords don't match",
    path: ["re_password"],
  });

interface AddUserFormProps {
  businessId: number;
  onUserAdded: (user: User) => void;
}

export const AddUserForm: React.FC<AddUserFormProps> = ({
  businessId,
  onUserAdded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      full_name: "",
      phone: "",
      role: "staff",
      password: "",
      re_password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return; // Prevent multiple submissions

    try {
      setIsSubmitting(true);

      // Include all values including re_password
      const newUserData = {
        ...values,
        business: businessId,
      };

      // Call API with proper error handling
      const newUser = await createUser(newUserData).catch((error) => {
        console.error("API Error:", error);
        throw error; // Re-throw to be caught by the outer catch
      });

      // Only proceed if we have a valid response
      if (newUser) {
        toast.success(
          `User created! ${values.full_name} has been added to your business`
        );

        // Reset form after successful submission
        form.reset({
          email: "",
          full_name: "",
          phone: "",
          role: "staff",
          password: "",
          re_password: "",
        });

        // Notify parent component
        onUserAdded(newUser);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Failed to create user. Please try again.");

      // Don't reset the form on error so user can fix and retry
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission errors
  const handleError = (errors: any) => {
    console.error("Form validation errors:", errors);

    // Show a toast with the first error message
    const firstError = Object.values(errors)[0] as { message: string };
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Please fix the form errors");
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, handleError)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the appropriate role for this user
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="re_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? "Creating User..." : "Create User"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};
