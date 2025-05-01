import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/contexts/ApiContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, CreditCard, AlertCircle } from "lucide-react";

export function BillingPage() {
  const { user } = useAuth();
  const { get } = useApi();
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    // Fetch billing information
    get(`/api/users/${user?.id}/billing`);
  }, [user?.id, get]);

  useEffect(() => {
    if (billingData) {
      setSelectedPlan(billingData.currentPlan || "free");
    }
  }, [billingData]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">
            Loading billing information...
          </p>
        </div>
      </div>
    );
  }

  const mockPlans = [
    {
      id: "free",
      name: "Free Plan",
      price: 0,
      billing: "monthly",
      features: ["5 Team Members", "2GB Storage", "Basic Support", "1 Project"],
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: 12,
      billing: "monthly",
      features: [
        "Unlimited Team Members",
        "20GB Storage",
        "Priority Support",
        "10 Projects",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: 49,
      billing: "monthly",
      features: [
        "Unlimited Team Members",
        "Unlimited Storage",
        "24/7 Support",
        "Unlimited Projects",
      ],
    },
  ];

  const mockInvoices = [
    { id: "INV-001", date: "2025-03-27", amount: 12.0, status: "Paid" },
    { id: "INV-002", date: "2025-02-27", amount: 12.0, status: "Paid" },
    { id: "INV-003", date: "2025-01-27", amount: 12.0, status: "Paid" },
    { id: "INV-004", date: "2024-12-27", amount: 12.0, status: "Paid" },
    { id: "INV-005", date: "2024-11-27", amount: 12.0, status: "Paid" },
  ];

  const usageData = billingData?.usage || {
    storage: { used: 1.2, total: 2 },
    projects: { used: 1, total: 1 },
    teamMembers: { used: 3, total: 5 },
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load billing information. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your subscription details and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold">
                      {(billingData?.currentPlan === "pro" && "Pro Plan") ||
                        (billingData?.currentPlan === "enterprise" &&
                          "Enterprise Plan") ||
                        "Free Plan"}
                    </h3>
                    <p className="text-muted-foreground">
                      {billingData?.nextBillingDate
                        ? `Next billing date: ${formatDate(
                            billingData.nextBillingDate
                          )}`
                        : "No billing cycle"}
                    </p>
                  </div>
                  <Button variant="outline">Change Plan</Button>
                </div>

                <Separator className="my-6" />

                <h3 className="text-lg font-medium mb-4">Resource Usage</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Storage</span>
                      <span className="text-sm text-muted-foreground">
                        {usageData.storage.used}GB of {usageData.storage.total}
                        GB
                      </span>
                    </div>
                    <Progress
                      value={
                        (usageData.storage.used / usageData.storage.total) * 100
                      }
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Team Members</span>
                      <span className="text-sm text-muted-foreground">
                        {usageData.teamMembers.used} of{" "}
                        {usageData.teamMembers.total} members
                      </span>
                    </div>
                    <Progress
                      value={
                        (usageData.teamMembers.used /
                          usageData.teamMembers.total) *
                        100
                      }
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Projects</span>
                      <span className="text-sm text-muted-foreground">
                        {usageData.projects.used} of {usageData.projects.total}{" "}
                        projects
                      </span>
                    </div>
                    <Progress
                      value={
                        (usageData.projects.used / usageData.projects.total) *
                        100
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Your current billing cycle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Plan</span>
                    <span className="font-medium">
                      {formatCurrency(billingData?.currentCost || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Add-ons</span>
                    <span className="font-medium">
                      {formatCurrency(billingData?.addOns || 0)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">
                      {formatCurrency(
                        (billingData?.currentCost || 0) +
                          (billingData?.addOns || 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Billing Period
                    </span>
                    <span>Monthly</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Billing</span>
                    <span>
                      {formatDate(billingData?.nextBillingDate || new Date())}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Update Payment Details</Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your recent billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(billingData?.invoices || mockInvoices)
                      .slice(0, 3)
                      .map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.id}
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status === "Paid"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  View All Invoices
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`col-span-1 ${
                  selectedPlan === plan.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-muted-foreground">/ month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 mr-2 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={selectedPlan === plan.id ? "secondary" : "default"}
                  >
                    {selectedPlan === plan.id ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 mr-4" />
                      <div>
                        <h3 className="font-medium">Visa ending in 4242</h3>
                        <p className="text-sm text-muted-foreground">
                          Expires 09/2026
                        </p>
                      </div>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Add New Payment Method
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" placeholder="John Doe" />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <Label htmlFor="expiryMonth">Expiry Month</Label>
                        <Select defaultValue="01">
                          <SelectTrigger id="expiryMonth">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(12)].map((_, i) => {
                              const month = (i + 1).toString().padStart(2, "0");
                              return (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="expiryYear">Expiry Year</Label>
                        <Select defaultValue="2025">
                          <SelectTrigger id="expiryYear">
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(10)].map((_, i) => {
                              const year = (2025 + i).toString();
                              return (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" maxLength={4} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billingAddress">Billing Address</Label>
                      <Input id="billingAddress" placeholder="123 Main St" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="New York" />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="NY" />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input id="zipCode" placeholder="10001" />
                      </div>
                    </div>

                    <Button className="w-full md:w-auto">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="year">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(billingData?.invoices || mockInvoices).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "Paid" ? "outline" : "secondary"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-center space-x-2 py-4">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
