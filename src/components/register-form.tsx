import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HisaabPlusLogo from "@/assets/images/favicon-white.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";

// Define form validation schema with stronger validation
const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Name must be at least 2 characters." })
      .max(50, { message: "Name must be less than 50 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z
      .string()
      .min(10, { message: "Please enter a valid phone number." })
      .max(15, { message: "Phone number is too long." })
      .refine((val) => /^[+]?[\d\s()-]+$/.test(val), {
        message: "Please enter a valid phone number format.",
      }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter.",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter.",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number.",
      })
      .refine((val) => /[^A-Za-z0-9]/.test(val), {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z.string(),
    businessName: z
      .string()
      .min(1, { message: "Business name is required." })
      .optional()
      .or(z.literal("")),
    businessAddress: z
      .string()
      .min(1, { message: "Business address is required." })
      .optional()
      .or(z.literal("")),
    role: z.enum(["STAFF", "ACCOUNTANT", "OWNER"], {
      message: "Please select a valid role.",
    }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Define the PasswordInput component with proper TypeScript types
interface PasswordInputProps {
  field: {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
  showPassword: boolean;
  togglePassword: () => void;
  placeholder?: string;
  autoComplete?: string;
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      businessAddress: "",
      role: "STAFF",
      agreeToTerms: false,
    },
    mode: "onBlur", // Validate on blur for better user experience
  });

  const watchRole = form.watch("role");

  // Effect to make business creation mandatory for owners
  useEffect(() => {
    if (watchRole === "OWNER") {
      setIsCreatingBusiness(true);
    }
  }, [watchRole]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setRegistrationError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Form submitted with:", {
        ...data,
        business: isCreatingBusiness
          ? {
              name: data.businessName,
              address: data.businessAddress,
            }
          : null,
      });

      // API call would go here
      // Example:
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     full_name: data.fullName,
      //     email: data.email,
      //     phone: data.phone,
      //     password: data.password,
      //     business: isCreatingBusiness ? {
      //       name: data.businessName,
      //       address: data.businessAddress
      //     } : null,
      //     role: data.role
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Registration failed');
      // }

      setRegistrationSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please sign in with your credentials.",
          },
        });
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationError(
        error instanceof Error
          ? error.message
          : "An error occurred during registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password input with toggle visibility button
  const PasswordInput: React.FC<PasswordInputProps> = ({
    field,
    showPassword,
    togglePassword,
    placeholder = "••••••••",
    autoComplete = "new-password",
  }) => (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        {...field}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
        onClick={togglePassword}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  // Function to validate business fields based on conditions
  const validateBusinessFields = (): boolean => {
    if (watchRole === "OWNER" || isCreatingBusiness) {
      if (
        !form.getValues("businessName") ||
        !form.getValues("businessAddress")
      ) {
        form.setError("businessName", {
          type: "manual",
          message: "Business name is required when creating a business.",
        });
        form.setError("businessAddress", {
          type: "manual",
          message: "Business address is required when creating a business.",
        });
        return false;
      }
    }
    return true;
  };

  // Enhanced submit handler with additional validation
  const handleSubmit = form.handleSubmit((data) => {
    // Perform additional validation if needed
    if (validateBusinessFields()) {
      onSubmit(data);
    }
  });

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)} {...props}>
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0 grid md:grid-cols-2">
          {/* Brand Section - Hidden on mobile */}
          <div className="bg-primary/5 relative hidden md:flex flex-col justify-center items-center p-8">
            <div className="text-center space-y-6">
              <img
                src={HisaabPlusLogo}
                alt="HisaabPlus Logo"
                className="w-48 h-auto mx-auto mb-6"
              />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-primary">
                  Manage Your Finances
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  HisaabPlus helps you track expenses, create invoices, and
                  generate financial reports with ease.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Card className=" p-4 rounded-lg text-center">
                  <h3 className="font-medium text-primary">Easy Invoicing</h3>
                  <p className="text-sm text-muted-foreground">
                    Create professional invoices in seconds
                  </p>
                </Card>
                <Card className=" p-4 rounded-lg text-center">
                  <h3 className="font-medium text-primary">
                    Financial Reports
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get insights with detailed reports
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col items-center text-center mb-4">
              {/* Logo visible only on mobile */}
              <div className="md:hidden mb-4">
                <img
                  src={HisaabPlusLogo}
                  alt="HisaabPlus Logo"
                  className="w-32 h-auto"
                />
              </div>
              <h1 className="text-2xl font-bold">Create Your Account</h1>
              <p className="text-muted-foreground">
                Join HisaabPlus to manage your business finances
              </p>
            </div>

            {/* Alerts */}
            {registrationError && (
              <Alert variant="destructive">
                <AlertDescription>{registrationError}</AlertDescription>
              </Alert>
            )}

            {registrationSuccess && (
              <Alert
                variant="default"
                className="border-green-500 bg-green-50 text-green-800"
              >
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <AlertDescription>
                  Registration successful! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground tracking-wide">
                      Personal Information
                    </h3>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              autoComplete="name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                {...field}
                                autoComplete="email"
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 123-4567"
                                {...field}
                                autoComplete="tel"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Account Security Section */}
                  <div className="space-y-4 pt-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground tracking-wide">
                      Account Security
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <PasswordInput
                                field={field}
                                showPassword={showPassword}
                                togglePassword={() =>
                                  setShowPassword(!showPassword)
                                }
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              8+ chars with uppercase, lowercase, number &
                              special char
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <PasswordInput
                                field={field}
                                showPassword={showConfirmPassword}
                                togglePassword={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              8+ chars with uppercase, lowercase, number &
                              special char
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Business Information Section */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm uppercase text-muted-foreground tracking-wide">
                        Business Information
                      </h3>

                      {watchRole !== "OWNER" && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="createBusiness"
                            checked={isCreatingBusiness}
                            onCheckedChange={(checked) =>
                              setIsCreatingBusiness(checked === true)
                            }
                          />
                          <Label
                            htmlFor="createBusiness"
                            className="text-sm font-normal cursor-pointer"
                          >
                            I want to create a business
                          </Label>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="STAFF">
                                Business Staff
                              </SelectItem>
                              <SelectItem value="ACCOUNTANT">
                                Business Accountant
                              </SelectItem>
                              <SelectItem value="OWNER">
                                Business Owner
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            {watchRole === "OWNER"
                              ? "As a business owner, you'll need to provide business details."
                              : "Select the role that best describes your position."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isCreatingBusiness && (
                      <div className="space-y-4 rounded-md bg-muted/30 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="ABC Company" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="businessAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="123 Main St, City"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            <p>
                              I agree to the{" "}
                              <Link
                                to="/terms"
                                className="text-primary hover:underline underline-offset-4"
                              >
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link
                                to="/privacy"
                                className="text-primary hover:underline underline-offset-4"
                              >
                                Privacy Policy
                              </Link>
                              .
                            </p>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || registrationSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm pt-2">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
