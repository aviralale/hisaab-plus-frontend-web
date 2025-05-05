import { useState, useEffect } from "react";
import { Plus, Search, Folder, FolderIcon, FolderX, Info } from "lucide-react";
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
  DialogDescription,
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
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Loader from "@/components/loader";
import { useApi } from "@/contexts/ApiContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CategoriesResponse } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: number;
  name: string;
  description: string;
  business?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const { user } = useAuth();

  // Initialize newCategory with the business ID from user context
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    business: user?.business_details?.id ?? null,
  });

  const { get, post, put, delete: remove } = useApi();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update newCategory business ID when user data changes
  useEffect(() => {
    if (user && user.business_details && user.business_details.id) {
      setNewCategory((prev) => ({
        ...prev,
        business: user?.business_details?.id ?? null,
      }));
    }
  }, [user]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await get<CategoriesResponse>("/categories/");
      setCategories(data.results);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetNewCategoryForm = () => {
    setNewCategory({
      name: "",
      description: "",
      business: user?.business_details?.id ?? null,
    });
  };

  const handleCreateCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        toast.error("Category name is required");
        return;
      }

      // Ensure business ID is set
      if (!newCategory.business) {
        toast.error(
          "Business ID is missing. Please try again or contact support."
        );
        return;
      }

      const data = await post<Category>("/categories/", newCategory);

      setCategories([...categories, data]);
      setIsCreateDialogOpen(false);
      resetNewCategoryForm();
      toast.success("Category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory) return;

    try {
      if (!currentCategory.name.trim()) {
        toast.error("Category name is required");
        return;
      }

      // Ensure business ID is set for the update
      if (
        !currentCategory.business &&
        user &&
        user.business_details &&
        user.business_details.id
      ) {
        currentCategory.business = user.business_details.id;
      }

      const updatedCategory = await put<Category>(
        `/categories/${currentCategory.id}/`,
        currentCategory
      );

      setCategories(
        categories.map((cat) =>
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      );
      setIsEditDialogOpen(false);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      await remove(`/categories/${currentCategory.id}/`);

      setCategories(
        categories.filter((category) => category.id !== currentCategory.id)
      );
      setIsDeleteDialogOpen(false);
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product categories
            </p>
          </div>
          <Button
            onClick={() => {
              resetNewCategoryForm();
              setIsCreateDialogOpen(true);
            }}
            className="flex items-center gap-2 self-start sm:self-auto"
            size="sm"
          >
            <Plus size={16} />
            Add Category
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Total Categories
                </CardTitle>
                <CardDescription>All product classifications</CardDescription>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FolderIcon className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredCategories.length}
              </div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground">
                  Filtered from {categories.length} total categories
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto sm:min-w-80">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-xs self-start"
            >
              Clear filter
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : (
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-muted/50 p-4">
              <CardTitle className="text-lg">Category List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="p-3 bg-muted rounded-full mb-3">
                            <FolderX className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-muted-foreground">
                            No categories found
                          </h3>
                          {searchTerm ? (
                            <p className="text-sm text-muted-foreground mt-1">
                              Try adjusting your search term
                            </p>
                          ) : (
                            <Button
                              variant="link"
                              onClick={() => setIsCreateDialogOpen(true)}
                              className="mt-2"
                            >
                              Create your first category
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-blue-500" />
                            {category.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {category.description || (
                            <span className="text-muted-foreground italic text-sm">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentCategory(category);
                                setIsEditDialogOpen(true);
                              }}
                              className="hover:bg-muted"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setCurrentCategory(category);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="hover:bg-red-700"
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
            </CardContent>
          </Card>
        )}

        {/* Create Category Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your products
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  className="focus-visible:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter category description (optional)"
                  className="focus-visible:ring-blue-500 min-h-24"
                />
              </div>
            </div>
            <DialogFooter className="flex sm:justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={!newCategory.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Make changes to your category
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={currentCategory?.name || ""}
                  onChange={(e) =>
                    setCurrentCategory(
                      currentCategory
                        ? { ...currentCategory, name: e.target.value }
                        : null
                    )
                  }
                  placeholder="Enter category name"
                  className="focus-visible:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={currentCategory?.description || ""}
                  onChange={(e) =>
                    setCurrentCategory(
                      currentCategory
                        ? { ...currentCategory, description: e.target.value }
                        : null
                    )
                  }
                  placeholder="Enter category description (optional)"
                  className="focus-visible:ring-blue-500 min-h-24"
                />
              </div>
            </div>
            <DialogFooter className="flex sm:justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCategory}
                disabled={!currentCategory?.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
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
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Info className="h-5 w-5" /> Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-2">
                Are you sure you want to delete the category{" "}
                <span className="font-medium">{currentCategory?.name}</span>?
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                  <strong>Warning:</strong> This action cannot be undone.
                  Products in this category may become uncategorized.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteCategory}
              >
                Delete Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
