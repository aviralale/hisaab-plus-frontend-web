import { useState, useEffect } from "react";
import { Plus, Calendar, Package } from "lucide-react";
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
import { Product, StockEntry } from "@/types";
import { dummyProducts, dummyStockEntries } from "@/lib/dummy-data";

export default function StockEntriesPage() {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newStockEntry, setNewStockEntry] = useState({
    product: "",
    quantity: 1,
    unit_cost: 0,
    notes: "",
  });

  useEffect(() => {
    simulateFetchData();
  }, []);

  const simulateFetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setProducts(dummyProducts);
      setStockEntries(dummyStockEntries);
      setLoading(false);
    }, 500);
  };

  const filteredStockEntries = stockEntries.filter(
    (entry) =>
      entry.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry?.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateStockEntry = () => {
    const productObj = products.find(
      (p) => p.id === parseInt(newStockEntry.product)
    );
    if (!productObj) {
      toast.error("Please select a valid product");
      return;
    }

    const newEntry: StockEntry = {
      id: stockEntries.length + 1,
      product: productObj.id,
      product_name: productObj.name,
      quantity: newStockEntry.quantity,
      unit_cost: newStockEntry.unit_cost,
      date_added: new Date().toISOString(),
      created_by: 1,
      notes: newStockEntry.notes,
    };

    setStockEntries((prev) => [newEntry, ...prev]);
    setIsCreateDialogOpen(false);
    setNewStockEntry({
      product: "",
      quantity: 1,
      unit_cost: 0,
      notes: "",
    });
    toast.success("Stock entry created successfully");
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Entries</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Stock Entry
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search stock entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading stock entries...</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStockEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No stock entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStockEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(entry.date_added)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package size={16} />
                        {entry.product_name}
                      </div>
                    </TableCell>
                    <TableCell>{entry.quantity}</TableCell>
                    <TableCell>{formatCurrency(entry.unit_cost)}</TableCell>
                    <TableCell>
                      {formatCurrency(entry.quantity * entry.unit_cost)}
                    </TableCell>
                    <TableCell>{entry.notes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Stock Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stock Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={newStockEntry.product}
                onValueChange={(value) =>
                  setNewStockEntry({ ...newStockEntry, product: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
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
                <Label htmlFor="unit_cost">Unit Cost</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newStockEntry.unit_cost}
                  onChange={(e) =>
                    setNewStockEntry({
                      ...newStockEntry,
                      unit_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newStockEntry.notes}
                onChange={(e) =>
                  setNewStockEntry({ ...newStockEntry, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateStockEntry}
              disabled={!newStockEntry.product || newStockEntry.quantity <= 0}
            >
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
