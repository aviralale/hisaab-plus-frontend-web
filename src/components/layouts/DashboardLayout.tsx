import { ReactNode, useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  Menu,
  Box,
  PackageOpen,
  ChevronRight,
  LayoutDashboard,
  X,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../mode-toggle";
import { UserProfileDashboardDropdown } from "../user-profile-dashboard-dropdown";
import Footer from "@/layout/Footer";
import Logo from "@/assets/images/favicon-white.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Define proper types for navigation items
type NavItemType = {
  name: string;
  icon: React.ElementType;
  path: string;
};

type NavGroupType = {
  groupName: string;
  items: NavItemType[];
};

type DashboardLayoutProps = {
  children: ReactNode;
};

type AppBrandingProps = {
  variant?: "default" | "sidebar";
};

// Define type for notifications
type NotificationType = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

// Organized navigation items with group structure
const navItems: NavGroupType[] = [
  {
    groupName: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  },
  {
    groupName: "Inventory",
    items: [
      { name: "Products", icon: Package, path: "/products" },
      { name: "Categories", icon: PackageOpen, path: "/categories" },
      { name: "Stock Entries", icon: Box, path: "/stock-entries" },
    ],
  },
  {
    groupName: "Business",
    items: [
      { name: "Sales", icon: ShoppingCart, path: "/sales" },
      { name: "Suppliers", icon: Users, path: "/suppliers" },
    ],
  },
];

// Flatten nav items for page title lookup and search
const flatNavItems = navItems.flatMap((group) => group.items);

// Sample notifications for demonstration
const sampleNotifications: NotificationType[] = [
  {
    id: 1,
    title: "Low stock alert",
    message: "5 products are running low on stock",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "New order received",
    message: "Order #12345 has been placed",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Payment confirmed",
    message: "Payment for order #12340 confirmed",
    time: "2 hours ago",
    read: true,
  },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const [commandSearchQuery, setCommandSearchQuery] = useState("");
  const [notifications, setNotifications] =
    useState<NotificationType[]>(sampleNotifications);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Calculate unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Set page title based on current route
  useEffect(() => {
    const currentNav = flatNavItems.find(
      (item) => item.path === location.pathname
    );
    setPageTitle(currentNav?.name || "Dashboard");
  }, [location.pathname]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter items based on sidebar search query
  const filteredSidebarItems = useMemo(() => {
    if (!sidebarSearchQuery.trim()) return [];

    const query = sidebarSearchQuery.toLowerCase();
    return flatNavItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [sidebarSearchQuery]);

  // Filter nav groups and their items based on command search query
  const filteredNavGroups = useMemo(() => {
    if (!commandSearchQuery.trim()) return navItems;

    const query = commandSearchQuery.toLowerCase();

    return navItems
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.name.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [commandSearchQuery]);

  // Handle command search input change
  const handleCommandSearchChange = (value: string) => {
    setCommandSearchQuery(value);
    console.log("Search command", value);
  };

  // Handle search navigation
  const handleSearchNavigation = (path: string) => {
    navigate(path);
    setSidebarSearchQuery("");
    setCommandSearchQuery("");
    setIsCommandOpen(false);
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Navigation item component with enhanced visual feedback
  const NavItem: React.FC<NavItemType> = ({ name, icon: Icon, path }) => {
    const isActive = location.pathname === path;

    return (
      <Link
        to={path}
        className={cn(
          "flex items-center px-4 py-2.5 rounded-lg transition-all duration-200",
          "hover:bg-primary/10 hover:translate-x-1",
          isActive
            ? "bg-primary/15 font-medium text-primary shadow-sm"
            : "text-muted-foreground"
        )}
        onClick={() => setOpen(false)}
      >
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md mr-3",
            isActive ? "bg-primary/10" : "bg-transparent"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <span>{name}</span>
        {isActive && <ChevronRight className="ml-auto w-4 h-4 text-primary" />}
      </Link>
    );
  };

  // App branding component with consistent styling
  const AppBranding: React.FC<AppBrandingProps> = ({ variant = "default" }) => (
    <div className="flex items-center gap-3 transition-all duration-300 hover:opacity-90">
      <img
        src={Logo}
        alt="Hisaab Plus Logo"
        className={cn(
          "rounded-md",
          variant === "sidebar" ? "size-6" : "size-5"
        )}
      />
      <h1
        className={cn(
          "font-bold tracking-tight",
          variant === "sidebar" ? "text-xl" : "text-lg"
        )}
      >
        Hisaab Plus
      </h1>
    </div>
  );

  // Notification bell component
  const NotificationBell: React.FC = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50",
                  !notification.read && "bg-muted/30"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {notification.time}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="outline" className="w-full text-sm h-9">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  // Command/Search component for quick navigation
  const SearchCommand: React.FC = () => (
    <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
      <CommandInput
        placeholder="Search for pages..."
        value={commandSearchQuery}
        onValueChange={handleCommandSearchChange}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {filteredNavGroups.map((group) => (
          <CommandGroup key={group.groupName} heading={group.groupName}>
            {group.items.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => handleSearchNavigation(item.path)}
                className="flex items-center"
              >
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md border">
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 bg-background">
        {/* Search Command */}
        <SearchCommand />

        {/* Mobile header with improved accessibility */}
        <header className="md:hidden flex items-center justify-between p-4 border-b w-full bg-background/95 backdrop-blur-sm fixed top-0 z-10 shadow-sm">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b p-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-left flex items-center">
                    <AppBranding variant="sidebar" />
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              <div className="p-4">
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 bg-muted/50"
                    value={sidebarSearchQuery}
                    onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  />
                </div>

                {sidebarSearchQuery && filteredSidebarItems.length > 0 && (
                  <div className="mb-4 p-2 border rounded-lg bg-background">
                    <h4 className="text-sm font-medium px-2 mb-2">
                      Search Results
                    </h4>
                    {filteredSidebarItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center p-2 rounded-md hover:bg-muted"
                        onClick={() => {
                          setSidebarSearchQuery("");
                          setOpen(false);
                        }}
                      >
                        <item.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <nav className="px-4 pb-4">
                {navItems.map((group) => (
                  <div key={group.groupName} className="mb-6">
                    <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-4">
                      {group.groupName}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <NavItem key={item.name} {...item} />
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                <ModeToggle />
                <UserProfileDashboardDropdown />
              </div>
            </SheetContent>
          </Sheet>

          <AppBranding />

          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserProfileDashboardDropdown />
          </div>
        </header>

        {/* Desktop sidebar with improved visual hierarchy */}
        <aside className="hidden  md:flex flex-col w-64 border-r bg-background/70 backdrop-blur-sm">
          <div className="p-5 border-b">
            <AppBranding variant="sidebar" />
          </div>

          <div className="px-3 py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search... (⌘K)"
                className="pl-9 bg-muted/50"
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setIsCommandOpen(true)}
              >
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  ⌘K
                </kbd>
              </Button>
            </div>

            {sidebarSearchQuery && filteredSidebarItems.length > 0 && (
              <div className="mb-4 p-2 border rounded-lg bg-background">
                <h4 className="text-sm font-medium px-2 mb-2">
                  Search Results
                </h4>
                {filteredSidebarItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center p-2 rounded-md hover:bg-muted"
                    onClick={() => setSidebarSearchQuery("")}
                  >
                    <item.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            {navItems.map((group) => (
              <div key={group.groupName} className="mb-6">
                <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-4">
                  {group.groupName}
                </div>
                <nav className="space-y-1">
                  {group.items.map((item) => (
                    <NavItem key={item.name} {...item} />
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="border-t flex flex-col gap-3 p-4">
            <UserProfileDashboardDropdown />
            <ModeToggle />
          </div>
        </aside>

        {/* Main content with improved header */}
        <main className="flex-1 md:p-0 p-0 md:pt-0 pt-16 overflow-y-auto bg-muted/20">
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b flex items-center justify-between">
            <div className="md:py-4 md:px-6 p-4 flex items-center">
              <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
              <div className="hidden md:flex items-center ml-4 p-1 px-3 rounded-full bg-muted/50 text-xs text-muted-foreground">
                <span className="bg-primary/20 text-primary font-medium rounded-full px-2 py-0.5 mr-2">
                  Beta
                </span>
                Hisaab Plus Admin v1.0
              </div>
            </div>

            <div className="md:py-4 md:px-6 p-4 flex items-center gap-3">
              <div className="hidden md:block text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="hidden md:block">
                <NotificationBell />
              </div>
            </div>
          </div>

          <div className="max-w-7xl min-h-[90vh] mx-auto p-6">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
