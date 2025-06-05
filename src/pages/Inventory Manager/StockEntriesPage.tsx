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
  TrendingUp,
  RotateCcw,
  Eye,
  ChevronDown,
  AlertCircle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DashboardLayout from "@/components/layouts/DashboardLayout";

function StockEntriesPage() {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStockEntry, setNewStockEntry] = useState({
    product: "",
    entry_type: "purchase",
    quantity: 1,
    unit_price: 0,
    cost_price: 0,
    actual_selling_price: 0,
    notes: "",
  });
  const [filter, setFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "entries">(
    "overview"
  );

  // Pagination states
  const [stockEntriesPage, setStockEntriesPage] = useState(1);
  const [stockEntriesNextPage, setStockEntriesNextPage] = useState<
    string | null
  >(null);
  const [loadingMoreEntries, setLoadingMoreEntries] = useState(false);

  const { get, post } = useApi();
  const { user } = useAuth();

  // Refs for intersection observer
  const stockEntriesObserverRef = useRef<IntersectionObserver | null>(null);
  const stockEntriesLoadMoreRef = useRef<HTMLDivElement>(null);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm.trim()) return products.slice(0, 20); // Show only first 20 by default

    return products
      .filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(productSearchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase())
      )
      .slice(0, 20);
  }, [products, productSearchTerm]);

  // Quick entry products (most recent or frequently used)
  const quickEntryProducts = useMemo(() => {
    const recentProducts = products
      .filter((product) => product.is_active)
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      )
      .slice(0, 6);
    return recentProducts;
  }, [products]);

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

  const fetchProducts = async () => {
    try {
      const data = await get<ProductsResponse>(
        "/products/?page_size=100&is_active=true"
      );
      setProducts(data.results);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    setStockEntriesPage(1);
    await Promise.all([fetchProducts(), fetchStockEntries(1, false)]);
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
    fetchProducts();
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
        quantity: newStockEntry.quantity || 1,
        unit_price: newStockEntry.unit_price || 0,
        cost_price: newStockEntry.cost_price || 0,
        actual_selling_price: newStockEntry.actual_selling_price || 0,
        entry_type: newStockEntry.entry_type,
        notes: newStockEntry.notes || "",
        invoice_number: generateInvoiceNumber("stockEntry"),
      };
      if (!newStockEntry.unit_price || newStockEntry.unit_price <= 0) {
        toast.error("Unit price is required and must be greater than 0");
        return;
      }

      if (!newStockEntry.cost_price || newStockEntry.cost_price <= 0) {
        toast.error("Cost price is required and must be greater than 0");
        return;
      }

      if (
        !newStockEntry.actual_selling_price ||
        newStockEntry.actual_selling_price <= 0
      ) {
        toast.error("Selling price is required and must be greater than 0");
        return;
      }

      const response = await post("/stock-entries/", stockEntryData);

      const newEntry: StockEntry = {
        ...response,
        product_name: productObj.name,
        date_added: new Date().toISOString(),
        created_by: user?.id,
      };

      setStockEntries((prev) => [newEntry, ...prev]);
      toast.success(
        `${
          newStockEntry.entry_type.charAt(0).toUpperCase() +
          newStockEntry.entry_type.slice(1)
        } entry created successfully`
      );
      resetForm();
    } catch (error) {
      console.error("Error creating stock entry:", error);
      toast.error(
        "Failed to create stock entry. Please check all required fields."
      );
    }
  };

  const resetForm = () => {
    setIsCreateDialogOpen(false);
    setNewStockEntry({
      product: "",
      entry_type: "purchase",
      quantity: 1,
      unit_price: 0,
      cost_price: 0,
      actual_selling_price: 0,
      notes: "",
    });
    setProductSearchTerm("");
    setSelectedProduct(null);
  };

  const handleQuickEntry = (product: Product, type: string) => {
    setSelectedProduct(product);
    setNewStockEntry({
      product: product.id.toString(),
      entry_type: type,
      quantity: 1,
      unit_price: product.cost_price || 0,
      cost_price: product.cost_price || 0,
      actual_selling_price: product.selling_price || 0,
      notes: "",
    });
    setIsCreateDialogOpen(true);
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

  const getEntryTypeConfig = (type: string) => {
    switch (type) {
      case "purchase":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: TrendingUp,
          label: "Purchase",
        };
      case "return":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: RotateCcw,
          label: "Return",
        };
      case "adjustment":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: AlertCircle,
          label: "Adjustment",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Package,
          label: type,
        };
    }
  };

  const handleExportCSV = () => {
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

  const purchaseEntries = filteredStockEntries.filter(
    (entry) => entry.entry_type === "purchase"
  );
  const returnEntries = filteredStockEntries.filter(
    (entry) => entry.entry_type === "return"
  );
  const adjustmentEntries = filteredStockEntries.filter(
    (entry) => entry.entry_type === "adjustment"
  );

  const totalPurchaseValue = purchaseEntries.reduce(
    (total, entry) => total + entry.quantity * parseFloat(entry.unit_price),
    0
  );

  const totalReturnValue = returnEntries.reduce(
    (total, entry) => total + entry.quantity * parseFloat(entry.unit_price),
    0
  );

  const recentEntries = stockEntries.slice(0, 5);

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">Stock Management</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your inventory movements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus size={16} />
                New Entry
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package size={16} />
                  Total Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredStockEntries.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filter === "all" ? "All entries" : `Filtered entries`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp size={16} />
                  Purchases
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

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <RotateCcw size={16} />
                  Returns
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

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={16} />
                  Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {adjustmentEntries.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Stock adjustments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "entries"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("entries")}
            >
              All Entries
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Frequently used products for quick stock entry
                  </p>
                </CardHeader>
                <CardContent>
                  {quickEntryProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {quickEntryProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.sku}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Stock: {product.stock}
                                </p>
                              </div>
                              <Package
                                size={16}
                                className="text-muted-foreground"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={() =>
                                  handleQuickEntry(product, "purchase")
                                }
                              >
                                <TrendingUp size={12} className="mr-1" />
                                Purchase
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs"
                                onClick={() =>
                                  handleQuickEntry(product, "return")
                                }
                              >
                                <RotateCcw size={12} className="mr-1" />
                                Return
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package size={48} className="mx-auto mb-2 opacity-40" />
                      <p>No products available for quick entry</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Entries */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Entries</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Latest stock movements
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("entries")}
                    className="flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentEntries.length > 0 ? (
                    <div className="space-y-3">
                      {recentEntries.map((entry, index) => {
                        const config = getEntryTypeConfig(entry.entry_type);
                        const IconComponent = config.icon;

                        return (
                          <div
                            key={`recent-${entry.id}-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${config.color}`}
                              >
                                <IconComponent size={16} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {entry.product_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(entry.date_added)} • Qty:{" "}
                                  {entry.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                {formatCurrency(
                                  entry.quantity *
                                    parseFloat(entry.cost_price || "")
                                )}
                              </p>
                              <Badge className={`text-xs ${config.color}`}>
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar size={48} className="mx-auto mb-2 opacity-40" />
                      <p>No recent entries found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "entries" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 min-w-32"
                    >
                      <Filter size={16} />
                      {filter === "all" ? "All Types" : filter}
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilter("all")}>
                      All Types
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("purchase")}>
                      Purchases
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("return")}>
                      Returns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("adjustment")}>
                      Adjustments
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Entries Table */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader />
                </div>
              ) : (
                <Card className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-60 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                              <Package size={48} className="mb-2 opacity-40" />
                              <p className="mb-1">No stock entries found</p>
                              <p className="text-sm">
                                {searchTerm || filter !== "all"
                                  ? "Try adjusting your filters"
                                  : "Create your first stock entry"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStockEntries.map((entry, index) => {
                          const config = getEntryTypeConfig(entry.entry_type);
                          const IconComponent = config.icon;

                          return (
                            <TableRow
                              key={`${entry.id}-${index}`}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar
                                    size={14}
                                    className="text-muted-foreground"
                                  />
                                  <span className="text-sm">
                                    {formatDate(entry.date_added)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Package
                                    size={14}
                                    className="text-muted-foreground"
                                  />
                                  <span className="font-medium">
                                    {entry.product_name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${config.color} flex items-center gap-1 w-fit`}
                                >
                                  <IconComponent size={12} />
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {entry.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {parseFloat(entry.cost_price || "")}
                              </TableCell>
                              <TableCell className="text-right font-medaium">
                                {entry.quantity *
                                  parseFloat(entry.cost_price || "")}
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate text-muted-foreground cursor-help">
                                      {entry.notes || "-"}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">
                                      {entry.notes || "No notes"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>

                  {/* Load More */}
                  {stockEntriesNextPage && (
                    <div
                      ref={stockEntriesLoadMoreRef}
                      className="flex justify-center py-4 border-t"
                    >
                      {loadingMoreEntries ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Loading more entries...</span>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm">
                          Load more entries
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Create Stock Entry Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedProduct
                    ? `${selectedProduct.name} - New Entry`
                    : "New Stock Entry"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStockEntry}>
                <div className="grid gap-4 py-4">
                  {!selectedProduct && (
                    <div className="grid gap-2">
                      <Label htmlFor="product">Product *</Label>
                      <Select
                        value={newStockEntry.product}
                        onValueChange={(value) => {
                          const selectedProd = products.find(
                            (p) => p.id.toString() === value
                          );
                          setSelectedProduct(selectedProd || null);
                          setNewStockEntry({
                            ...newStockEntry,
                            product: value,
                            unit_price: selectedProd?.cost_price || 0,
                            cost_price: selectedProd?.cost_price || 0,
                            actual_selling_price:
                              selectedProd?.selling_price || 0,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <div className="p-2">
                            <Input
                              placeholder="Search products..."
                              value={productSearchTerm}
                              onChange={(e) =>
                                setProductSearchTerm(e.target.value)
                              }
                              className="mb-2"
                            />
                          </div>
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                              <SelectItem
                                key={product.id}
                                value={product.id.toString()}
                              >
                                <div className="flex flex-col">
                                  <span>{product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    SKU: {product.sku} • Stock: {product.stock}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : productSearchTerm ? (
                            <div className="p-2 text-center text-muted-foreground text-sm">
                              No products found
                            </div>
                          ) : (
                            <div className="p-2 text-center text-muted-foreground text-sm">
                              Type to search products
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="entry_type">Entry Type *</Label>
                    <Select
                      value={newStockEntry.entry_type}
                      onValueChange={(value) =>
                        setNewStockEntry({
                          ...newStockEntry,
                          entry_type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-600" />
                            Purchase
                          </div>
                        </SelectItem>
                        <SelectItem value="return">
                          <div className="flex items-center gap-2">
                            <RotateCcw size={16} className="text-amber-600" />
                            Return
                          </div>
                        </SelectItem>
                        <SelectItem value="adjustment">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-blue-600" />
                            Adjustment
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newStockEntry.quantity}
                        onChange={(e) =>
                          setNewStockEntry({
                            ...newStockEntry,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit_price">Unit Price *</Label>
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
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost_price">Cost Price *</Label>
                      <Input
                        id="cost_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newStockEntry.cost_price}
                        onChange={(e) =>
                          setNewStockEntry({
                            ...newStockEntry,
                            cost_price: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="actual_selling_price">
                        Selling Price *
                      </Label>
                      <Input
                        id="actual_selling_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newStockEntry.actual_selling_price}
                        onChange={(e) =>
                          setNewStockEntry({
                            ...newStockEntry,
                            actual_selling_price:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Optional notes about this stock entry..."
                      value={newStockEntry.notes}
                      onChange={(e) =>
                        setNewStockEntry({
                          ...newStockEntry,
                          notes: e.target.value,
                        })
                      }
                      className="min-h-20"
                    />
                  </div>

                  {selectedProduct && (
                    <Card className="bg-muted/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">
                              {selectedProduct.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Current Stock: {selectedProduct.stock} units
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Total:{" "}
                              {formatCurrency(
                                newStockEntry.quantity *
                                  newStockEntry.unit_price
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newStockEntry.product}>
                    Create Entry
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}

export default StockEntriesPage;
