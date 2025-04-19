import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Save, Trash2, Upload, X } from "lucide-react";

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

type Product = {
  id: number;
  name: string;
  sku: string;
  description: string;
  image: File | null;
  category: number;
  supplier: number;
  stock: number;
  cost_price: number | "";
  selling_price: number | "";
  reorder_point: number | "";
  is_active: boolean;
};

type Option = {
  id: number;
  name: string;
};

const initialProduct: Product = {
  id: 3,
  name: "USB-C Cable",
  sku: "USB-C-01",
  description:
    "Premium USB-C Cable with fast charging capability and data transfer speeds up to 10 Gbps.",
  image: null,
  category: 2,
  supplier: 3,
  stock: 4,
  cost_price: 5.0,
  selling_price: 12.5,
  reorder_point: 10,
  is_active: true,
};

const categories: Option[] = [
  { id: 1, name: "Laptops" },
  { id: 2, name: "Accessories" },
  { id: 3, name: "Cables" },
  { id: 4, name: "Phones" },
  { id: 5, name: "Tablets" },
];

const suppliers: Option[] = [
  { id: 1, name: "HP Inc." },
  { id: 2, name: "Dell Technologies" },
  { id: 3, name: "Anker" },
  { id: 4, name: "Logitech" },
  { id: 5, name: "Belkin" },
];

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [product, setProduct] = useState<Product>(initialProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? "" : Number(value);
    setProduct({ ...product, [name]: numValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (name: keyof Product, value: string) => {
    setProduct({ ...product, [name]: Number(value) });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSwitchChange = (name: keyof Product, checked: boolean) => {
    setProduct({ ...product, [name]: checked });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!product.name) newErrors.name = "Product name is required";
    if (!product.sku) newErrors.sku = "SKU is required";
    if (!product.category) newErrors.category = "Category is required";
    if (!product.supplier) newErrors.supplier = "Supplier is required";
    if (product.cost_price === "" || isNaN(Number(product.cost_price)))
      newErrors.cost_price = "Valid cost price is required";
    if (product.selling_price === "" || isNaN(Number(product.selling_price)))
      newErrors.selling_price = "Valid selling price is required";
    else if (Number(product.selling_price) < Number(product.cost_price))
      newErrors.selling_price = "Selling price cannot be lower than cost price";
    if (product.reorder_point === "" || isNaN(Number(product.reorder_point)))
      newErrors.reorder_point = "Valid reorder point is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    console.log("Submitting product:", product);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(isEditing ? `/products/${id}` : "/products");
    }, 1000);
  };

  const confirmDelete = () => {
    console.log(`Deleting product with ID: ${id}`);
    setShowDeleteDialog(false);
    navigate("/products");
  };

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
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
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
                        <Package className="h-24 w-24 text-gray-400" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          type="button"
                          onClick={() =>
                            setProduct({ ...product, image: null })
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-10 w-10 text-gray-400" />
                        <Button variant="outline" type="button">
                          Upload Image
                        </Button>
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
                  <Label htmlFor="reorder_point">Reorder Point</Label>
                  <Input
                    id="reorder_point"
                    name="reorder_point"
                    type="number"
                    min="0"
                    value={product.reorder_point}
                    onChange={handleNumberChange}
                    placeholder="0"
                  />
                  {errors.reorder_point && (
                    <span className="text-sm text-red-500">
                      {errors.reorder_point}
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

export default ProductForm;
