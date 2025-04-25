import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Package,
  AlertCircle,
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
          <ArrowUpIcon className="w-3 h-3 text-green-500" />
          <span className="text-green-500">+{displayValue}%</span>
        </>
      )}
      {isNegative && (
        <>
          <ArrowDownIcon className="w-3 h-3 text-red-500" />
          <span className="text-red-500">-{displayValue}%</span>
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  const fetchDashboard = async () => {
    try {
      const response = await get("/dashboard/");
      setDashboardData(response.dashboard_stats);
    } catch (error) {
      console.log(error);
    }
  };

  if (!dashboardData) {
    return <Loader />;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold tracking-tight">
          {dashboardData.business_name}
        </h1>
        {/* Stats Cards - Now all using unified Card component structure */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.total_products}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.low_stock_count} low stock items
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Inventory Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR {dashboardData.inventory_value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {dashboardData.total_categories} categories
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Today's Sales */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Sales
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Sales Chart */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData.monthly_sales_data}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Sales */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.recent_sales.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No recent sales.
                    </p>
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
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">
                              {sale.id}
                            </TableCell>
                            <TableCell>{sale.customer}</TableCell>
                            <TableCell>NPR {sale.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800"
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
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.low_stock_products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No products are currently low in stock.
                  </p>
                ) : (
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
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>{product.reorder_level}</TableCell>
                          <TableCell>
                            {product.stock === 0 ? (
                              <Badge
                                variant="destructive"
                                className="bg-red-100 text-red-800"
                              >
                                Out of Stock
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800"
                              >
                                Low Stock
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.monthly_sales_data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-4 border rounded-lg">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Low Stock Alert</h3>
                      <p className="text-sm text-gray-500">
                        {dashboardData.low_stock_count} products are below
                        reorder point
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 border rounded-lg ">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Out of Stock Alert</h3>
                      <p className="text-sm text-gray-500">
                        {dashboardData.out_of_stock_products} products are out
                        of stock
                      </p>
                    </div>
                  </div>
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
