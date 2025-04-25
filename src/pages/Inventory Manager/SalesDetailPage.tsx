import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  ShoppingBag,
  CreditCard,
  Receipt,
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
import { useReactToPrint } from "react-to-print";
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Loader from "@/components/loader";
import { useApi } from "@/contexts/ApiContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PrintableInvoiceProps {
  sale: Sale;
  formatCurrency: (amount: number | string) => string;
  formatDate: (dateString: string) => string;
}

// Regular full-page invoice for normal printing
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
          <h2 className="text-2xl font-bold">{sale.business_details.name}</h2>
          <p className="text-gray-600">{sale.business_details.address}</p>
          <p className="text-gray-600">
            {sale.business_details.email && sale.business_details.email}
          </p>
          <p className="text-gray-600">
            {sale.business_details.phone && sale.business_details.phone}
          </p>
        </div>
      </div>

      {/* Invoice Details and Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{sale.customer_name}</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="font-semibold">Invoice Date: </span>
            <span>{formatDate(sale.sale_date)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Payment Method: </span>
            <span>
              {sale.payment_method ? sale.payment_method : "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-semibold">Payment Status: </span>
            <span
              className={`inline-block px-2 py-1 rounded text-white ${
                sale.balance === 0
                  ? "bg-green-500"
                  : parseFloat(sale.paid_amount) > 0
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {sale.balance === 0
                ? "Paid"
                : parseFloat(sale.paid_amount) > 0
                ? "Partial"
                : "Unpaid"}
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
            <span>{formatCurrency(sale.paid_amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
            <span>Balance Due:</span>
            <span>{formatCurrency(sale.balance)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <p className="text-gray-700 p-3 bg-gray-50 rounded">{sale.notes}</p>
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

// Add display name
PrintableInvoice.displayName = "PrintableInvoice";

// POS Receipt style printout
const POSReceipt = React.forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ sale, formatCurrency, formatDate }, ref) => {
    if (!sale) return null;

    return (
      <div
        ref={ref}
        className="bg-white p-4"
        style={{ maxWidth: "80mm", margin: "0 auto", fontFamily: "monospace" }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">{sale.business_details.name}</h1>
          <p className="text-sm">{sale.business_details.address}</p>
          <p className="text-sm">
            {sale.business_details.email && sale.business_details.email}
          </p>
          <p className="text-sm">
            {sale.business_details.phone && sale.business_details.phone}
          </p>
          <div className="border-t border-b border-dashed border-gray-300 my-2 py-1">
            <p className="font-bold">RECEIPT #{sale.invoice_number}</p>
            <p className="text-sm">{formatDate(sale.sale_date)}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-4 text-sm">
          <p>
            <strong>Customer:</strong> {sale.customer_name}
          </p>
        </div>

        {/* Items Table - Simple format for POS */}
        <div className="mb-4">
          <div className="border-b border-dashed border-gray-300 pb-1 mb-2">
            <div className="flex justify-between text-sm font-bold">
              <div style={{ width: "40%" }}>Item</div>
              <div style={{ width: "15%" }} className="text-right">
                Qty
              </div>
              <div style={{ width: "20%" }} className="text-right">
                Price
              </div>
              <div style={{ width: "25%" }} className="text-right">
                Total
              </div>
            </div>
          </div>

          {sale.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-sm mb-1">
              <div style={{ width: "40%" }}>{item.product_name}</div>
              <div style={{ width: "15%" }} className="text-right">
                {item.quantity}
              </div>
              <div style={{ width: "20%" }} className="text-right">
                {formatCurrency(item.unit_price)}
              </div>
              <div style={{ width: "25%" }} className="text-right">
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t border-dashed border-gray-300 pt-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale.total_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Amount Paid:</span>
            <span>{formatCurrency(sale.paid_amount)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 mt-1 pt-1">
            <span>Balance Due:</span>
            <span>{formatCurrency(sale.balance)}</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="text-center mb-4">
          <div
            className={`py-1 text-white font-bold ${
              sale.balance === 0
                ? "bg-green-500"
                : parseFloat(sale.paid_amount) > 0
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {sale.balance === 0
              ? "PAID"
              : parseFloat(sale.paid_amount) > 0
              ? "PARTIALLY PAID"
              : "UNPAID"}
          </div>
        </div>

        {/* Notes if any */}
        {sale.notes && (
          <div className="mb-4 text-sm">
            <p className="font-bold">Notes:</p>
            <p>{sale.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs border-t border-dashed border-gray-300 pt-2">
          <p>Thank you for your business!</p>
          <p>Please keep this receipt for your records</p>
        </div>
      </div>
    );
  }
);

// Add display name
POSReceipt.displayName = "POSReceipt";

function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const posReceiptRef = useRef<HTMLDivElement>(null);
  const api = useApi();

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);

      // Use the API context to fetch the sale data
      const response = await api.get(`/sales/${id}/`);
      const saleData = response;
      setSale(saleData);
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

  const formatCurrency = (amount: number | string) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(numericAmount);
  };

  const getPaymentStatusBadge = (sale: Sale) => {
    if (sale.balance === 0) {
      return <Badge className="bg-green-500">Paid</Badge>;
    } else if (parseFloat(sale.paid_amount.toString()) > 0) {
      return <Badge className="bg-yellow-500">Partial</Badge>;
    } else {
      return <Badge className="bg-red-500">Unpaid</Badge>;
    }
  };

  // Handle full invoice printing
  const handleInvoicePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${sale?.invoice_number || id}`,
    onBeforePrint: () => {
      if (!invoiceRef.current) {
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

  // Handle POS receipt printing
  const handlePOSPrint = useReactToPrint({
    contentRef: posReceiptRef,
    documentTitle: `Receipt-${sale?.invoice_number || id}`,
    onBeforePrint: () => {
      if (!posReceiptRef.current) {
        toast.error("Receipt content not ready. Please try again.");
        return Promise.reject("Receipt content not ready");
      }
      return Promise.resolve();
    },
    onPrintError: (error) => {
      console.error("Print failed:", error);
      toast.error("Failed to print receipt. Please try again.");
    },
    onAfterPrint: () => toast.success("Receipt sent to printer!"),
  });

  if (loading) {
    return <Loader />;
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Printer size={16} />
              Print Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleInvoicePrint()}>
              <Printer size={16} className="mr-2" />
              Print Full Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePOSPrint()}>
              <Receipt size={16} className="mr-2" />
              Print POS Receipt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                <h2 className="text-xl font-bold">
                  {sale.business_details.name}
                </h2>
                <p className="text-gray-500">{sale.business_details.address}</p>
                <p className="text-gray-500">
                  {sale.business_details.email && sale.business_details.email}
                </p>
                <p className="text-gray-500">
                  {sale.business_details.phone && sale.business_details.phone}
                </p>
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
              </div>
              <div className="text-right">
                <h3 className="font-semibold mb-2 flex items-center justify-end gap-2">
                  <CreditCard size={16} />
                  Payment Details
                </h3>
                <p className="text-gray-500">
                  Method:{" "}
                  {sale.payment_method ? sale.payment_method : "Not specified"}
                </p>
                <p className="text-gray-500">
                  Status:{" "}
                  <span className="ml-2">{getPaymentStatusBadge(sale)}</span>
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
                  {formatCurrency(sale.paid_amount)}
                </p>
              </div>
              <div className="flex justify-between w-full md:w-1/3">
                <p className="text-gray-500 font-bold">Balance Due:</p>
                <p className="font-bold">{formatCurrency(sale.balance)}</p>
              </div>
            </div>

            {sale.notes && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-gray-500">{sale.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden printable elements */}
      <div className="hidden">
        {/* Full invoice for printing */}
        <PrintableInvoice
          ref={invoiceRef}
          sale={sale}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        {/* POS receipt for printing */}
        <POSReceipt
          ref={posReceiptRef}
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
