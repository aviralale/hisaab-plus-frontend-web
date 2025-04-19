import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HisaabPlusLogo from "@/assets/images/favicon-white.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define form validation schema
const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from registration
  const registrationMessage = location.state?.message;

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setLoginError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Login submitted with:", data);

      // API call would go here
      // Example:
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: data.email,
      //     password: data.password,
      //     remember_me: data.rememberMe
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Login failed');
      // }

      setLoginSuccess(true);

      // Redirect after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  Welcome Back
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Log in to access your financial tools, reports, and invoices.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Card className="p-4 rounded-lg text-center">
                  <h3 className="font-medium text-primary">Track Expenses</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor all your business expenditures
                  </p>
                </Card>
                <Card className="p-4 rounded-lg text-center">
                  <h3 className="font-medium text-primary">Secure Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Your financial data is always protected
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
              <h1 className="text-2xl font-bold">Sign In</h1>
              <p className="text-muted-foreground">
                Access your HisaabPlus account
              </p>
            </div>

            {/* Alerts */}
            {registrationMessage && (
              <Alert
                variant="default"
                className="border-green-500 bg-green-50 text-green-800"
              >
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <AlertDescription>{registrationMessage}</AlertDescription>
              </Alert>
            )}

            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            {loginSuccess && (
              <Alert
                variant="default"
                className="border-green-500 bg-green-50 text-green-800"
              >
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <AlertDescription>
                  Login successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="space-y-4">
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            to="/forgot-password"
                            className="text-xs text-primary hover:underline underline-offset-4"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              autoComplete="current-password"
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Remember me for 30 days
                          </FormLabel>
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
                  disabled={isSubmitting || loginSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center text-sm pt-2">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-primary hover:underline underline-offset-4"
                  >
                    Create an account
                  </Link>
                </div>
              </form>
            </Form>

            {/* Terms and Privacy */}
            <div className="text-center text-xs text-muted-foreground pt-4">
              By signing in, you agree to our{" "}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
