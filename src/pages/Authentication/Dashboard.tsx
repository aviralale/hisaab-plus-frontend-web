// import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  BarChart3,
  Package,
  ShoppingCart,
  AlertCircle,
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

// Dummy data based on DashboardStatsSerializer
const dashboardStats = {
  total_products: 120,
  low_stock_products: 15,
  out_of_stock_products: 5,
  total_suppliers: 8,
  total_categories: 12,
  sales_today: 1250.75,
  sales_this_month: 28450.6,
  inventory_value: 45780.25,
};

// Dummy data for charts
const monthlySalesData = [
  { name: "Jan", amount: 15000 },
  { name: "Feb", amount: 18000 },
  { name: "Mar", amount: 22000 },
  { name: "Apr", amount: 20000 },
  { name: "May", amount: 25000 },
  { name: "Jun", amount: 27000 },
  { name: "Jul", amount: 26000 },
  { name: "Aug", amount: 28000 },
  { name: "Sep", amount: 25000 },
  { name: "Oct", amount: 26000 },
  { name: "Nov", amount: 28500 },
  { name: "Dec", amount: 28450 },
];

// Dummy data for recent sales
const recentSales = [
  {
    id: "S001",
    date: "2025-04-19",
    customer: "Walk-in Customer",
    amount: 250.5,
    status: "Completed",
  },
  {
    id: "S002",
    date: "2025-04-19",
    customer: "John Doe",
    amount: 525.75,
    status: "Completed",
  },
  {
    id: "S003",
    date: "2025-04-18",
    customer: "Jane Smith",
    amount: 125.0,
    status: "Completed",
  },
  {
    id: "S004",
    date: "2025-04-18",
    customer: "Mike Johnson",
    amount: 350.25,
    status: "Completed",
  },
  {
    id: "S005",
    date: "2025-04-17",
    customer: "Sarah Williams",
    amount: 450.0,
    status: "Completed",
  },
];

// Dummy data for low stock products
const lowStockProducts = [
  { id: 1, name: "Laptop HP 15", sku: "LAP-HP-15", stock: 3, reorder_point: 5 },
  { id: 2, name: "USB-C Cable", sku: "USB-C-01", stock: 4, reorder_point: 10 },
  {
    id: 3,
    name: "Wireless Mouse",
    sku: "ACC-MS-W1",
    stock: 2,
    reorder_point: 5,
  },
  { id: 5, name: "HDMI Cable 2m", sku: "HDMI-2M", stock: 0, reorder_point: 5 },
  {
    id: 4,
    name: "Keyboard Wireless",
    sku: "ACC-KB-W1",
    stock: 1,
    reorder_point: 5,
  },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR{dashboardStats.sales_this_month.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.total_products}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.low_stock_products} low stock items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR{dashboardStats.inventory_value.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {dashboardStats.total_categories} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Sales
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR{dashboardStats.sales_today.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +5% from yesterday
              </p>
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
                      data={monthlySalesData}
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
                      {recentSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">
                            {sale.id}
                          </TableCell>
                          <TableCell>{sale.customer}</TableCell>
                          <TableCell>NPR{sale.amount.toFixed(2)}</TableCell>
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
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.reorder_point}</TableCell>
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
                    data={monthlySalesData}
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
                        {dashboardStats.low_stock_products} products are below
                        reorder point
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 border rounded-lg ">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-medium">Out of Stock Alert</h3>
                      <p className="text-sm text-gray-500">
                        {dashboardStats.out_of_stock_products} products are out
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
