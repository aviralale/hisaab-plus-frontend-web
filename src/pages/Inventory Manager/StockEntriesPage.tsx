import { useState, useEffect, FormEvent, useRef, useMemo } from "react";
import {
  Plus,
  Calendar,
  Package,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Loader from "@/components/loader";
import { useApi } from "@/contexts/ApiContext";
import {
  Product,
  ProductsResponse,
  StockEntriesResponse,
  StockEntry,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

function StockEntriesPage() {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [newStockEntry, setNewStockEntry] = useState({
    product: "",
    entry_type: "purchase",
    quantity: 1,
    unit_price: 0,
    notes: "",
  });
  const [filter, setFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Pagination states for stock entries
  const [stockEntriesPage, setStockEntriesPage] = useState(1);
  const [stockEntriesNextPage, setStockEntriesNextPage] = useState<
    string | null
  >(null);
  const [loadingMoreEntries, setLoadingMoreEntries] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  const { get, post } = useApi();
  const { user } = useAuth();

  // Refs for intersection observer
  const stockEntriesObserverRef = useRef<IntersectionObserver | null>(null);
  const stockEntriesLoadMoreRef = useRef<HTMLDivElement>(null);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm.trim()) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [products, productSearchTerm]);

  const fetchStockEntries = async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      if (page > 1) setLoadingMoreEntries(true);

      const data = await get<StockEntriesResponse>(
        `/stock-entries/?page=${page}`
      );

      if (append) {
        setStockEntries((prev) => [...prev, ...data.results]);
      } else {
        setStockEntries(data.results);
      }

      setStockEntriesNextPage(data.next);
    } catch (error) {
      toast.error("Failed to fetch stock entries");
    } finally {
      setLoading(false);
      setLoadingMoreEntries(false);
    }
  };

  const fetchProducts = async (page = 1, append = false) => {
    try {
      if (page === 1 && !append) setLoading(true);
      if (page > 1) setLoadingMoreProducts(true);

      const data = await get<ProductsResponse>(`/products/?page=${page}`);

      if (append) {
        setProducts((prev) => [...prev, ...data.results]);
      } else {
        setProducts(data.results);
      }

      // If there's a next page, automatically fetch it
      if (data.next) {
        await fetchProducts(page + 1, true);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      if (page === 1 && !append) setLoading(false);
      setLoadingMoreProducts(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    setStockEntriesPage(1);
    await Promise.all([fetchProducts(1, false), fetchStockEntries(1, false)]);
    toast.success("Data refreshed successfully");
    setRefreshing(false);
  };

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    stockEntriesObserverRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && stockEntriesNextPage && !loadingMoreEntries) {
        const nextPage = stockEntriesPage + 1;
        setStockEntriesPage(nextPage);
        fetchStockEntries(nextPage, true);
      }
    }, observerOptions);

    const currentObserver = stockEntriesObserverRef.current;
    const currentLoadMoreRef = stockEntriesLoadMoreRef.current;

    if (currentLoadMoreRef) {
      currentObserver.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef && currentObserver) {
        currentObserver.unobserve(currentLoadMoreRef);
      }
    };
  }, [stockEntriesNextPage, stockEntriesPage, loadingMoreEntries]);

  useEffect(() => {
    fetchProducts(1, false);
    fetchStockEntries(1, false);
  }, []);

  const filteredStockEntries = stockEntries.filter((entry) => {
    const matchesSearch =
      entry.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry?.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && entry.entry_type === filter;
  });

  const handleCreateStockEntry = async (e: FormEvent) => {
    e.preventDefault();

    const productObj = products.find(
      (p) => p.id === parseInt(newStockEntry.product)
    );
    if (!productObj) {
      toast.error("Please select a valid product");
      return;
    }

    try {
      const stockEntryData = {
        product: parseInt(newStockEntry.product),
        quantity: newStockEntry.quantity,
        unit_price: newStockEntry.unit_price,
        entry_type: newStockEntry.entry_type,
        notes: newStockEntry.notes,
        invoice_number: generateInvoiceNumber("stockEntry"),
      };

      const response = await post("/stock-entries/", stockEntryData);

      const newEntry: StockEntry = {
        ...response,
        product_name: productObj.name,
        date_added: new Date().toISOString(),
        created_by: user?.id,
      };

      setStockEntries((prev) => [newEntry, ...prev]);
      toast.success("Stock entry created successfully");
      setIsCreateDialogOpen(false);
      setNewStockEntry({
        product: "",
        entry_type: "purchase",
        quantity: 1,
        unit_price: 0,
        notes: "",
      });
      setProductSearchTerm("");
    } catch (error) {
      console.error("Error creating stock entry:", error);
      toast.error(
        "Failed to create stock entry. Please check all required fields."
      );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800";
      case "return":
        return "bg-amber-100 text-amber-800";
      case "adjustment":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Date",
      "Stock ID",
      "Product",
      "Type",
      "Quantity",
      "Unit Cost",
      "Total Value",
      "Notes",
    ];
    const csvRows = [headers];

    filteredStockEntries.forEach((entry) => {
      csvRows.push([
        formatDate(entry.date_added),
        entry.invoice_number,
        entry.product_name,
        entry.entry_type,
        entry.quantity.toString(),
        entry.unit_price,
        (entry.quantity * parseFloat(entry.unit_price)).toString(),
        entry.notes || "",
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `stock-entries-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success("Stock entries exported successfully");
  };

  // Calculate stats
  const totalStockValue = filteredStockEntries.reduce(
    (total, entry) => total + entry.quantity * parseFloat(entry.unit_price),
    0
  );

  const purchaseEntries = filteredStockEntries.filter(
    (entry) => entry.entry_type === "purchase"
  );
  const returnEntries = filteredStockEntries.filter(
    (entry) => entry.entry_type === "return"
  );

  const totalPurchaseValue = purchaseEntries.reduce(
    (total, entry) => total + entry.quantity * parseFloat(entry.unit_price),
    0
  );

  const totalReturnValue = returnEntries.reduce(
    (total, entry) => total + entry.quantity * parseFloat(entry.unit_price),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stock Entries</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory stock entries and purchases
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            Export
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus size={16} />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Stats Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStockEntries.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "all"
                ? "All entries"
                : `Filtered to ${filter} entries`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStockValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net value of current inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Purchase Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPurchaseValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {purchaseEntries.length} purchase entries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Return Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(totalReturnValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {returnEntries.length} return entries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search by product, ID or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 min-w-40"
            >
              <Filter size={16} />
              {filter === "all"
                ? "All Types"
                : filter === "purchase"
                ? "Purchases"
                : filter === "return"
                ? "Returns"
                : "Adjustments"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0">
            <div className="p-2">
              <button
                className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                  filter === "all"
                    ? "bg-primary/10 font-medium"
                    : "hover:bg-muted"
                }`}
                onClick={() => setFilter("all")}
              >
                All Types
              </button>
              <button
                className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                  filter === "purchase"
                    ? "bg-primary/10 font-medium"
                    : "hover:bg-muted"
                }`}
                onClick={() => setFilter("purchase")}
              >
                Purchases
              </button>
              <button
                className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                  filter === "return"
                    ? "bg-primary/10 font-medium"
                    : "hover:bg-muted"
                }`}
                onClick={() => setFilter("return")}
              >
                Returns
              </button>
              <button
                className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                  filter === "adjustment"
                    ? "bg-primary/10 font-medium"
                    : "hover:bg-muted"
                }`}
                onClick={() => setFilter("adjustment")}
              >
                Adjustments
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-36">Date</TableHead>
                  <TableHead className="w-40">Stock ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="w-60">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-60 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                        <Package size={48} className="mb-2 opacity-40" />
                        <p className="mb-1">No stock entries found</p>
                        <p className="text-sm">
                          {searchTerm || filter !== "all"
                            ? "Try changing your search or filter criteria"
                            : "Add your first stock entry to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStockEntries.map((entry, index) => (
                    <TableRow
                      key={`${entry.id}-${entry.invoice_number || index}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={16}
                            className="text-muted-foreground"
                          />
                          {formatDate(entry.date_added)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-1 py-0.5 rounded text-xs">
                            {entry.invoice_number}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="font-medium">
                            {entry.product_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getEntryTypeColor(
                            entry.entry_type
                          )} hover:${getEntryTypeColor(entry.entry_type)}`}
                        >
                          {entry.entry_type.charAt(0).toUpperCase() +
                            entry.entry_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(entry.unit_price))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(
                          entry.quantity * parseFloat(entry.unit_price)
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {entry.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Infinite Scroll Loader */}
            {stockEntriesNextPage && (
              <div
                ref={stockEntriesLoadMoreRef}
                className="flex justify-center py-4"
              >
                {loadingMoreEntries ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading more entries...</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const nextPage = stockEntriesPage + 1;
                      setStockEntriesPage(nextPage);
                      fetchStockEntries(nextPage, true);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Load more entries
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Create Stock Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Stock Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStockEntry}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">
                  Product <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newStockEntry.product}
                  onValueChange={(value) => {
                    const selectedProduct = products.find(
                      (p) => p.id.toString() === value
                    );

                    setNewStockEntry({
                      ...newStockEntry,
                      product: value,
                      unit_price:
                        selectedProduct?.cost_price || newStockEntry.unit_price,
                    });
                    setProductSearchTerm(""); // Clear search term when a product is selected
                  }}
                >
                  <SelectTrigger id="product" className="w-full">
                    <SelectValue placeholder="Select a product">
                      {newStockEntry.product
                        ? products.find(
                            (p) => p.id.toString() === newStockEntry.product
                          )?.name
                        : "Select a product"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <div className="px-2 py-2 top-0 bg-background border-b sticky">
                      <Input
                        placeholder="Search products..."
                        className="h-8"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        onFocus={(e) => e.stopPropagation()} // Prevent select from closing
                      />
                    </div>

                    {loadingMoreProducts ? (
                      <div className="flex items-center justify-center py-4 text-muted-foreground">
                        <Loader2 size={16} className="animate-spin mr-2" />
                        <span>Loading products...</span>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        {productSearchTerm
                          ? "No matching products found"
                          : "No products available"}
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <SelectItem
                          key={`product-${product.id}`}
                          value={product.id.toString()}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              SKU: {product.sku}{" "}
                              {product.cost_price
                                ? `| Price: ${formatCurrency(
                                    product.cost_price
                                  )}`
                                : ""}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry_type">
                  Entry Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newStockEntry.entry_type}
                  onValueChange={(value) =>
                    setNewStockEntry({ ...newStockEntry, entry_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newStockEntry.quantity}
                    onChange={(e) =>
                      setNewStockEntry({
                        ...newStockEntry,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit_price">
                    Unit Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newStockEntry.unit_price}
                    onChange={(e) =>
                      setNewStockEntry({
                        ...newStockEntry,
                        unit_price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional information about this stock entry"
                  value={newStockEntry.notes}
                  onChange={(e) =>
                    setNewStockEntry({
                      ...newStockEntry,
                      notes: e.target.value,
                    })
                  }
                  className="resize-none h-20"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setProductSearchTerm("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newStockEntry.product || newStockEntry.quantity <= 0}
              >
                Add Stock Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const StockEntriesPageWithLayout = () => {
  return (
    <DashboardLayout>
      <StockEntriesPage />
    </DashboardLayout>
  );
};

export default StockEntriesPageWithLayout;
