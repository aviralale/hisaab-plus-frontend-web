import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingCart,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/loader";

// Interfaces from the provided types
export interface Business {
  id: number;
  name: string;
  address: string;
  created_at: string;
  users_count?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  business: number | null;
  business_details?: Business;
  role: string;
  role_display: string;
  is_active: boolean;
  date_joined: string;
  last_login: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  image: string | null;
  description: string;
  category: number;
  category_name: string;
  supplier: number;
  supplier_name: string;
  stock: number;
  reorder_level: number;
  cost_price: number;
  selling_price: number;
  profit_margin: number;
  stock_value: number;
  needs_reorder: boolean;
  is_active: boolean;
}

export interface StockEntry {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  date_added: string;
  created_by: number;
  notes?: string;
}

export interface SaleItem {
  id?: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  sale_date: string;
  total_amount: number;
  amount_paid: number;
  invoice_number: string;
  payment_status: string;
  balance: number;
  payment_method: string;
  created_by: number;
  items: SaleItem[];
  note?: string;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
}

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Enhanced customer information
  const [customer, setCustomer] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("products");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<
    { name: string; phone: string; email: string }[]
  >([]);
  const [showRecentCustomers, setShowRecentCustomers] =
    useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>("amount"); // "amount" or "percentage"
  const [invoicePreviewMode, setInvoicePreviewMode] = useState<boolean>(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        // fetchRecentSales(),
        fetchRecentCustomers(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load initial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Replace with your API call
      const response = await fetch("/api/products/");
      const data = await response.json();
      setProducts(data.filter((p: Product) => p.is_active));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      // Replace with your API call
      const response = await fetch("/api/categories/");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  // const fetchRecentSales = async () => {
  //   try {
  //     // Replace with your API call
  //     // const response = await fetch("/api/sales/?limit=5");
  //     // const data = await response.json();
  //     // setRecentSales(data.results || []);
  //   } catch (error) {
  //     console.error("Error fetching recent sales:", error);
  //     throw error;
  //   }
  // };

  const fetchRecentCustomers = async () => {
    try {
      // Replace with your API call
      const response = await fetch("/api/customers/recent/?limit=5");
      const data = await response.json();
      setRecentCustomers(data.results || []);
    } catch (error) {
      console.error("Error fetching recent customers:", error);
      // Don't throw, this is secondary data
    }
  };

  const handleAddItem = () => {
    const productId = parseInt(selectedProduct);
    if (!productId || quantity <= 0) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.stock < quantity) {
      toast.error(
        `Insufficient Stock! Only ${product.stock} units available for ${product.name}`
      );
      return;
    }

    // Check if product already exists in the list
    const existingItemIndex = saleItems.findIndex(
      (item) => item.product === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...saleItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;

      if (product.stock < newQuantity) {
        toast.error(
          `Insufficient Stock! Cannot add ${quantity} more units. Only ${product.stock} units available in total.`
        );
        return;
      }

      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].subtotal =
        newQuantity * updatedItems[existingItemIndex].unit_price;

      setSaleItems(updatedItems);
    } else {
      // Add new item
      const newItem: SaleItem = {
        product: productId,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.selling_price,
        subtotal: quantity * product.selling_price,
      };

      setSaleItems([...saleItems, newItem]);
    }

    // Reset selection
    setSelectedProduct("");
    setQuantity(1);

    // Auto switch to cart tab after adding an item
    setActiveTab("cart");

    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleAddProductDirectly = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    // Check if product already exists in the list
    const existingItemIndex = saleItems.findIndex(
      (item) => item.product === product.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...saleItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + 1;

      if (product.stock < newQuantity) {
        toast.error(`No more stock available for ${product.name}`);
        return;
      }

      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].subtotal =
        newQuantity * updatedItems[existingItemIndex].unit_price;

      setSaleItems(updatedItems);
    } else {
      // Add new item
      const newItem: SaleItem = {
        product: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.selling_price,
        subtotal: product.selling_price,
      };

      setSaleItems([...saleItems, newItem]);
    }

    // Auto switch to cart tab after adding an item
    setActiveTab("cart");

    toast.success(`Added ${product.name} to cart`);
  };

  const handleRemoveItem = (index: number) => {
    const productName = saleItems[index].product_name;
    const updatedItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(updatedItems);
    toast.info(`Removed ${productName} from cart`);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const productId = saleItems[index].product;
    const product = products.find((p) => p.id === productId);

    if (!product || product.stock < newQuantity) {
      toast.error(
        `Only ${product?.stock || 0} units available for ${product?.name}`
      );
      return;
    }

    const updatedItems = [...saleItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].subtotal = newQuantity * updatedItems[index].unit_price;
    setSaleItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateDiscount = () => {
    if (!discountAmount) return 0;

    if (discountType === "percentage") {
      return (calculateSubtotal() * discountAmount) / 100;
    }

    return discountAmount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const calculateBalance = () => {
    return calculateTotal() - amountPaid;
  };

  const getPaymentStatus = () => {
    const total = calculateTotal();
    if (total === 0) return "unpaid";
    if (amountPaid >= total) return "paid";
    if (amountPaid > 0) return "partial";
    return "unpaid";
  };
  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500">Partial</Badge>;
      case "unpaid":
        return <Badge className="bg-red-500">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const selectCustomer = (customerData: {
    name: string;
    phone: string;
    email: string;
  }) => {
    setCustomer(customerData);
    setShowRecentCustomers(false);
    toast.success(`Selected customer: ${customerData.name}`);
  };

  const handleCreateSale = async () => {
    if (saleItems.length === 0) {
      toast.error("Please add at least one item to the sale");
      return;
    }

    if (!customer.name.trim()) {
      toast.error("Please enter a customer name");
      return;
    }

    try {
      setSubmitting(true);
      // Format sale data according to the Sale interface
      const saleData: Partial<Sale> = {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || undefined,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        note: notes,
        // Include discount information in the notes if applicable
        ...(discountAmount > 0 && {
          note: `${notes ? notes + "\n" : ""}Discount: ${
            discountType === "percentage"
              ? `${discountAmount}%`
              : formatCurrency(discountAmount)
          }`,
        }),
        items: saleItems.map((item) => ({
          product: item.product,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        })),
      };

      // Replace with your API call
      const response = await fetch("/api/sales/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create sale");
      }

      const newSale = await response.json();

      toast.success("Sale has been successfully created");

      // Navigate to the sale detail page
      navigate(`/sales/${newSale.id}`);
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create sale. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyFullPayment = () => {
    setAmountPaid(calculateTotal());
    toast.info("Full payment amount applied");
  };

  const toggleInvoicePreview = () => {
    setInvoicePreviewMode(!invoicePreviewMode);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const getFilteredProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category === parseInt(selectedCategory)
      );
    }

    // Only show products with stock
    filtered = filtered.filter((p) => p.stock > 0 && p.is_active);

    return filtered;
  };

  // Generate a draft invoice number for preview
  const getDraftInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `INV-${year}${month}${day}-${random}`;
  };

  if (loading) {
    return <Loader />;
  }

  // Invoice Preview Mode
  if (invoicePreviewMode) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={toggleInvoicePreview}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Sale
          </Button>
          <h1 className="text-2xl font-bold">Invoice Preview</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
                <p className="text-gray-500">
                  {getDraftInvoiceNumber()} (Draft)
                </p>
                <p className="text-gray-500">
                  Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <h3 className="font-bold">Your Business Name</h3>
                <p className="text-gray-500">Address Line 1</p>
                <p className="text-gray-500">City, State, ZIP</p>
                <p className="text-gray-500">Phone: (123) 456-7890</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold mb-2">Bill To:</h3>
              <p>{customer.name || "Customer Name"}</p>
              {customer.phone && <p>Phone: {customer.phone}</p>}
              {customer.email && <p>Email: {customer.email}</p>}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Subtotal:
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateSubtotal())}
                  </TableCell>
                </TableRow>

                {discountAmount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Discount (
                      {discountType === "percentage"
                        ? `${discountAmount}%`
                        : ""}
                      ):
                    </TableCell>
                    <TableCell className="text-right">
                      -{formatCurrency(calculateDiscount())}
                    </TableCell>
                  </TableRow>
                )}

                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(calculateTotal())}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Amount Paid:
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(amountPaid)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Balance Due:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(calculateBalance())}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-8">
              <h3 className="font-bold mb-2">Payment Status:</h3>
              {getPaymentStatusBadge(getPaymentStatus())}

              <h3 className="font-bold mt-4 mb-2">Payment Method:</h3>
              <p>
                {paymentMethod.charAt(0).toUpperCase() +
                  paymentMethod.slice(1).replace("_", " ")}
              </p>

              {notes && (
                <>
                  <h3 className="font-bold mt-4 mb-2">Notes:</h3>
                  <p className="whitespace-pre-line">{notes}</p>
                </>
              )}
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>Thank you for your business!</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={toggleInvoicePreview}>
            Back to Sale
          </Button>
          <Button
            disabled={
              saleItems.length === 0 || !customer.name.trim() || submitting
            }
            onClick={handleCreateSale}
          >
            {submitting ? "Creating Sale..." : "Complete Sale"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/sales")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Sales
        </Button>
        <h1 className="text-2xl font-bold">New Sale</h1>
        <Badge variant="outline" className="flex items-center gap-2">
          <ShoppingCart size={16} />
          {saleItems.length} items
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Product Selection and Cart */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="cart" className="relative">
                Cart
                {saleItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {saleItems.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <Label htmlFor="searchProduct">Search Products</Label>
                      <Input
                        id="searchProduct"
                        placeholder="Search by name or SKU"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex-1">
                      <Label htmlFor="categoryFilter">Filter by Category</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger id="categoryFilter">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {getFilteredProducts().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No products match your filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {getFilteredProducts().map((product) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddProductDirectly(product)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <h3 className="font-semibold truncate">
                                {product.name}
                              </h3>
                              <span className="text-sm text-gray-500">
                                #{product.sku}
                              </span>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="font-medium text-primary">
                                {formatCurrency(product.selling_price)}
                              </span>
                              <Badge
                                variant={
                                  product.stock > product.reorder_level
                                    ? "outline"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                Stock: {product.stock}
                              </Badge>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {product.category_name}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="product">Select Product</Label>
                      <Select
                        value={selectedProduct}
                        onValueChange={setSelectedProduct}
                      >
                        <SelectTrigger id="product">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products
                            .filter((p) => p.stock > 0 && p.is_active)
                            .map((product) => (
                              <SelectItem
                                key={product.id}
                                value={product.id.toString()}
                              >
                                {product.name} -{" "}
                                {formatCurrency(product.selling_price)} (Stock:{" "}
                                {product.stock})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:w-28">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="self-end">
                      <Button
                        onClick={handleAddItem}
                        disabled={!selectedProduct || quantity <= 0}
                        className="w-full md:w-auto"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cart">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Sale Items</span>
                    {saleItems.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSaleItems([])}
                      >
                        Clear Cart
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {saleItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart
                        size={32}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <p>No items added to sale yet</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab("products")}
                      >
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      index,
                                      item.quantity - 1
                                    )
                                  }
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="w-10 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      index,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.subtotal)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-right font-medium"
                          >
                            Subtotal:
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(calculateSubtotal())}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {discountAmount > 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-medium"
                            >
                              Discount (
                              {discountType === "percentage"
                                ? `${discountAmount}%`
                                : ""}
                              ):
                            </TableCell>
                            <TableCell className="text-right">
                              -{formatCurrency(calculateDiscount())}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-right font-bold"
                          >
                            Total:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(calculateTotal())}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Customer Info and Summary */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                      placeholder="Enter customer name"
                      className="mb-1"
                      required
                    />
                    {!showRecentCustomers && recentCustomers.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRecentCustomers(true)}
                        className="text-xs px-2"
                      >
                        Show recent customers
                      </Button>
                    )}
                    {showRecentCustomers && (
                      <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg w-full">
                        <div className="p-2 border-b flex justify-between items-center">
                          <span className="font-medium">Recent Customers</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowRecentCustomers(false)}
                            className="h-6 w-6 p-0"
                          >
                            &times;
                          </Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto p-1">
                          {recentCustomers.map((cust, i) => (
                            <div
                              key={i}
                              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => selectCustomer(cust)}
                            >
                              <p className="font-medium">{cust.name}</p>
                              <p className="text-xs text-gray-500">
                                {cust.phone}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="mobile_payment">
                        Mobile Payment
                      </SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amountPaid">Amount Paid</Label>
                  <div className="flex gap-2">
                    <Input
                      id="amountPaid"
                      type="number"
                      min={0}
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) =>
                        setAmountPaid(parseFloat(e.target.value) || 0)
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyFullPayment}
                      className="whitespace-nowrap"
                    >
                      Full Amount
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div>
                    <Label htmlFor="discountType">Discount</Label>
                    <div className="flex gap-2">
                      <Select
                        value={discountType}
                        onValueChange={setDiscountType}
                      >
                        <SelectTrigger id="discountType" className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amount">Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        step={discountType === "percentage" ? "1" : "0.01"}
                        max={
                          discountType === "percentage"
                            ? 100
                            : calculateSubtotal()
                        }
                        value={discountAmount}
                        onChange={(e) =>
                          setDiscountAmount(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500">Discount:</span>
                      <span>-{formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between mt-2 font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span>{formatCurrency(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between mt-2 font-medium">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(calculateBalance())}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500">Payment Status:</span>
                    {getPaymentStatusBadge(getPaymentStatus())}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this sale"
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={toggleInvoicePreview}
              className="flex items-center gap-2"
              disabled={saleItems.length === 0}
            >
              <FileText size={16} />
              Preview Invoice
            </Button>

            <Button
              disabled={
                saleItems.length === 0 || !customer.name.trim() || submitting
              }
              onClick={handleCreateSale}
              className="flex items-center gap-2"
            >
              {submitting ? "Creating Sale..." : "Complete Sale"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
