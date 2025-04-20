import { useState, useEffect, useRef } from "react";
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
import { Sale } from "@/types";
import { dummySales } from "@/lib/dummy-data";
import { useReactToPrint } from "react-to-print";
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

interface PrintableInvoiceProps {
  sale: Sale;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

// Create a separate Invoice component for printing
const PrintableInvoice = React.forwardRef<
  HTMLDivElement,
  PrintableInvoiceProps
>(({ sale, formatCurrency, formatDate }, ref) => {
  if (!sale) return null;

  return (
    <div ref={ref} className="p-8 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">INVOICE</h1>
          <p className="text-gray-500">#{sale.invoice_number}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">HisaabPlus</h2>
          <p className="text-gray-600">Your Business Address</p>
          <p className="text-gray-600">contact@hisaabplus.com</p>
          <p className="text-gray-600">+1 (555) 123-4567</p>
        </div>
      </div>

      {/* Invoice Details and Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{sale.customer_name}</p>
          {sale.customer_phone && <p>{sale.customer_phone}</p>}
          {sale.customer_email && <p>{sale.customer_email}</p>}
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="font-semibold">Invoice Date: </span>
            <span>{formatDate(sale.sale_date)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Payment Method: </span>
            <span>{sale.payment_method || "Not specified"}</span>
          </div>
          <div>
            <span className="font-semibold">Payment Status: </span>
            <span
              className={`inline-block px-2 py-1 rounded text-white ${
                sale.payment_status === "paid"
                  ? "bg-green-500"
                  : sale.payment_status === "partial"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {sale.payment_status.charAt(0).toUpperCase() +
                sale.payment_status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Item</th>
            <th className="border border-gray-300 p-2 text-right">Quantity</th>
            <th className="border border-gray-300 p-2 text-right">
              Unit Price
            </th>
            <th className="border border-gray-300 p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item: any, index: number) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border border-gray-300 p-2">
                {item.product_name}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {item.quantity}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatCurrency(item.unit_price)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(sale.total_amount)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Amount Paid:</span>
            <span>{formatCurrency(sale.amount_paid)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
            <span>Balance Due:</span>
            <span>{formatCurrency(sale.balance)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.note && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <p className="text-gray-700 p-3 bg-gray-50 rounded">{sale.note}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-16">
        <p>Thank you for your business!</p>
        <p className="mt-1">
          For any inquiries, please contact us at support@hisaabplus.com
        </p>
      </div>
    </div>
  );
});

// Don't forget to add the display name
PrintableInvoice.displayName = "PrintableInvoice";

function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const printableRef = useRef<HTMLDivElement>(null);

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
        note: foundSale.note || "",
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

  // Use the react-to-print hook to handle printing
  const handlePrint = useReactToPrint({
    // Use contentRef instead of content
    contentRef: printableRef,
    documentTitle: `Invoice-${sale?.invoice_number || id}`,
    onBeforePrint: () => {
      if (!printableRef.current) {
        toast.error("Print content not ready. Please try again.");
        return Promise.reject("Print content not ready");
      }
      return Promise.resolve();
    },
    onPrintError: (error) => {
      console.error("Print failed:", error);
      toast.error("Failed to print invoice. Please try again.");
    },
    onAfterPrint: () => toast.success("Invoice sent to printer!"),
  });

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
        <Button
          onClick={() => handlePrint()}
          className="flex items-center gap-2"
        >
          <Printer size={16} />
          Print Invoice
        </Button>
      </div>

      {/* Regular card view of the sale */}
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
                  {sale.items.map((item: any) => (
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

      {/* Printable invoice - hidden but rendered in the DOM */}
      <div className="hidden">
        <PrintableInvoice
          ref={printableRef}
          sale={sale}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
const SaleDetailPageWithLayout = () => {
  return (
    <DashboardLayout>
      <SaleDetailPage />
    </DashboardLayout>
  );
};

export default SaleDetailPageWithLayout;
