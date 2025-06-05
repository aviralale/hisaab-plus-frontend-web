import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { useApi } from "@/contexts/ApiContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Product, ProductsResponse, Sale, SaleItem } from "@/types";
import { generateInvoiceNumber } from "@/lib/invoice-number";

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isQuantityMode, setIsQuantityMode] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState("1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const { get, post } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await get<ProductsResponse>(
        "/products/?page=1&limit=1000"
      );
      setProducts(
        response.results.filter((p: Product) => p.is_active && p.stock > 0)
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter products as user types
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = products
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.sku &&
              product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 8); // Show max 8 results

      setFilteredProducts(filtered);
      setSelectedProductIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setFilteredProducts([]);
      setSelectedProductIndex(-1);
    }
  }, [searchTerm, products]);

  // Focus search input on mount
  useEffect(() => {
    if (searchRef.current && !isQuantityMode) {
      searchRef.current.focus();
    }
  }, [isQuantityMode]);

  // Focus quantity input when in quantity mode
  useEffect(() => {
    if (quantityRef.current && isQuantityMode) {
      quantityRef.current.focus();
      quantityRef.current.select();
    }
  }, [isQuantityMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isQuantityMode) {
      if (e.key === "Enter") {
        addToCart(pendingProduct!, parseInt(quantityInput) || 1);
        setIsQuantityMode(false);
        setPendingProduct(null);
        setQuantityInput("1");
        setSearchTerm("");
        setTimeout(() => searchRef.current?.focus(), 100);
      } else if (e.key === "Escape") {
        setIsQuantityMode(false);
        setPendingProduct(null);
        setQuantityInput("1");
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedProductIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedProductIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    } else if (e.key === "Enter" && selectedProductIndex >= 0) {
      e.preventDefault();
      const product = filteredProducts[selectedProductIndex];
      setPendingProduct(product);
      setIsQuantityMode(true);
    } else if (e.key === "Escape") {
      setSearchTerm("");
      setFilteredProducts([]);
      setSelectedProductIndex(-1);
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    if (!product || quantity <= 0) return;

    if (product.stock < quantity) {
      toast.error(
        `Insufficient stock! Only ${product.stock} units available for ${product.name}`
      );
      return;
    }

    const existingIndex = cart.findIndex((item) => item.product === product.id);

    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newQuantity = newCart[existingIndex].quantity + quantity;

      if (product.stock < newQuantity) {
        toast.error(
          `Cannot add ${quantity} more units. Only ${product.stock} units available in total.`
        );
        return;
      }

      newCart[existingIndex].quantity = newQuantity;
      newCart[existingIndex].subtotal = newQuantity * product.selling_price;
      setCart(newCart);
    } else {
      const newItem: SaleItem = {
        product: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: `${product.selling_price}`,
        subtotal: product.selling_price * quantity,
      };
      setCart((prev) => [...prev, newItem]);
    }

    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const productId = cart[index].product;
    const product = products.find((p) => p.id === productId);

    if (!product || product.stock < newQuantity) {
      toast.error(
        `Only ${product?.stock || 0} units available for ${product?.name}`
      );
      return;
    }

    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    newCart[index].subtotal =
      newQuantity * parseFloat(newCart[index].unit_price);
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const productName = cart[index].product_name;
    setCart((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Removed ${productName} from cart`);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getBalance = () => {
    return getTotal() - (amountPaid || 0);
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "NPR 0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error("Please add items to cart");
      return;
    }

    // Check stock availability before creating sale
    const stockIssues = [];
    for (const item of cart) {
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

      const saleData: Partial<Sale> = {
        business: user?.business_details?.id,
        invoice_number: generateInvoiceNumber("sale"),
        customer_phone: "",
        customer_email: "",
        payment_method: "cash",
        paid_amount: `${amountPaid || 0}`,
        items: cart.map((item) => ({
          product: item.product,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        })),
      };

      const response = await post("/sales/", saleData);
      const newSale = await response;

      toast.success("Sale completed successfully!");
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/sales")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Sales
          </Button>
          <h1 className="text-2xl font-bold">Quick Sale</h1>
          <Badge variant="outline" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            {cart.length} items
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Product Search */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isQuantityMode
                    ? `Enter Quantity for ${pendingProduct?.name}`
                    : "Search Products"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isQuantityMode ? (
                  <div className="space-y-4">
                    <div className="p-4  rounded-lg">
                      <div className="font-medium">{pendingProduct?.name}</div>
                      <div className="text-sm text-gray-600">
                        Price:{" "}
                        {formatCurrency(pendingProduct?.selling_price || 0)} |
                        Stock: {pendingProduct?.stock}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        ref={quantityRef}
                        id="quantity"
                        type="number"
                        min="1"
                        max={pendingProduct?.stock}
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-lg"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        Press Enter to add, Escape to cancel
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Input
                      ref={searchRef}
                      placeholder="Type product name or SKU and press Enter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="text-lg"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Use ↑↓ arrows to navigate, Enter to select
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Search Results */}
            {!isQuantityMode && filteredProducts.length > 0 && (
              <Card>
                <CardContent className="p-2">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`p-3 rounded cursor-pointer flex justify-between items-center ${
                        index === selectedProductIndex
                          ? "bg-blue-100 dark:bg-gray-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-950"
                      }`}
                      onClick={() => {
                        setPendingProduct(product);
                        setIsQuantityMode(true);
                      }}
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">
                          SKU: {product.sku || "N/A"} | Category:{" "}
                          {product.category_name || "Uncategorized"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(product.selling_price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Stock: {product.stock}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Cart ({cart.length} items)</span>
                  {cart.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCart([])}
                    >
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart
                      size={32}
                      className="mx-auto mb-2 opacity-50"
                    />
                    <p>Cart is empty</p>
                    <p className="text-sm mt-1">
                      Start typing to search for products
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div
                        key={item.product}
                        className="flex items-center justify-between p-3 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(parseFloat(item.unit_price))} ×{" "}
                            {item.quantity}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(index, item.quantity - 1)
                            }
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(index, item.quantity + 1)
                            }
                          >
                            <Plus size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeFromCart(index)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>

                        <div className="font-medium ml-4 min-w-[80px] text-right">
                          {formatCurrency(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Sale Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="amountPaid">Amount Paid</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAmountPaid(getTotal())}
                    >
                      Full Amount
                    </Button>
                  </div>
                  <Input
                    id="amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amountPaid || ""}
                    onChange={(e) =>
                      setAmountPaid(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sale Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Total Items:</span>
                    <span>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(amountPaid || 0)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-medium">
                    <span>Balance:</span>
                    <span
                      className={
                        getBalance() > 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {formatCurrency(Math.abs(getBalance()))}
                      {getBalance() > 0
                        ? " (Due)"
                        : getBalance() < 0
                        ? " (Change)"
                        : ""}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={completeSale}
                  disabled={cart.length === 0 || submitting}
                >
                  {submitting ? "Processing..." : "Complete Sale"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Instructions */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <strong>Quick Guide:</strong>
                  </div>
                  <div>• Type product name/SKU → Enter</div>
                  <div>• Enter quantity → Enter</div>
                  <div>• Use ↑↓ arrows to navigate</div>
                  <div>• Press Escape to cancel</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
