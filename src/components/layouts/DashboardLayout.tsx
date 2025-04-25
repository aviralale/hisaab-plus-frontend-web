import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Menu,
  Box,
  PackageOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../mode-toggle";
import { UserProfileDashboardDropdown } from "../user-profile-dashboard-dropdown";

type DashboardLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { name: "Home", icon: Home, path: "/dashboard" },
  { name: "Products", icon: Package, path: "/products" },
  { name: "Sales", icon: ShoppingCart, path: "/sales" },
  { name: "Suppliers", icon: Users, path: "/suppliers" },
  { name: "Stock Entries", icon: Box, path: "/stock-entries" },
  { name: "Categories", icon: PackageOpenIcon, path: "/categories" },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const renderNavItems = () =>
    navItems.map(({ name, icon: Icon, path }) => (
      <Link
        key={name}
        to={path}
        className={cn(
          "flex items-center px-3 py-2 rounded-md hover:bg-muted transition",
          location.pathname === path && "bg-muted font-semibold"
        )}
        onClick={() => setOpen(false)}
      >
        <Icon className="w-4 h-4 mr-2" />
        {name}
      </Link>
    ));

  return (
    <div className="min-h-screen flex bg-muted/40">
      {/* Mobile sidebar */}
      <div className="md:hidden p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 space-y-2">{renderNavItems()}</nav>
          </SheetContent>
          <ModeToggle />
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r px-4 py-6 flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">Hisaab Plus</h1>
          <nav className="space-y-2">{renderNavItems()}</nav>
        </div>
        <div className="flex flex-col gap-2">
          <ModeToggle />
          <UserProfileDashboardDropdown />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
};

export default DashboardLayout;
