import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingCart,
  User,
  FileText,
  Image as ImageIcon,
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
import { useApi } from "@/contexts/ApiContext";
import { Product, ProductsResponse, Sale, SaleItem } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { CustomPagination } from "@/components/custom-pagination";

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
  const { get, post } = useApi();
  const { user } = useAuth();

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
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>("amount");
  const [invoicePreviewMode, setInvoicePreviewMode] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page") || "1");

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, searchTerm]);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);

      // Build query parameters for the API call
      let queryParams = `page=${page}`;

      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await get<ProductsResponse>(`/products/?${queryParams}`);

      // Update products and pagination data
      setProducts(response.results.filter((p: Product) => p.is_active));
      setTotalItems(response.count);

      // Calculate total pages (assuming default of 10 items per page)
      const itemsPerPage = 10;
      setTotalPages(Math.ceil(response.count / itemsPerPage));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset to first page when search term changes
    setSearchParams({ page: "1" });
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

    const sellingPrice = product.selling_price;

    const existingItemIndex = saleItems.findIndex(
      (item) => item.product === productId
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...saleItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;

      if (product.stock < newQuantity) {
        toast.error(
          `Insufficient Stock! Cannot add ${quantity} more units. Only ${product.stock} units available in total.`
        );
        return;
      }

      // Make sure to calculate with numeric values
      const unitPrice = parseFloat(updatedItems[existingItemIndex].unit_price);
      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].subtotal = newQuantity * unitPrice;

      setSaleItems(updatedItems);
    } else {
      // Add new item with correct numeric calculations
      const newItem = {
        product: productId,
        product_name: product.name,
        quantity: quantity,
        unit_price: `${sellingPrice}`, // Keep as string for consistency
        subtotal: quantity * sellingPrice, // Calculate with numeric value
      };

      setSaleItems([...saleItems, newItem]);
    }

    setSelectedProduct("");
    setQuantity(1);
    setActiveTab("cart");

    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleAddProductDirectly = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    // Convert string price to number for calculations
    const sellingPrice = product.selling_price;

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

      const unitPrice = parseFloat(updatedItems[existingItemIndex].unit_price);
      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].subtotal = newQuantity * unitPrice;

      setSaleItems(updatedItems);
    } else {
      // Add new item with correct numeric calculations
      const newItem = {
        product: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: `${sellingPrice}`, // Keep as string for consistency
        subtotal: sellingPrice, // Calculate with numeric value
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
    const unitPrice = parseFloat(updatedItems[index].unit_price);
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].subtotal = newQuantity * unitPrice;
    setSaleItems(updatedItems);
  };

  const calculateSubtotal = () => {
    if (!saleItems || saleItems.length === 0) return 0;
    return saleItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  };

  const calculateDiscount = () => {
    if (!discountAmount || isNaN(discountAmount)) return 0;
    const subtotal = calculateSubtotal();

    if (discountType === "percentage") {
      return (subtotal * discountAmount) / 100;
    }

    return discountAmount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    return total - (amountPaid || 0);
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
  console.log("Business ID", user?.business_details?.id);

  const handleCreateSale = async () => {
    if (saleItems.length === 0) {
      toast.error("Please add at least one item to the sale");
      return;
    }

    if (!customer.name.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    const stockIssues = [];

    for (const item of saleItems) {
      const product = products.find((p) => p.id === item.product);
      if (!product) {
        stockIssues.push(`Product "${item.product_name}" not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        stockIssues.push(
          `Not enough stock for "${item.product_name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    if (stockIssues.length > 0) {
      toast.error(
        <div>
          <p>Cannot create sale due to insufficient stock:</p>
          <ul className="list-disc pl-4 mt-2">
            {stockIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    try {
      setSubmitting(true);
      // Format sale data according to the Sale interface
      const saleData: Partial<Sale> = {
        business: user?.business_details?.id,
        invoice_number: generateInvoiceNumber("sale"),
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        payment_method: paymentMethod,
        paid_amount: `${amountPaid || 0}`,
        note: notes,
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
      const response = await post("/sales/", saleData);
      const newSale = await response;
      toast.success("Sale has been successfully created");
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
    if (isNaN(amount)) return "NPR 0.00";

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
          (p.sku && p.sku.toLowerCase().includes(term))
      );
    }
    filtered = filtered.filter((p) => p.stock > 0 && p.is_active);

    return filtered;
  };
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
                <h3 className="font-bold">{user?.business_details?.name}</h3>
                <p className="text-gray-500">
                  {user?.business_details?.address}
                </p>
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
                      {formatCurrency(parseFloat(item.unit_price))}
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
                    {formatCurrency(amountPaid || 0)}
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
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
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
                          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleAddProductDirectly(product)}
                        >
                          <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon size={40} />
                                <span className="text-xs mt-2">No image</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <h3 className="font-semibold truncate">
                                {product.name}
                              </h3>
                              <span className="text-sm text-gray-500">
                                #{product.sku || "N/A"}
                              </span>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="font-medium text-primary">
                                {formatCurrency(product.selling_price)}
                              </span>
                              <Badge
                                variant={
                                  product.stock > (product.reorder_level || 5)
                                    ? "outline"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                Stock: {product.stock}
                              </Badge>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {product.category_name || "Uncategorized"}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CustomPagination
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  totalPages={totalPages}
                  totalItems={totalItems}
                />
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
                          setQuantity(parseInt(e.target.value) || 1)
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
                              {formatCurrency(parseFloat(item.unit_price))}
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
                            className="text-right font-medium"
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

        {/* Right Side - Sale Summary and Customer Information */}
        <div>
          <Tabs defaultValue="customer" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">
                <User size={16} className="mr-2" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="payment">
                <FileText size={16} className="mr-2" />
                Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      placeholder="Enter phone number"
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email Address</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="Enter email address"
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer({ ...customer, email: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="mobile_payment">
                          Mobile Payment
                        </SelectItem>
                        <SelectItem value="credit">Store Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select
                        value={discountType}
                        onValueChange={setDiscountType}
                      >
                        <SelectTrigger id="discountType">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amount">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="discountAmount">
                        {discountType === "percentage"
                          ? "Discount %"
                          : "Discount Amount"}
                      </Label>
                      <Input
                        id="discountAmount"
                        type="number"
                        min={0}
                        value={discountAmount || ""}
                        onChange={(e) =>
                          setDiscountAmount(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="paidAmount">Amount Paid</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleApplyFullPayment}
                      >
                        Apply Full Amount
                      </Button>
                    </div>
                    <Input
                      id="paidAmount"
                      type="number"
                      min={0}
                      value={amountPaid || ""}
                      onChange={(e) =>
                        setAmountPaid(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="saleNotes">Notes</Label>
                    <Textarea
                      id="saleNotes"
                      placeholder="Add sale notes (optional)"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Sale Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-500">Items:</div>
                <div className="text-right font-medium">
                  {saleItems.reduce((sum, item) => sum + item.quantity, 0)} (
                  {saleItems.length} unique)
                </div>

                <div className="text-gray-500">Subtotal:</div>
                <div className="text-right font-medium">
                  {formatCurrency(calculateSubtotal())}
                </div>

                <div className="text-gray-500">Discount:</div>
                <div className="text-right font-medium">
                  {formatCurrency(calculateDiscount())}
                </div>

                <div className="text-gray-500">Total:</div>
                <div className="text-right font-bold">
                  {formatCurrency(calculateTotal())}
                </div>

                <div className="text-gray-500">Amount Paid:</div>
                <div className="text-right font-medium">
                  {formatCurrency(amountPaid || 0)}
                </div>

                <div className="text-gray-500">Balance:</div>
                <div className="text-right font-bold">
                  {formatCurrency(calculateBalance())}
                </div>

                <div className="text-gray-500">Payment Status:</div>
                <div className="text-right">
                  {getPaymentStatusBadge(getPaymentStatus())}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <Button
              className="w-full"
              onClick={toggleInvoicePreview}
              disabled={saleItems.length === 0}
            >
              Preview Invoice
            </Button>
            <Button
              className="w-full"
              variant="default"
              disabled={
                saleItems.length === 0 || !customer.name.trim() || submitting
              }
              onClick={handleCreateSale}
            >
              {submitting ? "Creating Sale..." : "Complete Sale"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
