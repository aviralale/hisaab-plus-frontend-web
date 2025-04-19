import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Sale } from "@/types"; // Import types from your types file
import { dummySales } from "@/lib/dummy-data";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      // Simulate API call with dummy data
      const foundSale = dummySales.find((s) => s.id.toString() === id);
      if (!foundSale) {
        throw new Error("Sale not found");
      }

      // Format the sale to match the expected interface
      const formattedSale: Sale = {
        ...foundSale,
        invoice_number: `INV-${foundSale.id.toString().padStart(4, "0")}`,
        sale_date: foundSale.sale_date,
        payment_status:
          foundSale.balance === 0
            ? "paid"
            : foundSale.amount_paid > 0
            ? "partial"
            : "unpaid",
        note: "",
        items: foundSale.items,
      };

      setSale(formattedSale);
    } catch (error) {
      console.error("Error fetching sale details:", error);
      toast.error("Failed to load sale details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold mb-2">Sale Not Found</h2>
          <p className="mb-4">The sale you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/sales")}>Go Back to Sales</Button>
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
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer size={16} />
          Print Invoice
        </Button>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">
                  Invoice #{sale.invoice_number}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <Calendar size={16} />
                  {formatDate(sale.sale_date)}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">HisaabPlus</h2>
                <p className="text-gray-500">Your Business Address</p>
                <p className="text-gray-500">contact@hisaabplus.com</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User size={16} />
                  Customer
                </h3>
                <p className="text-lg font-medium">{sale.customer_name}</p>
                {sale.customer_phone && (
                  <p className="text-gray-500">{sale.customer_phone}</p>
                )}
              </div>
              <div className="text-right">
                <h3 className="font-semibold mb-2 flex items-center justify-end gap-2">
                  <CreditCard size={16} />
                  Payment Details
                </h3>
                <p className="text-gray-500">
                  Method: {sale.payment_method || "Not specified"}
                </p>
                <p className="text-gray-500">
                  Status:{" "}
                  <span className="ml-2">
                    {getPaymentStatusBadge(sale.payment_status)}
                  </span>
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag size={16} />
                Items
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
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
                </TableBody>
              </Table>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-2 items-end mb-6">
              <div className="flex justify-between w-full md:w-1/3">
                <p className="text-gray-500">Subtotal:</p>
                <p className="font-medium">
                  {formatCurrency(sale.total_amount)}
                </p>
              </div>
              <div className="flex justify-between w-full md:w-1/3">
                <p className="text-gray-500">Amount Paid:</p>
                <p className="font-medium">
                  {formatCurrency(sale.amount_paid)}
                </p>
              </div>
              <div className="flex justify-between w-full md:w-1/3">
                <p className="text-gray-500 font-bold">Balance Due:</p>
                <p className="font-bold">{formatCurrency(sale.balance)}</p>
              </div>
            </div>

            {sale.note && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-gray-500">{sale.note}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
