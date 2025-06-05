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
  AlertCircle,
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
import { SaleItem } from "@/types";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { Product, StockBatch } from "@/types/product";

// Sub-components with proper TypeScript interfaces
interface ProductImageProps {
  product: Product;
}

const ProductImage: React.FC<ProductImageProps> = ({ product }) => (
  <Card>
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
        <span>{product.category_name || "Not categorized"}</span>
        <span className="font-medium">Supplier:</span>
        <span>{product.supplier_name || "No supplier"}</span>
        <span className="font-medium">Created:</span>
        <span>{new Date(product.created_at).toLocaleDateString()}</span>
      </div>
    </CardFooter>
  </Card>
);

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => (
  <Card>
    <CardHeader>
      <CardTitle>Product Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {product.stock <= product.reorder_level && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            This product is below the reorder point ({product.reorder_level}{" "}
            {product.unit}).
            <br />
            Current stock: {product.stock} {product.unit}.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Pricing</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" /> Cost Price
            </div>
            <div className="font-medium">
              NPR{" "}
              {Number(product.average_cost_price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Selling Price
            </div>
            <div className="font-medium">
              NPR{" "}
              {Number(product.suggested_selling_price).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </div>

            <div className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" /> Profit Margin
            </div>
            <div className="font-medium">
              {(
                ((product.suggested_selling_price -
                  product.average_cost_price) /
                  product.average_cost_price) *
                100
              ).toFixed(2)}
              %
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
            <div className="font-medium">
              {product.stock} {product.unit}
            </div>

            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2" /> Reorder Point
            </div>
            <div className="font-medium">
              {product.reorder_level} {product.unit}
            </div>

            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" /> Stock Value
            </div>
            <div className="font-medium">
              NPR{" "}
              {product.total_stock_value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Description
        </h3>
        <p className="text-sm">
          {product.description || "No description available"}
        </p>
      </div>
    </CardContent>
  </Card>
);

interface StockHistoryTabProps {
  stockBatches: StockBatch[];
}

const StockHistoryTab: React.FC<StockHistoryTabProps> = ({ stockBatches }) => (
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
            <TableHead>Cost/Unit</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Profit/Unit</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockBatches.length > 0 ? (
            stockBatches.map((batch) => (
              <TableRow key={batch.batch_id}>
                <TableCell>
                  {new Date(batch.entry_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      batch.entry_type === "purchase"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {batch.entry_type}
                  </Badge>
                </TableCell>
                <TableCell>{batch.quantity_remaining}</TableCell>
                <TableCell>
                  NPR{" "}
                  {Number(batch.cost_per_unit).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  NPR{" "}
                  {Number(batch.selling_price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-green-600">
                  NPR{" "}
                  {batch.profit_per_unit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  NPR{" "}
                  {batch.total_batch_value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>{batch.invoice_number || "-"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No stock movement history available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

interface SalesHistoryTabProps {
  salesHistory: SaleItem[];
}

const SalesHistoryTab: React.FC<SalesHistoryTabProps> = ({ salesHistory }) => (
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
                  {sale.sale_date
                    ? new Date(sale.sale_date).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{sale.customer_name || "-"}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>
                  NPR{" "}
                  {Number(sale.subtotal).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
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
);

interface ProductData {
  product: Product | null;
  salesHistory: SaleItem[];
  stockBatches: StockBatch[]; // Changed from stockEntries
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { get, delete: remove } = useApi();

  // State management
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [data, setData] = useState<ProductData>({
    product: null,
    salesHistory: [],
    stockBatches: [], // Changed from stockEntries
  });

  // Fetch all data in parallel
  const fetchData = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [productData, salesData] = await Promise.all([
        get<Product>(`/products/${id}/`),
        get<SaleItem[]>(`/products/${id}/sales_history/`),
      ]);

      setData({
        product: productData,
        salesHistory: salesData,
        stockBatches: productData.stock_batches, // Use stock_batches from product data
      });
    } catch (error) {
      console.error("Failed to fetch product data:", error);
      setError("Failed to load product data. Please try again.");
      toast.error("Error loading product data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEdit = () => {
    if (!id) return;
    navigate(`/products/edit/${id}`);
  };

  const confirmDelete = async () => {
    if (!id || !data.product) return;

    try {
      await remove<Product>(`/products/${id}/`);
      toast.success(`Product "${data.product.name}" deleted successfully`);
      navigate("/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Loading state
  if (isLoading) return <Loader />;

  // Error state
  if (error || !data.product) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
      </DashboardLayout>
    );
  }

  const { product, salesHistory, stockBatches } = data;

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
          <div className="md:col-span-1">
            <ProductImage product={product} />
          </div>
          <div className="md:col-span-2">
            <ProductDetails product={product} />
          </div>
        </div>

        <Tabs defaultValue="stockHistory" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stockHistory">Stock History</TabsTrigger>
            <TabsTrigger value="salesHistory">Sales History</TabsTrigger>
          </TabsList>
          <TabsContent value="stockHistory">
            <StockHistoryTab stockBatches={stockBatches} />
          </TabsContent>
          <TabsContent value="salesHistory">
            <SalesHistoryTab salesHistory={salesHistory} />
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
