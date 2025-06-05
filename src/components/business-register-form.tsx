import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { registerBusiness } from "@/services/api";

// Define business types for type safety
const businessTypes = [
  "SOLE_PROPRIETORSHIP",
  "PARTNERSHIP",
  "LLC",
  "CORPORATION",
  "OTHER",
] as const;

// Define industry types
const industryValues = [
  "RETAIL",
  "FOOD_SERVICE",
  "MANUFACTURING",
  "TECHNOLOGY",
  "HEALTHCARE",
  "FINANCE",
  "REAL_ESTATE",
  "CONSTRUCTION",
  "EDUCATION",
  "OTHER",
] as const;

const currencyCodes = [
  "NPR",
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "INR",
] as const;

// Define Zod schema for form validation
const businessFormSchema = z.object({
  // Basic Info
  name: z
    .string()
    .min(2, { message: "Business name must be at least 2 characters." }),
  legalName: z.string().optional(),
  businessType: z.enum(businessTypes),
  industry: z.enum(industryValues, {
    required_error: "Please select an industry.",
  }),

  // Contact Details
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),

  // Address
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  zipCode: z
    .string()
    .min(5, { message: "Zip code must be at least 5 characters." }),
  country: z
    .string()
    .min(2, { message: "Country must be at least 2 characters." }),

  // Tax Information
  taxId: z.string().optional(),
  fiscalYearEnd: z.string().optional(),

  // Settings
  currencyCode: z.enum(currencyCodes, {
    required_error: "Please select a currency.",
  }),
  timezone: z.string().min(3, { message: "Please select a timezone." }),
  isActive: z.boolean(),

  // Terms and Privacy
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

// Infer TypeScript type from zod schema
type BusinessFormValues = z.infer<typeof businessFormSchema>;

// Industries list for dropdown
const industries = [
  { value: "RETAIL", label: "Retail" },
  { value: "FOOD_SERVICE", label: "Food Service" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "FINANCE", label: "Finance" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "EDUCATION", label: "Education" },
  { value: "OTHER", label: "Other" },
];

// Currencies list
const currencies = [
  { value: "NPR", label: "Nepali Rupees" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "INR", label: "Indian Rupee (INR)" },
];

// Timezones list (sample)
const timezones = [
  { value: "Asia/Kathmandu", label: "Kathmandu (GMT+5:45)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (GMT-5)" },
  { value: "America/Chicago", label: "Central Time (GMT-6)" },
  { value: "America/Denver", label: "Mountain Time (GMT-7)" },
  { value: "America/Los_Angeles", label: "Pacific Time (GMT-8)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

export function BusinessCreationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Initialize form with zod resolver
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      legalName: "",
      businessType: "LLC",
      industry: "RETAIL",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      taxId: "",
      fiscalYearEnd: "",
      currencyCode: "NPR",
      timezone: "Asia/Kathmandu",
      isActive: true,
      agreeToTerms: false,
    },
    mode: "onBlur",
  });

  // Form submission handler
  const onSubmit = async (data: BusinessFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare the business data
      const businessData = {
        name: data.name,
        legalName: data.legalName || data.name,
        businessType: data.businessType,
        industry: data.industry,
        contactInfo: {
          email: data.email,
          phone: data.phone,
        },
        address: {
          street: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        taxInfo: {
          taxId: data.taxId,
          fiscalYearEnd: data.fiscalYearEnd,
        },
        settings: {
          currencyCode: data.currencyCode,
          timezone: data.timezone,
          isActive: data.isActive,
        },
      };

      const response = await registerBusiness(businessData);

      console.log("Business created:", response);
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            message: "Business created successfully!",
          },
        });
      }, 2000);
    } catch (err: unknown) {
      console.error("Business creation error:", err);
      const error = err as ApiError;
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create business. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Create New Business</CardTitle>
          </div>
          <CardDescription>
            Enter your business details to get started with HisaabPlus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-500 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <AlertDescription>
                Business created successfully! Redirecting to dashboard...
                <br />
                If it doesn't redirects <Link to="/dashboard">Click here</Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic-info" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact & Address</TabsTrigger>
                  <TabsTrigger value="tax">Tax Information</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic-info" className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC Company" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name your business operates under
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ABC Corporation Ltd."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The registered legal name of your business (if
                            different)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SOLE_PROPRIETORSHIP">
                                  Sole Proprietorship
                                </SelectItem>
                                <SelectItem value="PARTNERSHIP">
                                  Partnership
                                </SelectItem>
                                <SelectItem value="LLC">LLC</SelectItem>
                                <SelectItem value="CORPORATION">
                                  Corporation
                                </SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem
                                    key={industry.value}
                                    value={industry.value}
                                  >
                                    {industry.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Contact & Address Tab */}
                <TabsContent value="contact" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Email*</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="contact@abccompany.com"
                                  {...field}
                                />
                              </div>
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
                            <FormLabel>Business Phone*</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="+1 (555) 123-4567"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">Business Address</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address*</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="123 Business Street"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City*</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province*</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zip/Postal Code*</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country*</FormLabel>
                              <FormControl>
                                <Input placeholder="United States" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tax Information Tab */}
                <TabsContent value="tax" className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID/EIN</FormLabel>
                          <FormControl>
                            <Input placeholder="12-3456789" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your business tax identification number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fiscalYearEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fiscal Year End</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            The date your fiscal year ends (MM/DD)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="currencyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Currency*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Primary currency for transactions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timezones.map((timezone) => (
                                  <SelectItem
                                    key={timezone.value}
                                    value={timezone.value}
                                  >
                                    {timezone.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Business timezone for reporting
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(!!checked)
                              }
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Activate Business</FormLabel>
                            <FormDescription>
                              Set your business as active immediately after
                              creation
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(!!checked)
                              }
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Terms and Conditions*</FormLabel>
                            <FormDescription>
                              I confirm that the information provided is
                              accurate and I agree to the{" "}
                              <a
                                href="/terms-and-conditions"
                                className="text-primary hover:underline"
                              >
                                Terms of Service
                              </a>{" "}
                              and
                              <a
                                href="/privacy-policy"
                                className="text-primary hover:underline"
                              >
                                {" "}
                                Privacy Policy
                              </a>
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || success}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Business...
              </>
            ) : (
              "Create Business"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
