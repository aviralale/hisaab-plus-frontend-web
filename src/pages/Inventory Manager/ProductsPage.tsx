import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const products = [
  {
    id: 1,
    name: "Laptop HP 15",
    sku: "LAP-HP-15",
    image: "https://placeholder.com/150",
    category_name: "Laptops",
    supplier_name: "HP Inc.",
    stock: 10,
    cost_price: 400.0,
    selling_price: 550.0,
    profit_margin: "37.5%",
    needs_reorder: false,
    is_active: true,
  },
  {
    id: 2,
    name: "Dell XPS 13",
    sku: "LAP-DELL-13",
    image: "https://placeholder.com/150",
    category_name: "Laptops",
    supplier_name: "Dell Technologies",
    stock: 7,
    cost_price: 800.0,
    selling_price: 1200.0,
    profit_margin: "50%",
    needs_reorder: false,
    is_active: true,
  },
  {
    id: 3,
    name: "USB-C Cable",
    sku: "USB-C-01",
    image: "https://placeholder.com/150",
    category_name: "Accessories",
    supplier_name: "Anker",
    stock: 4,
    cost_price: 5.0,
    selling_price: 12.5,
    profit_margin: "150%",
    needs_reorder: true,
    is_active: true,
  },
  {
    id: 4,
    name: "Wireless Mouse",
    sku: "ACC-MS-W1",
    image: "https://placeholder.com/150",
    category_name: "Accessories",
    supplier_name: "Logitech",
    stock: 2,
    cost_price: 15.0,
    selling_price: 29.99,
    profit_margin: "99.9%",
    needs_reorder: true,
    is_active: true,
  },
  {
    id: 5,
    name: "HDMI Cable 2m",
    sku: "HDMI-2M",
    image: "https://placeholder.com/150",
    category_name: "Cables",
    supplier_name: "Belkin",
    stock: 0,
    cost_price: 8.0,
    selling_price: 19.99,
    profit_margin: "149.9%",
    needs_reorder: true,
    is_active: false,
  },
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: number) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    setSelectedProduct(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    console.log(`Deleting product with ID: ${selectedProduct}`);
    setShowDeleteDialog(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <Button onClick={() => navigate("/products/new")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Category</DropdownMenuItem>
              <DropdownMenuItem>Supplier</DropdownMenuItem>
              <DropdownMenuItem>Stock Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Reset Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{product.supplier_name}</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : product.needs_reorder ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Low Stock ({product.stock})
                        </Badge>
                      ) : (
                        <span>{product.stock}</span>
                      )}
                    </TableCell>
                    <TableCell>NPR{product.selling_price.toFixed(2)}</TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <span className="sr-only">Open menu</span>
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(product.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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

export default ProductsPage;
