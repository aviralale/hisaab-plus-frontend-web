import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Search } from "lucide-react";
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
import { format } from "date-fns";
import { toast } from "sonner";
import { useApi } from "@/contexts/ApiContext";
import { Sale } from "@/types";

function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  const { get } = useApi();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: Sale[] = await get("/sales/");
      setSales(response);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Failed to load sales. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const getPaymentStatusBadge = (paidAmount: string, totalAmount: string) => {
    // Calculate payment status based on paid amount and total amount
    const paid = parseFloat(paidAmount);
    const total = parseFloat(totalAmount);
    const status = paid === 0 ? "unpaid" : paid < total ? "partial" : "paid";

    switch (status) {
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

  // Summary statistics
  const totalSales = sales.reduce(
    (sum, sale) => sum + parseFloat(sale.total_amount),
    0
  );

  const totalReceived = sales.reduce(
    (sum, sale) => sum + parseFloat(sale.paid_amount),
    0
  );

  const totalOutstanding = sales.reduce(
    (sum, sale) => sum + (sale.balance || 0),
    0
  );

  const paidCount = sales.filter(
    (sale) => parseFloat(sale.paid_amount) === parseFloat(sale.total_amount)
  ).length;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales</h1>
        <Button
          onClick={() => navigate("/sales/new")}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Sale
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-gray-500">{sales.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Amount Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalReceived)}
            </div>
            <p className="text-xs text-gray-500">{paidCount} paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-gray-500">
              {sales.length - paidCount} unpaid/partial invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Payment Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSales > 0
                ? Math.round((totalReceived / totalSales) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500">
              of total sales amount received
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No sales found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(sale.sale_date)}
                      </div>
                    </TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell>
                      {formatCurrency(parseFloat(sale.total_amount))}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(parseFloat(sale.paid_amount))}
                    </TableCell>
                    <TableCell>{formatCurrency(sale.balance || 0)}</TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(
                        sale.paid_amount,
                        sale.total_amount
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/sales/${sale.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

import DashboardLayout from "@/components/layouts/DashboardLayout";
import Loader from "@/components/loader";

const SalesPageWithLayout = () => {
  return (
    <DashboardLayout>
      <SalesPage />
    </DashboardLayout>
  );
};

export default SalesPageWithLayout;
