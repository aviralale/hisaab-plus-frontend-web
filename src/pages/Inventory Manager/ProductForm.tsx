import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Upload, X } from "lucide-react";
import { useApi } from "@/contexts/ApiContext";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { CategoriesResponse, Product, SuppliersResponse } from "@/types";
import Loader from "@/components/loader";
import { useAuth } from "@/contexts/AuthContext";

type Option = {
  id: number;
  name: string;
};

// Define unit choices based on the backend model
const UNIT_CHOICES = [
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "l", label: "Liter" },
  { value: "ml", label: "Milliliter" },
  { value: "pcs", label: "Piece" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
];

interface ExtendedProduct extends Omit<Product, "image"> {
  image: string | null;
  imagePreview?: string | null;
  business?: number | undefined;
  unit: string;
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
  cost_price: 0,
  selling_price: 0,
  reorder_level: 0,
  is_active: true,
  category_name: "",
  supplier_name: "",
  created_at: "",
  unit: "pcs", // Set default unit to piece
};

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const api = useApi();

  const [product, setProduct] = useState<ExtendedProduct>(emptyProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const { user } = useAuth();

  // Check if the endpoint is currently loading
  const isSubmitting = api.isLoading(
    `/products/${id ? id + "/" : ""}`,
    id ? "PATCH" : "POST"
  );
  const isLoading = api.isLoading(`/products/${id}/`, "GET");
  const isDeleting = api.isLoading(`/products/${id}/`, "DELETE");
  const isFetchingCategories = api.isLoading("/categories/", "GET");
  const isFetchingSuppliers = api.isLoading("/suppliers/", "GET");

  // Fetch categories and suppliers
  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  // Fetch product details if editing
  useEffect(() => {
    if (isEditing && id) {
      fetchProductDetails(id);
    }
  }, [id]);

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

  const fetchProductDetails = async (productId: string) => {
    try {
      const data = await api.get<Product>(`/products/${productId}/`);
      // Convert to ExtendedProduct with imagePreview
      const extendedData: ExtendedProduct = {
        ...data,
        imagePreview: data.image,
        unit: data.unit || "pcs",
      };
      setProduct(extendedData);
    } catch (error) {
      console.error("Error fetching product:", error);
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
    setProduct({ ...product, [name]: name === "unit" ? value : Number(value) });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSwitchChange = (
    name: keyof ExtendedProduct,
    checked: boolean
  ) => {
    setProduct({ ...product, [name]: checked });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a temporary URL for preview
      const imageUrl = URL.createObjectURL(file);
      setProduct({
        ...product,
        imagePreview: imageUrl,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!product.name) newErrors.name = "Product name is required";
    if (!product.sku) newErrors.sku = "SKU is required";
    if (!product.category) newErrors.category = "Category is required";
    if (!product.supplier) newErrors.supplier = "Supplier is required";
    if (!product.unit) newErrors.unit = "Unit is required";
    if (product.cost_price === 0 || isNaN(Number(product.cost_price)))
      newErrors.cost_price = "Valid cost price is required";
    if (product.selling_price === 0 || isNaN(Number(product.selling_price)))
      newErrors.selling_price = "Valid selling price is required";
    else if (Number(product.selling_price) < Number(product.cost_price))
      newErrors.selling_price = "Selling price cannot be lower than cost price";
    if (product.reorder_level === 0 || isNaN(Number(product.reorder_level)))
      newErrors.reorder_level = "Valid reorder point is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Prepare form data for API submission
      const formData = new FormData();
      if (user?.business_details?.id) {
        formData.append("business", user.business_details.id.toString());
      }
      // Only include the fields the API expects
      const fieldsToInclude = [
        "name",
        "sku",
        "description",
        "category",
        "supplier",
        "unit", // Include unit field
        "cost_price",
        "selling_price",
        "reorder_level",
        "is_active",
      ];

      // Add fields to formData
      fieldsToInclude.forEach((key) => {
        if (key in product && product[key as keyof ExtendedProduct] !== null) {
          formData.append(
            key,
            product[key as keyof ExtendedProduct]?.toString() || ""
          );
        }
      });
      // Handle image separately
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Use ApiContext to make request
      if (isEditing && id) {
        await api.patch(`/products/${id}/`, formData);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products/", formData);
        toast.success("Product created successfully!");
      }

      navigate("/products");
    } catch (error) {
      console.error("Error saving product:", error);
      // Error handling is managed by ApiContext
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
      // Error handling is managed by ApiContext
      setShowDeleteDialog(false);
    }
  };

  if (isLoading || isFetchingCategories || isFetchingSuppliers) {
    return <Loader />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
          </div>
          {isEditing && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic product information and identifiers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <span className="text-sm text-red-500">{errors.name}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={product.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && (
                    <span className="text-sm text-red-500">{errors.sku}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                    {product.image ? (
                      <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <img
                          src={product.image}
                          alt="Product"
                          className="max-h-full max-w-full object-contain"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          type="button"
                          onClick={() => {
                            setProduct({
                              ...product,
                              image: null,
                              imagePreview: null,
                            });
                            setImageFile(null);
                            // Revoke the object URL to avoid memory leaks
                            if (
                              product.imagePreview &&
                              product.imagePreview.startsWith("blob:")
                            ) {
                              URL.revokeObjectURL(product.imagePreview);
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : product.imagePreview ? (
                      <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <img
                          src={product.imagePreview}
                          alt="Product"
                          className="max-h-full max-w-full object-contain"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          type="button"
                          onClick={() => {
                            setProduct({
                              ...product,
                              image: null,
                              imagePreview: null,
                            });
                            setImageFile(null);
                            // Revoke the object URL to avoid memory leaks
                            if (
                              product.imagePreview &&
                              product.imagePreview.startsWith("blob:")
                            ) {
                              URL.revokeObjectURL(product.imagePreview);
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-10 w-10 text-gray-400" />
                        <label htmlFor="image-upload">
                          <Button variant="outline" type="button" asChild>
                            <span>Upload Image</span>
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or WEBP up to 2MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={product.is_active}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_active", checked)
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Enter product categorization, pricing, and inventory
                  information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
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
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={product.unit}
                    onValueChange={(value) => handleSelectChange("unit", value)}
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
                    <span className="text-sm text-red-500">{errors.unit}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
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
                  <Label htmlFor="cost_price">Cost Price (NPR)</Label>
                  <Input
                    id="cost_price"
                    name="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.cost_price}
                    onChange={handleNumberChange}
                    placeholder="0.00"
                  />
                  {errors.cost_price && (
                    <span className="text-sm text-red-500">
                      {errors.cost_price}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selling_price">Selling Price (NPR)</Label>
                  <Input
                    id="selling_price"
                    name="selling_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.selling_price}
                    onChange={handleNumberChange}
                    placeholder="0.00"
                  />
                  {errors.selling_price && (
                    <span className="text-sm text-red-500">
                      {errors.selling_price}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder_level">Reorder Point</Label>
                  <Input
                    id="reorder_level"
                    name="reorder_level"
                    type="number"
                    min="0"
                    value={product.reorder_level}
                    onChange={handleNumberChange}
                    placeholder="0"
                  />
                  {errors.reorder_level && (
                    <span className="text-sm text-red-500">
                      {errors.reorder_level}
                    </span>
                  )}
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="stock">Current Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={handleNumberChange}
                      placeholder="0"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Use stock entries to update inventory levels
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this
              product from your inventory.
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
    </DashboardLayout>
  );
};

export default ProductForm;
