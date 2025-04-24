import { useEffect, useState } from "react";
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
import { useApi } from "@/contexts/ApiContext";
import { Product, SaleItem, StockEntry } from "@/types";
import { toast } from "sonner";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [salesHistory, setSalesHistory] = useState<SaleItem[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const { get, delete: remove } = useApi();

  const fetchProduct = async () => {
    try {
      const response = await get<Product>(`/products/${id}/`);
      setProduct(response);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const response = await get<SaleItem[]>(`/products/${id}/sales_history/`);
      setSalesHistory(response);
    } catch (error) {
      console.log("Failed to fetch Sales History:", error);
    }
  };

  const fetchStockHistory = async () => {
    try {
      const response = await get<StockEntry[]>(
        `/products/${id}/stock_history/`
      );
      setStockEntries(response);
    } catch (error) {
      console.log("Failed to fetch Stock History:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchSalesHistory();
    fetchStockHistory();
  }, [id]);

  const handleEdit = () => {
    navigate(`/products/edit/${id}`);
  };

  const confirmDelete = async () => {
    if (id) {
      await remove<Product>(`/products/${id}/`);
      toast.success(`Deleted product with ID: ${id}`);
      setShowDeleteDialog(false);
      // Refresh the products list after deletion
      navigate("/products");
    }
  };

  if (!product) return <div>Loading...</div>;

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-md aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Package className="h-24 w-24 text-gray-400" />
                )}
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
                    {product.reorder_level}). Current stock: {product.stock}.
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
                      NPR{Number(product.cost_price).toFixed(2)}
                    </div>

                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" /> Selling Price
                    </div>
                    <div className="font-medium">
                      NPR{Number(product.selling_price).toFixed(2)}
                    </div>

                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2" /> Profit Margin
                    </div>
                    <div className="font-medium">
                      {product.profit_margin?.toFixed(2)}%
                    </div>
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
                    <div className="font-medium">{product.reorder_level}</div>

                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" /> Stock Value
                    </div>
                    <div className="font-medium">
                      NPR{product.stock_value?.toFixed(2)}
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

        <Tabs defaultValue="stockHistory" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stockHistory">Stock History</TabsTrigger>
            <TabsTrigger value="salesHistory">Sales History</TabsTrigger>
          </TabsList>
          <TabsContent value="stockHistory">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movement History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Added By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockEntries.length > 0 ? (
                      stockEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {new Date(entry.date_added).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.entry_type === "purchase"
                                  ? "outline"
                                  : "secondary"
                              }
                              className={
                                entry.entry_type === "purchase"
                                  ? "bg-green-100 text-green-800"
                                  : entry.entry_type === "sale"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-orange-100 text-orange-800"
                              }
                            >
                              {entry.entry_type_display}
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
                              ? `+${entry.quantity}`
                              : entry.quantity}
                          </TableCell>
                          <TableCell>
                            {entry.unit_price
                              ? `NPR${entry.unit_price.toFixed(2)}`
                              : "-"}
                          </TableCell>
                          <TableCell>{entry.notes || "-"}</TableCell>
                          <TableCell>{entry.created_by}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No stock movement history available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="salesHistory">
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
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
                    {salesHistory.length > 0 ? (
                      salesHistory.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.id}</TableCell>
                          <TableCell>
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{sale.customer_name || "-"}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>NPR{sale.subtotal}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No sales history available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
