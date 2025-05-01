import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Package,
  AlertCircle,
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  ShoppingBag,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { DashboardTypes } from "@/types";
import Loader from "@/components/loader";
import { Link } from "react-router-dom";

interface PercentageChangeIndicatorProps {
  change: number;
  timeframe: string;
}

const PercentageChangeIndicator = ({
  change,
  timeframe,
}: PercentageChangeIndicatorProps) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const displayValue = Math.abs(change);

  return (
    <p className="text-xs flex items-center gap-1">
      {isPositive && (
        <>
          <ArrowUpIcon className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-500 font-medium">+{displayValue}%</span>
        </>
      )}
      {isNegative && (
        <>
          <ArrowDownIcon className="w-3 h-3 text-rose-500" />
          <span className="text-rose-500 font-medium">-{displayValue}%</span>
        </>
      )}
      {!isPositive && !isNegative && <span className="text-gray-500">0%</span>}
      <span className="text-muted-foreground ml-1">from {timeframe}</span>
    </p>
  );
};

const Dashboard = () => {
  const { get } = useApi();
  const { isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardTypes | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await get("/dashboard/");
      setDashboardData(response.dashboard_stats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  // Get current date for dashboard
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header with business name and date */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {dashboardData.business_name}
            </h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" /> {currentDate}
            </p>
          </div>
          <div className="mt-3 md:mt-0">
            <button
              onClick={fetchDashboard}
              className="flex items-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <TrendingUp className="h-4 w-4 mr-2" /> Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Revenue */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <CardDescription>Monthly revenue</CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR {dashboardData.sales_this_month.toLocaleString()}
              </div>
              <PercentageChangeIndicator
                change={dashboardData.percentage_increase_from_30_days_ago}
                timeframe="last month"
              />
            </CardContent>
          </Card>

          {/* Card 2: Products */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <CardDescription>Total inventory items</CardDescription>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.total_products}
              </div>
              <p className="text-xs flex items-center text-muted-foreground">
                <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                {dashboardData.low_stock_count} items need attention
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Inventory Value */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Inventory Value
                </CardTitle>
                <CardDescription>Total asset value</CardDescription>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR {dashboardData.inventory_value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {dashboardData.total_categories} product categories
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Today's Sales */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Today's Sales
                </CardTitle>
                <CardDescription>Daily performance</CardDescription>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR {dashboardData.sales_today.toLocaleString()}
              </div>
              <PercentageChangeIndicator
                change={dashboardData.percentage_increase_from_yesterday}
                timeframe="yesterday"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="overview" className="text-center">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-center">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-center">
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Sales Chart */}
              <Card className="col-span-1 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dashboardData.monthly_sales_data}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorAmount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Sales */}
              <Card className="col-span-1 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest sales activities</CardDescription>
                  </div>
                  <Link
                    to="/sales"
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                </CardHeader>
                <CardContent>
                  {dashboardData.recent_sales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        No recent sales to display.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.recent_sales.map((sale) => (
                          <TableRow key={sale.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              #{sale.id}
                            </TableCell>
                            <TableCell>{sale.customer}</TableCell>
                            <TableCell>
                              NPR {sale.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200"
                              >
                                {sale.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alerts */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>
                    Items that need ordering soon
                  </CardDescription>
                </div>
                <Link
                  to="/products?needs_reorder=true&page=1"
                  className="text-sm text-primary hover:underline"
                >
                  Manage inventory
                </Link>
              </CardHeader>
              <CardContent>
                {dashboardData.low_stock_products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      All products are well-stocked. No alerts at this time.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Reorder Point</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.low_stock_products.map((product) => (
                          <TableRow
                            key={product.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell className="font-medium">
                              {product.stock === 0 ? (
                                <span className="text-red-600">
                                  {product.stock}
                                </span>
                              ) : (
                                <span className="text-amber-600">
                                  {product.stock}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{product.reorder_level}</TableCell>
                            <TableCell>
                              {product.stock === 0 ? (
                                <Badge
                                  variant="destructive"
                                  className="bg-red-50 text-red-700 border-red-200"
                                >
                                  Out of Stock
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-50 text-amber-700 border-amber-200"
                                >
                                  Low Stock
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-5">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>
                  Performance breakdown by month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.monthly_sales_data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-5">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>
                  Inventory situations that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link
                    to="/products?needs_reorder=true&page=1"
                    className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="p-3 bg-amber-100 rounded-full mr-4 group-hover:bg-amber-200 transition-colors">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Low Stock Alert</h3>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData.low_stock_count} products are below
                        reorder point and need attention
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                        {dashboardData.low_stock_count} Items
                      </Badge>
                    </div>
                  </Link>

                  <Link
                    to="/products?stock=0&page=1"
                    className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="p-3 bg-red-100 rounded-full mr-4 group-hover:bg-red-200 transition-colors">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        Out of Stock Alert
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData.out_of_stock_products} products are
                        completely out of stock and need immediate action
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="destructive">
                        {dashboardData.out_of_stock_products} Items
                      </Badge>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
