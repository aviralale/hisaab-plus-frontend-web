import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  X,
  Plus,
  Calculator,
  Package,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useApi } from "@/contexts/ApiContext";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { CategoriesResponse, SuppliersResponse } from "@/types";
import { Product } from "@/types/product";
import Loader from "@/components/loader";
import { useAuth } from "@/contexts/AuthContext";

type Option = {
  id: number;
  name: string;
};

const UNIT_CHOICES = [
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "l", label: "Liter" },
  { value: "ml", label: "Milliliter" },
  { value: "pcs", label: "Piece" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
];

interface ExtendedProduct extends Omit<Product, "image" | "business"> {
  image: string | null;
  imagePreview?: string | null;
  business?: number;
  current_cost_price: number;
  current_selling_price: number;
  suggested_selling_price: number;
  profit_margin: number;
  batch_count: number;
}

const emptyProduct: ExtendedProduct = {
  id: 0,
  business: undefined,
  name: "",
  sku: "",
  description: "",
  image: null,
  imagePreview: null,
  category: 0,
  supplier: 0,
  stock: 0,
  reorder_level: 10,
  is_active: true,
  category_name: "",
  supplier_name: "",
  unit: "pcs",
  barcode: null,
  total_stock_value: 0,
  average_cost_price: 0,
  current_cost_price: 0,
  current_selling_price: 0,
  suggested_selling_price: 0,
  profit_margin: 0,
  selling_price: 0,
  stock_batches: [],
  batch_count: 0,
  needs_reorder: false,
  created_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Update the newBatch state interface
interface NewBatch {
  quantity: number;
  cost_price: number;
  vat_percentage: number;
  profit_margin_percentage: number;
  actual_selling_price: number;
  invoice_number: string;
  notes: string;
  entry_type: string;
}

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const api = useApi();

  const [product, setProduct] = useState<ExtendedProduct>(emptyProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const { user } = useAuth();

  // Update the initial state
  const [newBatch, setNewBatch] = useState<NewBatch>({
    quantity: 1,
    cost_price: 0,
    vat_percentage: 13.0,
    profit_margin_percentage: 20.0,
    actual_selling_price: 0,
    invoice_number: "",
    notes: "",
    entry_type: "purchase",
  });

  const isSubmitting = api.isLoading(
    `/products/${id ? id + "/" : ""}`,
    id ? "PATCH" : "POST"
  );
  const isLoading = api.isLoading(`/products/${id}/`, "GET");
  const isDeleting = api.isLoading(`/products/${id}/`, "DELETE");
  const isFetchingCategories = api.isLoading("/categories/", "GET");
  const isFetchingSuppliers = api.isLoading("/suppliers/", "GET");

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      fetchProductDetails(id);
    }
  }, [id]);

  // Calculate suggested selling price based on cost and margin
  useEffect(() => {
    if (newBatch.cost_price > 0) {
      const vatAmount = (newBatch.cost_price * newBatch.vat_percentage) / 100;
      const costWithVat = newBatch.cost_price + vatAmount;
      const suggestedPrice =
        costWithVat * (1 + newBatch.profit_margin_percentage / 100);
      setNewBatch((prev) => ({
        ...prev,
        actual_selling_price: Math.round(suggestedPrice * 100) / 100,
      }));
    }
  }, [
    newBatch.cost_price,
    newBatch.vat_percentage,
    newBatch.profit_margin_percentage,
  ]);

  const fetchCategories = async () => {
    try {
      const data = await api.get<CategoriesResponse>("/categories/");
      setCategories(data.results);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await api.get<SuppliersResponse>("/suppliers/");
      setSuppliers(data.results);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    }
  };

  // Update the fetchProductDetails function
  const fetchProductDetails = async (productId: string) => {
    try {
      const data = await api.get<Product>(`/products/${productId}/`);
      const extendedData: ExtendedProduct = {
        ...data,
        imagePreview: data.image,
        unit: data.unit || "pcs",
        current_cost_price: data.average_cost_price || 0,
        current_selling_price: data.selling_price || 0,
        suggested_selling_price: data.suggested_selling_price || 0,
        profit_margin:
          ((data.selling_price - data.average_cost_price) /
            data.average_cost_price) *
            100 || 0,
        batch_count: data.stock_batches?.length || 0,
      };
      setProduct(extendedData);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product details");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : Number(value);
    setProduct({ ...product, [name]: numValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (name: keyof ExtendedProduct, value: string) => {
    setProduct((prev) => ({
      ...prev,
      [name]: name === "unit" ? value : Number(value),
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSwitchChange = (
    name: keyof ExtendedProduct,
    checked: boolean
  ) => {
    setProduct((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setProduct({
        ...product,
        imagePreview: imageUrl,
      });
    }
  };

  const removeImage = () => {
    setProduct({
      ...product,
      image: null,
      imagePreview: null,
    });
    setImageFile(null);
    if (product.imagePreview && product.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(product.imagePreview);
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue =
      name === "invoice_number" || name === "notes" ? value : Number(value);
    setNewBatch({ ...newBatch, [name]: numValue });
  };

  const addStockBatch = async () => {
    if (!id) return;

    try {
      const batchData = {
        product: Number(id),
        quantity: newBatch.quantity,
        cost_price: newBatch.cost_price,
        vat_percentage: newBatch.vat_percentage,
        profit_margin_percentage: newBatch.profit_margin_percentage,
        actual_selling_price: newBatch.actual_selling_price,
        invoice_number: newBatch.invoice_number,
        notes: newBatch.notes,
        entry_type: newBatch.entry_type,
      };

      const response = await api.post("/stock-entries/", batchData);

      // Handle product version change
      if (response.product && response.product !== Number(id)) {
        toast.success("Stock batch added and new product version created!");
        navigate(`/products/${response.product}`);
      } else {
        toast.success("Stock batch added successfully!");
        setShowBatchDialog(false);
        fetchProductDetails(id);
      }
    } catch (error) {
      console.error("Error adding stock batch:", error);
      toast.error("Failed to add stock batch");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.sku.trim()) newErrors.sku = "SKU is required";
    if (!product.category) newErrors.category = "Category is required";
    if (!product.supplier) newErrors.supplier = "Supplier is required";
    if (!product.unit) newErrors.unit = "Unit is required";

    if (product.reorder_level < 0) {
      newErrors.reorder_level = "Reorder level cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = new FormData();

      // Add business ID if available
      if (user?.business_details?.id) {
        formData.append("business", user.business_details.id.toString());
      }

      // Required fields
      const requiredFields = [
        "name",
        "sku",
        "category",
        "supplier",
        "unit",
        "reorder_level",
        "is_active",
      ] as const;

      requiredFields.forEach((field) => {
        if (product[field] !== undefined) {
          formData.append(field, product[field].toString());
        }
      });

      // Optional fields
      const optionalFields = ["description", "barcode"] as const;
      optionalFields.forEach((field) => {
        if (product[field]) {
          formData.append(field, product[field]?.toString() || "");
        }
      });

      // Handle image
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditing && id) {
        await api.patch(`/products/${id}/`, formData);
      } else {
        await api.post("/products/", formData);
      }

      toast.success(
        `Product ${isEditing ? "updated" : "created"} successfully!`
      );
      navigate("/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const confirmDelete = async () => {
    if (!id) return;

    try {
      await api.delete(`/products/${id}/`);
      toast.success("Product deleted successfully!");
      setShowDeleteDialog(false);
      navigate("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      setShowDeleteDialog(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  if (isLoading || isFetchingCategories || isFetchingSuppliers) {
    return <Loader />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? "Update product information and manage inventory"
                  : "Create a new product"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBatchDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            )}
            {isEditing && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Product Summary Cards (Edit mode only) */}
        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Stock
                    </p>
                    <p className="text-2xl font-bold">{product.stock}</p>
                  </div>
                  <div
                    className={
                      product.needs_reorder ? "text-red-600" : "text-green-600"
                    }
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  {product.needs_reorder && (
                    <Badge variant="destructive" className="mt-1">
                      Reorder Required
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Value
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(product.total_stock_value)}
                    </p>
                  </div>
                  <div className="text-emerald-600">
                    <Calculator className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Avg. Cost
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(product.average_cost_price)}
                    </p>
                  </div>
                  <div className="text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Stock Batches
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">
                        {product.stock_batches?.length || 0}
                      </p>
                      {product.stock_batches?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Last updated:{" "}
                          {formatDate(product.stock_batches[0].entry_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-purple-600">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {isEditing && (
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Image */}
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                      {product.image || product.imagePreview ? (
                        <div className="relative w-32 h-32 mx-auto">
                          <img
                            src={product.image || product.imagePreview || ""}
                            alt="Product"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer"
                          >
                            <span className="text-sm text-blue-600 hover:text-blue-500">
                              Click to upload image
                            </span>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG up to 2MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <span className="text-sm text-red-500">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        name="sku"
                        value={product.sku}
                        onChange={handleChange}
                        placeholder="Product code"
                      />
                      {errors.sku && (
                        <span className="text-sm text-red-500">
                          {errors.sku}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category, Supplier & Barcode */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={product.category?.toString()}
                        onValueChange={(value) =>
                          handleSelectChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <span className="text-sm text-red-500">
                          {errors.category}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier *</Label>
                      <Select
                        value={product.supplier?.toString()}
                        onValueChange={(value) =>
                          handleSelectChange("supplier", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.id.toString()}
                            >
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.supplier && (
                        <span className="text-sm text-red-500">
                          {errors.supplier}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        name="barcode"
                        value={product.barcode || ""}
                        onChange={handleChange}
                        placeholder="Product barcode"
                      />
                    </div>
                  </div>

                  {/* Unit & Prices */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit *</Label>
                      <Select
                        value={product.unit}
                        onValueChange={(value) =>
                          handleSelectChange("unit", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_CHOICES.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unit && (
                        <span className="text-sm text-red-500">
                          {errors.unit}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reorder_level">Reorder Level</Label>
                      <Input
                        id="reorder_level"
                        name="reorder_level"
                        type="number"
                        min="0"
                        value={product.reorder_level}
                        onChange={handleNumberChange}
                        placeholder="10"
                      />
                      {errors.reorder_level && (
                        <span className="text-sm text-red-500">
                          {errors.reorder_level}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      placeholder="Product description (optional)"
                      rows={3}
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={product.is_active}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("is_active", checked)
                      }
                    />
                    <Label htmlFor="is_active">Product is active</Label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting
                        ? "Saving..."
                        : isEditing
                        ? "Update"
                        : "Create"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {isEditing && (
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Inventory Batches</CardTitle>
                    <Button onClick={() => setShowBatchDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stock Batch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.stock_batches && product.stock_batches.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Cost/Unit</TableHead>
                          <TableHead>VAT</TableHead>
                          <TableHead>Selling Price</TableHead>
                          <TableHead>Profit/Unit</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Invoice</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.stock_batches?.map((batch) => (
                          <TableRow key={batch.batch_id}>
                            <TableCell>
                              {formatDate(batch.entry_date)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  batch.entry_type === "purchase"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {batch.entry_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{batch.quantity_remaining}</TableCell>
                            <TableCell>
                              {formatCurrency(parseFloat(batch.cost_per_unit))}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                parseFloat(batch.cost_per_unit) * 0.13
                              )}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(parseFloat(batch.selling_price))}
                            </TableCell>
                            <TableCell className="text-green-600">
                              {formatCurrency(batch.profit_per_unit)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(batch.total_batch_value)}
                            </TableCell>
                            <TableCell>{batch.invoice_number || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No inventory batches found
                      </p>
                      <Button
                        className="mt-2"
                        onClick={() => setShowBatchDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Batch
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot
                be undone and will also remove all associated stock entries.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Stock Batch Dialog */}
        <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Stock Batch</DialogTitle>
              <DialogDescription>
                Add new inventory for {product.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-quantity">Quantity *</Label>
                  <Input
                    id="batch-quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={newBatch.quantity}
                    onChange={handleBatchChange}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-cost-price">Cost Price (NPR) *</Label>
                  <Input
                    id="batch-cost-price"
                    name="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newBatch.cost_price}
                    onChange={handleBatchChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-vat">VAT Percentage (%)</Label>
                  <Input
                    id="batch-vat"
                    name="vat_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={newBatch.vat_percentage}
                    onChange={handleBatchChange}
                    placeholder="13.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-margin">Profit Margin (%)</Label>
                  <Input
                    id="batch-margin"
                    name="profit_margin_percentage"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newBatch.profit_margin_percentage}
                    onChange={handleBatchChange}
                    placeholder="20.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-selling-price">
                  Selling Price (NPR) *
                </Label>
                <Input
                  id="batch-selling-price"
                  name="actual_selling_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBatch.actual_selling_price}
                  onChange={handleBatchChange}
                  placeholder="Auto-calculated"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated based on cost price, VAT, and profit margin
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-invoice">Invoice Number</Label>
                  <Input
                    id="batch-invoice"
                    name="invoice_number"
                    value={newBatch.invoice_number}
                    onChange={handleBatchChange}
                    placeholder="Optional invoice number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-notes">Notes</Label>
                  <Input
                    id="batch-notes"
                    name="notes"
                    value={newBatch.notes}
                    onChange={handleBatchChange}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              {/* Calculation Summary */}
              {newBatch.cost_price > 0 && (
                <div className="p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Calculation Summary:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cost Price:</span>
                      <span className="float-right">
                        {formatCurrency(newBatch.cost_price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        VAT ({newBatch.vat_percentage}%):
                      </span>
                      <span className="float-right">
                        {formatCurrency(
                          (newBatch.cost_price * newBatch.vat_percentage) / 100
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Cost with VAT:
                      </span>
                      <span className="float-right">
                        {formatCurrency(
                          newBatch.cost_price +
                            (newBatch.cost_price * newBatch.vat_percentage) /
                              100
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Total Value:
                      </span>
                      <span className="float-right font-medium">
                        {formatCurrency(
                          newBatch.actual_selling_price * newBatch.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowBatchDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={addStockBatch}
                disabled={
                  !newBatch.cost_price ||
                  !newBatch.quantity ||
                  !newBatch.actual_selling_price
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Batch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProductForm;
