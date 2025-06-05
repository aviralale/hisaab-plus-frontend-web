import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  Trash2,
  Package,
  Banknote,
  X,
  TrendingUp,
  // ChevronUp,
  // ChevronDown,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useApi } from "@/contexts/ApiContext";
import { CategoriesResponse, SuppliersResponse } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Product, StockBatch } from "@/types/product";

type StockStatusFilter = "in-stock" | "low-stock" | "out-of-stock" | null;
type SortDirection = "asc" | "desc";

interface FilterOption {
  id: number;
  name: string;
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] =
    useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [filterSupplier, setFilterSupplier] = useState<string | null>(null);
  const [filterSupplierId, setFilterSupplierId] = useState<number | null>(null);
  const [filterStockStatus, setFilterStockStatus] =
    useState<StockStatusFilter>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<FilterOption[]>([]);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // For server-side search and pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const { get, delete: remove } = useApi();
  const { isAuthenticated } = useAuth();

  // Parse the URL query parameters
  useEffect(() => {
    if (isAuthenticated) {
      const queryParams = new URLSearchParams(location.search);

      // Set initial state from URL params
      const search = queryParams.get("search");
      if (search) setSearchTerm(search);

      const categoryId = queryParams.get("category");
      if (categoryId) setFilterCategoryId(parseInt(categoryId, 10));

      const supplierId = queryParams.get("supplier");
      if (supplierId) setFilterSupplierId(parseInt(supplierId, 10));

      const stockGt = queryParams.get("stock__gt");
      const needsReorder = queryParams.get("needs_reorder");
      const stock = queryParams.get("stock");

      if (stockGt === "0" && needsReorder === "false") {
        setFilterStockStatus("in-stock");
      } else if (needsReorder === "true") {
        setFilterStockStatus("low-stock");
      } else if (stock === "0") {
        setFilterStockStatus("out-of-stock");
      }

      const page = queryParams.get("page");
      if (page) setCurrentPage(parseInt(page, 10));

      const sort = queryParams.get("sort");
      if (sort) {
        const isDesc = sort.startsWith("-");
        const field = isDesc ? sort.substring(1) : sort;
        setSortField(field);
        setSortDirection(isDesc ? "desc" : "asc");
      }
    }
  }, [location.search, isAuthenticated]);

  // Update the URL when filters change
  const updateUrlWithFilters = (params: URLSearchParams) => {
    const newUrl = `${location.pathname}?${params.toString()}`;
    navigate(newUrl, { replace: true });
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Construct query params based on all current filters
      const params = new URLSearchParams();

      // Add search term if present
      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      // Add category filter if present
      if (filterCategoryId !== null) {
        params.append("category", filterCategoryId.toString());
      }

      // Add supplier filter if present
      if (filterSupplierId !== null) {
        params.append("supplier", filterSupplierId.toString());
      }

      // Add stock status filters
      if (filterStockStatus === "in-stock") {
        params.append("stock__gt", "0");
        params.append("needs_reorder", "false");
      } else if (filterStockStatus === "low-stock") {
        params.append("needs_reorder", "true");
      } else if (filterStockStatus === "out-of-stock") {
        params.append("stock", "0");
      }

      // Add sorting
      const sortParam = sortDirection === "desc" ? `-${sortField}` : sortField;
      params.append("sort", sortParam);

      // Add pagination params
      params.append("page", currentPage.toString());
      params.append("page_size", pageSize.toString());

      // Update the URL with the current filters
      updateUrlWithFilters(params);

      // Make the API call with the constructed query string
      const url = `/products/?${params.toString()}`;
      const response = await get<{ results: Product[]; count: number }>(url);
      setFilteredProducts(response.results || []);

      const count = response.count || 0;
      setTotalItems(count);
      setTotalPages(Math.ceil(count / pageSize));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and suppliers for filter dropdowns
  const fetchFilterOptions = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await get<CategoriesResponse>("/categories/");

      const categories = categoriesResponse.results.map((cat) => ({
        id: cat.id,
        name: cat.name,
      }));
      setCategoryOptions(categories);

      // Match category name to ID from URL params if present
      if (filterCategoryId !== null) {
        const categoryMatch = categories.find(
          (cat) => cat.id === filterCategoryId
        );
        if (categoryMatch) {
          setFilterCategory(categoryMatch.name);
        }
      }

      // Fetch suppliers
      const suppliersResponse = await get<SuppliersResponse>("/suppliers/");

      const suppliers = suppliersResponse.results.map((sup) => ({
        id: sup.id,
        name: sup.name,
      }));
      setSupplierOptions(suppliers);

      // Match supplier name to ID from URL params if present
      if (filterSupplierId !== null) {
        const supplierMatch = suppliers.find(
          (sup) => sup.id === filterSupplierId
        );
        if (supplierMatch) {
          setFilterSupplier(supplierMatch.name);
        }
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast.error("Failed to load filter options");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFilterOptions();
      fetchProducts();
    }
  }, [isAuthenticated]);

  // When filters or pagination changes, refetch products
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [
    searchTerm,
    filterCategoryId,
    filterSupplierId,
    filterStockStatus,
    currentPage,
    pageSize,
    sortField,
    sortDirection,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryName: string) => {
    if (filterCategory === categoryName) {
      // Clear filter
      setFilterCategory(null);
      setFilterCategoryId(null);
    } else {
      // Set filter - find the corresponding ID
      const category = categoryOptions.find((cat) => cat.name === categoryName);
      if (category) {
        setFilterCategory(categoryName);
        setFilterCategoryId(category.id);
      } else {
        toast.error(`Category "${categoryName}" not found`);
      }
    }
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSupplierFilter = (supplierName: string) => {
    if (filterSupplier === supplierName) {
      // Clear filter
      setFilterSupplier(null);
      setFilterSupplierId(null);
    } else {
      // Set filter - find the corresponding ID
      const supplier = supplierOptions.find((sup) => sup.name === supplierName);
      if (supplier) {
        setFilterSupplier(supplierName);
        setFilterSupplierId(supplier.id);
      } else {
        toast.error(`Supplier "${supplierName}" not found`);
      }
    }
    setCurrentPage(1);
  };

  const handleStockStatusFilter = (status: StockStatusFilter) => {
    setFilterStockStatus(filterStockStatus === status ? null : status);
    setCurrentPage(1);
  };

  // const handleSort = (field: string) => {
  //   // If clicking the current sort field, toggle direction
  //   if (field === sortField) {
  //     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  //   } else {
  //     // If new field, default to ascending
  //     setSortField(field);
  //     setSortDirection("asc");
  //   }
  // };

  // const getSortIcon = (field: string) => {
  //   if (field !== sortField) return null;
  //   return sortDirection === "asc" ? (
  //     <ChevronUp className="h-4 w-4 ml-1" />
  //   ) : (
  //     <ChevronDown className="h-4 w-4 ml-1" />
  //   );
  // };

  // const handleEdit = (id: number) => {
  //   navigate(`/products/edit/${id}`);
  // };

  const handleDelete = (id: number) => {
    setSelectedProduct(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        await remove(`/products/${selectedProduct}/`);
        toast.success(`Product deleted successfully`);
        setShowDeleteDialog(false);
        setSelectedItems(selectedItems.filter((id) => id !== selectedProduct));
        // Refresh the products list after deletion
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 1) {
      handleDelete(selectedItems[0]);
    } else if (selectedItems.length > 1) {
      setShowBulkDeleteDialog(true);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterCategory(null);
    setFilterCategoryId(null);
    setFilterSupplier(null);
    setFilterSupplierId(null);
    setFilterStockStatus(null);
    setSearchTerm("");
    setCurrentPage(1);
    setSortField("name");
    setSortDirection("asc");

    // Also clear the URL params
    navigate(location.pathname, { replace: true });
  };

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Handle select all checkbox
  // const toggleSelectAll = () => {
  //   if (selectedItems.length === filteredProducts.length) {
  //     setSelectedItems([]);
  //   } else {
  //     setSelectedItems(filteredProducts.map((product) => product.id));
  //   }
  // };

  // // Handle individual row selection
  // const toggleSelectItem = (id: number) => {
  //   if (selectedItems.includes(id)) {
  //     setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  //   } else {
  //     setSelectedItems([...selectedItems, id]);
  //   }
  // };

  // Additional function for bulk delete
  const confirmBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setIsLoading(true);
    try {
      // Create an array of promises for each delete operation
      const deletePromises = selectedItems.map((id) =>
        remove(`/products/${id}/`)
      );

      // Execute all delete operations in parallel
      await Promise.all(deletePromises);

      toast.success(`${selectedItems.length} products deleted successfully`);
      setShowBulkDeleteDialog(false);
      setSelectedItems([]);

      // Refresh the products list after deletion
      fetchProducts();
    } catch (error) {
      console.error("Error deleting products:", error);
      toast.error("Failed to delete some products");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pagination display
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;

    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => goToPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate start and end page numbers to display
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 2);

    // Adjust start if we're near the end
    if (totalPages > 2 && endPage < totalPages - 1) {
      if (currentPage > totalPages - Math.floor(maxPagesToShow / 2)) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 1);
        endPage = totalPages - 1;
      }
    }

    // Add ellipsis if needed at the beginning
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => goToPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed at the end
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => goToPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Update the average profit calculation
  const calculateAverageProfit = (products: Product[]): number => {
    if (products.length === 0) return 0;

    const totalProfit = products.reduce((sum, product) => {
      const batchProfits = product.stock_batches.reduce(
        (batchSum: number, batch: StockBatch): number =>
          batchSum + batch.profit_per_unit,
        0
      );
      return sum + batchProfits / (product.stock_batches.length || 1);
    }, 0);

    return totalProfit / products.length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <div className="flex space-x-2">
            {selectedItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete{" "}
                {selectedItems.length === 1
                  ? "Item"
                  : `${selectedItems.length} Items`}
              </Button>
            )}
            <Button onClick={() => navigate("/products/new")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold">{totalItems}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Stock Value
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <Banknote className="h-5 w-5 text-emerald-600 mr-2" />
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    filteredProducts.reduce(
                      (sum, p) => sum + p.total_stock_value,
                      0
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Profit/Unit
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateAverageProfit(filteredProducts))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Out of Stock
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    {filteredProducts.filter((p) => p.stock === 0).length}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Low Stock
                  </span>
                  <span className="text-xl font-bold text-yellow-600">
                    {filteredProducts.filter((p) => p.needs_reorder).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or description..."
                className="pl-8 pr-10"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-normal text-xs">
                        Category
                      </DropdownMenuLabel>
                      <div className="max-h-40 overflow-y-auto">
                        {categoryOptions.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={`category-${category.id}`}
                            checked={filterCategory === category.name}
                            onCheckedChange={() =>
                              handleCategoryFilter(category.name)
                            }
                          >
                            {category.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-normal text-xs">
                        Supplier
                      </DropdownMenuLabel>
                      <div className="max-h-40 overflow-y-auto">
                        {supplierOptions.map((supplier) => (
                          <DropdownMenuCheckboxItem
                            key={`supplier-${supplier.id}`}
                            checked={filterSupplier === supplier.name}
                            onCheckedChange={() =>
                              handleSupplierFilter(supplier.name)
                            }
                          >
                            {supplier.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-normal text-xs">
                        Stock Status
                      </DropdownMenuLabel>
                      <DropdownMenuCheckboxItem
                        checked={filterStockStatus === "in-stock"}
                        onCheckedChange={() =>
                          handleStockStatusFilter("in-stock")
                        }
                      >
                        In Stock
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={filterStockStatus === "low-stock"}
                        onCheckedChange={() =>
                          handleStockStatusFilter("low-stock")
                        }
                      >
                        Low Stock
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={filterStockStatus === "out-of-stock"}
                        onCheckedChange={() =>
                          handleStockStatusFilter("out-of-stock")
                        }
                      >
                        Out of Stock
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="font-normal text-xs">
                        Items Per Page
                      </DropdownMenuLabel>
                      {[10, 25, 50, 100].map((size) => (
                        <DropdownMenuCheckboxItem
                          key={`size-${size}`}
                          checked={pageSize === size}
                          onCheckedChange={() => setPageSize(size)}
                        >
                          {size}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={resetFilters}
                        className="justify-center text-blue-600"
                      >
                        Reset All Filters
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter products</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Active Filters */}
          {(filterCategory || filterSupplier || filterStockStatus) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {filterCategory && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 pr-1"
                >
                  <span>Category: {filterCategory}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      setFilterCategory(null);
                      setFilterCategoryId(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filterSupplier && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 pr-1"
                >
                  <span>Supplier: {filterSupplier}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      setFilterSupplier(null);
                      setFilterSupplierId(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filterStockStatus && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 pr-1"
                >
                  <span>Status: {filterStockStatus.replace("-", " ")}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setFilterStockStatus(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7 hover:bg-transparent hover:text-foreground"
                onClick={resetFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Cost Price</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums">{product.stock}</span>
                          {product.stock === 0 ? (
                            <Badge variant="destructive" className="ml-2">
                              Out of Stock
                            </Badge>
                          ) : product.needs_reorder ? (
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-yellow-100 text-yellow-800"
                            >
                              Low Stock
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.average_cost_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.selling_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.total_stock_value)}
                      </TableCell>
                      <TableCell>
                        {product.is_active ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-700"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/products/edit/${product.id}`)
                            }
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination info and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            -{Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            products
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    aria-disabled={currentPage <= 1 || isLoading}
                    className={
                      currentPage <= 1 || isLoading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    aria-disabled={currentPage >= totalPages || isLoading}
                    className={
                      currentPage >= totalPages || isLoading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone and will permanently remove the product from your
              inventory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog
        open={showBulkDeleteDialog}
        onOpenChange={(open) => setShowBulkDeleteDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.length} products?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedItems.length} Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProductsPage;
