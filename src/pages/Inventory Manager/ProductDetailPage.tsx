// src/pages/products/ProductDetailPage.tsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Tag,
  BarChart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DashboardLayout from "@/components/layouts/DashboardLayout";

type StockEntry = {
  id: number;
  date: string;
  quantity: number;
  type: "Purchase" | "Sale";
  supplier?: string;
  user: string;
};

type SaleEntry = {
  id: string;
  date: string;
  quantity: number;
  amount: number;
  customer: string;
};

type Product = {
  id: number;
  name: string;
  sku: string;
  description: string;
  image: string;
  category: number;
  category_name: string;
  supplier: number;
  supplier_name: string;
  stock: number;
  cost_price: number;
  selling_price: number;
  profit_margin: string;
  stock_value: number;
  needs_reorder: boolean;
  reorder_point: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Dummy product data
const product: Product = {
  id: 3,
  name: "USB-C Cable",
  sku: "USB-C-01",
  description:
    "Premium USB-C Cable with fast charging capability and data transfer speeds up to 10 Gbps.",
  image: "https://placeholder.com/300",
  category: 2,
  category_name: "Accessories",
  supplier: 3,
  supplier_name: "Anker",
  stock: 4,
  cost_price: 5.0,
  selling_price: 12.5,
  profit_margin: "150%",
  stock_value: 20.0,
  needs_reorder: true,
  reorder_point: 10,
  is_active: true,
  created_at: "2024-12-10T15:30:00Z",
  updated_at: "2025-04-10T09:15:00Z",
};

// Dummy history data
const stockHistory: StockEntry[] = [
  {
    id: 1,
    date: "2025-04-10",
    quantity: 20,
    type: "Purchase",
    supplier: "Anker",
    user: "John Doe",
  },
  {
    id: 2,
    date: "2025-04-12",
    quantity: -5,
    type: "Sale",
    user: "Sarah Smith",
  },
  {
    id: 3,
    date: "2025-04-15",
    quantity: -11,
    type: "Sale",
    user: "Mike Johnson",
  },
];

const salesHistory: SaleEntry[] = [
  {
    id: "S001",
    date: "2025-04-15",
    quantity: 3,
    amount: 37.5,
    customer: "Walk-in Customer",
  },
  {
    id: "S002",
    date: "2025-04-14",
    quantity: 5,
    amount: 62.5,
    customer: "Tech Solutions Inc.",
  },
  {
    id: "S003",
    date: "2025-04-12",
    quantity: 3,
    amount: 37.5,
    customer: "Jane Smith",
  },
];

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    navigate(`/products/edit/NPR{id}`);
  };

  const confirmDelete = () => {
    console.log(`Deleting product with ID: NPR{id}`);
    setShowDeleteDialog(false);
    navigate("/products");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/products")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <Badge
              variant={product.is_active ? "outline" : "secondary"}
              className={product.is_active ? "bg-green-100 text-green-800" : ""}
            >
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Product Image & Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-md aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
              <div className="grid grid-cols-2 gap-2 w-full text-sm">
                <span className="font-medium">SKU:</span>
                <span>{product.sku}</span>
                <span className="font-medium">Category:</span>
                <span>{product.category_name}</span>
                <span className="font-medium">Supplier:</span>
                <span>{product.supplier_name}</span>
                <span className="font-medium">Created:</span>
                <span>{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Stats & Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.needs_reorder && (
                <Alert variant="destructive">
                  <AlertTitle className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Low Stock Alert
                  </AlertTitle>
                  <AlertDescription>
                    This product is below the reorder point (
                    {product.reorder_point}). Current stock: {product.stock}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Pricing
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" /> Cost Price
                    </div>
                    <div className="font-medium">
                      NPR{product.cost_price.toFixed(2)}
                    </div>

                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" /> Selling Price
                    </div>
                    <div className="font-medium">
                      NPR{product.selling_price.toFixed(2)}
                    </div>

                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2" /> Profit Margin
                    </div>
                    <div className="font-medium">{product.profit_margin}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Inventory
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" /> Current Stock
                    </div>
                    <div className="font-medium">{product.stock}</div>

                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2" /> Reorder Point
                    </div>
                    <div className="font-medium">{product.reorder_point}</div>

                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" /> Stock Value
                    </div>
                    <div className="font-medium">
                      NPR{product.stock_value.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stockHistory" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stockHistory">Stock History</TabsTrigger>
            <TabsTrigger value="salesHistory">Sales History</TabsTrigger>
          </TabsList>
          <TabsContent value="stockHistory">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movement History</CardTitle>
                <CardDescription>
                  Complete history of stock movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.type === "Purchase"
                                ? "outline"
                                : "secondary"
                            }
                            className={
                              entry.type === "Purchase"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={
                            entry.quantity < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {entry.quantity > 0
                            ? `+NPR{entry.quantity}`
                            : entry.quantity}
                        </TableCell>
                        <TableCell>{entry.supplier || "-"}</TableCell>
                        <TableCell>{entry.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="salesHistory">
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>
                  Record of all sales transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.id}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>NPR{sale.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{product.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProductDetailPage;
