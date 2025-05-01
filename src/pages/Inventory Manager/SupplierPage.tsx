import { useState, useEffect } from "react";
import {
  Plus,
  Phone,
  Mail,
  MapPin,
  Search,
  RefreshCw,
  Building2,
  User,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/contexts/ApiContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Loader from "@/components/loader";
import { useAuth } from "@/contexts/AuthContext";

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  business?: number;
}

interface SuppliersResponse {
  results: Supplier[];
}

function SuppliersPage() {
  const { user } = useAuth();
  const businessId = user?.business_details?.id;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, "id">>({
    business: businessId,
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  // Use the API hook
  const { get, post, put, delete: remove } = useApi();

  // Reset new supplier form when business ID changes
  useEffect(() => {
    setNewSupplier((prev) => ({
      ...prev,
      business: businessId,
    }));
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchSuppliers();
    }
  }, [businessId]);

  const fetchSuppliers = async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await get<SuppliersResponse>(
        `/suppliers/?business=${businessId}`
      );
      setSuppliers(data.results || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSuppliers();
    toast.success("Suppliers refreshed successfully");
    setRefreshing(false);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contact_person || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (supplier.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.phone || "").includes(searchTerm) ||
      (supplier.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSupplier = async () => {
    if (!businessId) {
      toast.error("Business information is missing");
      return;
    }

    try {
      const supplierData = {
        ...newSupplier,
        business: businessId,
      };

      // Use API post method
      const data = await post<Supplier>("/suppliers/", supplierData);

      setSuppliers([...suppliers, data]);
      setIsCreateDialogOpen(false);
      setNewSupplier({
        business: businessId,
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
      });
      toast.success("Supplier created successfully");
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Failed to create supplier. Please try again.");
    }
  };

  const handleUpdateSupplier = async () => {
    if (!currentSupplier || !businessId) return;

    try {
      // Ensure business ID is included in the update
      const supplierData = {
        ...currentSupplier,
        business: businessId,
      };

      // Use API put method
      const updatedSupplier = await put<Supplier>(
        `/suppliers/${currentSupplier.id}/`,
        supplierData
      );

      setSuppliers(
        suppliers.map((sup) =>
          sup.id === updatedSupplier.id ? updatedSupplier : sup
        )
      );
      setIsEditDialogOpen(false);
      toast.success("Supplier updated successfully");
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier. Please try again.");
    }
  };

  const handleDeleteSupplier = async () => {
    if (!currentSupplier) return;

    try {
      // Use API remove method
      await remove(`/suppliers/${currentSupplier.id}/`);

      setSuppliers(
        suppliers.filter((supplier) => supplier.id !== currentSupplier.id)
      );
      setIsDeleteDialogOpen(false);
      toast.success("Supplier deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier. Please try again.");
    }
  };

  if (!businessId && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Building2 size={48} className="mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Business Found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          You need to set up your business before managing suppliers. Please
          complete your business profile to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product suppliers and vendors
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
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus size={16} />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSuppliers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active vendor relationships
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Contact Person
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredSuppliers.filter(
                  (s) => (s.contact_person || "").trim() !== ""
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suppliers with dedicated contact
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Complete Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredSuppliers.filter(
                  (s) => s.name && s.email && s.phone && s.address
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suppliers with full contact details
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Search by name, contact, email, phone or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:max-w-md"
        />
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
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-60 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                        <Building2 size={48} className="mb-2 opacity-40" />
                        <p className="mb-1">No suppliers found</p>
                        <p className="text-sm">
                          {searchTerm
                            ? "Try changing your search criteria"
                            : "Add your first supplier to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="font-medium">{supplier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-muted-foreground" />
                          {supplier.contact_person || "No contact person"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Phone
                              size={14}
                              className="text-muted-foreground"
                            />
                            <span className="text-sm">
                              {supplier.phone || "No phone number"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail size={14} className="text-muted-foreground" />
                            <span className="text-sm">
                              {supplier.email || "No email address"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-muted-foreground" />
                          <span className="text-sm max-w-xs truncate">
                            {supplier.address || "No address"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentSupplier(supplier);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setCurrentSupplier(supplier);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create Supplier Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter company name"
                value={newSupplier.name}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                placeholder="Enter primary contact person"
                value={newSupplier.contact_person}
                onChange={(e) =>
                  setNewSupplier({
                    ...newSupplier,
                    contact_person: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter supplier's full address"
                value={newSupplier.address}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, address: e.target.value })
                }
                className="resize-none h-20"
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
              onClick={handleCreateSupplier}
              disabled={!newSupplier.name.trim() || !businessId}
            >
              Create Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={currentSupplier?.name || ""}
                onChange={(e) =>
                  setCurrentSupplier(
                    currentSupplier
                      ? { ...currentSupplier, name: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contact_person">Contact Person</Label>
              <Input
                id="edit-contact_person"
                value={currentSupplier?.contact_person || ""}
                onChange={(e) =>
                  setCurrentSupplier(
                    currentSupplier
                      ? { ...currentSupplier, contact_person: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={currentSupplier?.email || ""}
                  onChange={(e) =>
                    setCurrentSupplier(
                      currentSupplier
                        ? { ...currentSupplier, email: e.target.value }
                        : null
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={currentSupplier?.phone || ""}
                  onChange={(e) =>
                    setCurrentSupplier(
                      currentSupplier
                        ? { ...currentSupplier, phone: e.target.value }
                        : null
                    )
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={currentSupplier?.address || ""}
                onChange={(e) =>
                  setCurrentSupplier(
                    currentSupplier
                      ? { ...currentSupplier, address: e.target.value }
                      : null
                  )
                }
                className="resize-none h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSupplier}
              disabled={!currentSupplier?.name.trim() || !businessId}
            >
              Update Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the supplier "
              {currentSupplier?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplier}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const SuppliersPageWithLayout = () => {
  return (
    <DashboardLayout>
      <SuppliersPage />
    </DashboardLayout>
  );
};

export default SuppliersPageWithLayout;
