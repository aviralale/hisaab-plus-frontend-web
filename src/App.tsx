import { Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiProvider } from "@/contexts/ApiContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";
import LoginPage from "./pages/Authentication/Login";
import RegisterPage from "./pages/Authentication/Register";
import Dashboard from "./pages/Authentication/Dashboard";
import ProductsPage from "./pages/Inventory Manager/ProductsPage";
import ProductDetailPage from "./pages/Inventory Manager/ProductDetailPage";
import ProductForm from "./pages/Inventory Manager/ProductForm";
import HomePage from "./pages/HomePage";
import { Toaster } from "sonner";
import CategoriesPage from "./pages/Inventory Manager/CategoryPage";
import SuppliersPage from "./pages/Inventory Manager/SupplierPage";
import StockEntriesPage from "./pages/Inventory Manager/StockEntriesPage";
import SalesPage from "./pages/Inventory Manager/SalesPage";
import NewSalePage from "./pages/Inventory Manager/NewSalePage";
import SaleDetailPageWithLayout from "./pages/Inventory Manager/SalesDetailPage";
import BusinessRegisterPage from "./pages/Authentication/BusinessRegister";
import FeaturesPage from "./pages/FeaturesPage";
import { SolutionsPage } from "./pages/SolutionsPage";
import { PricingPage } from "./pages/PricingPage";
import { AboutPage } from "./pages/AboutPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import FAQsPage from "./pages/FAQsPage";
import ContactPage from "./pages/ContactPage";
import ForgotPasswordPage from "./components/forgot-password";
import NotFoundPage from "./pages/404Page";
import AccountActivation from "./pages/AccountActivationPage";
import ResendActivation from "./components/resend-activation";
import RegistrationSuccess from "./pages/AccountRegisteredPage";
import TermsAndConditions from "./pages/TermsAndConditionsPage";
import PrivacyPolicy from "./pages/PrivacyPolicyPage";
import Loader from "./components/loader";
import { useEffect, useState } from "react";
import { ProfilePage } from "./pages/Authentication/ProfilePage";
import { BillingPage } from "./pages/Inventory Manager/BillingPage";

// Custom hook for setting page title
function usePageTitle(pathname: string) {
  useEffect(() => {
    // Base title for the application
    const baseTitle = "Hisaab Plus";

    // Map routes to their respective titles
    const routeTitles: Record<string, string> = {
      "/": "Home | Hisaab Plus",
      "/features": "Features | Hisaab Plus",
      "/solutions": "Solutions | Hisaab Plus",
      "/pricing": "Pricing | Hisaab Plus",
      "/about": "About Us | Hisaab Plus",
      "/testimonials": "Testimonials | Hisaab Plus",
      "/help": "FAQs | Hisaab Plus",
      "/contact": "Contact Us | Hisaab Plus",
      "/terms-and-conditions": "Terms and Conditions | Hisaab Plus",
      "/privacy-policy": "Privacy Policy | Hisaab Plus",
      "/login": "Login | Hisaab Plus",
      "/register": "Register | Hisaab Plus",
      "/registration-success": "Registration Success | Hisaab Plus",
      "/forgot-password": "Reset Password | Hisaab Plus",
      "/create-business": "Create Business | Hisaab Plus",
      "/dashboard": "Dashboard | Hisaab Plus",
      "/categories": "Categories | Hisaab Plus",
      "/suppliers": "Suppliers | Hisaab Plus",
      "/stock-entries": "Stock Entries | Hisaab Plus",
      "/sales": "Sales | Hisaab Plus",
      "/sales/new": "New Sale | Hisaab Plus",
      "/products": "Products | Hisaab Plus",
      "/products/new": "New Product | Hisaab Plus",
    };

    // For dynamic routes like /products/:id or /sales/:id
    if (pathname.match(/^\/products\/\d+$/)) {
      document.title = "Product Details | Hisaab Plus";
    } else if (pathname.match(/^\/products\/edit\/\d+$/)) {
      document.title = "Edit Product | Hisaab Plus";
    } else if (pathname.match(/^\/sales\/\d+$/)) {
      document.title = "Sale Details | Hisaab Plus";
    } else if (pathname.match(/^\/activate\/\w+\/\w+$/)) {
      document.title = "Account Activation | Hisaab Plus";
    } else {
      // For routes explicitly defined in the routeTitles object
      document.title = routeTitles[pathname] || `${baseTitle}`;
    }
  }, [pathname]);
}

// Wrap the routes in a component that can access the router context
function AppRoutes() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Set page title based on current route
  usePageTitle(location.pathname);

  // List of public homepage routes where we want to show the loader
  const publicRoutes = [
    "/",
    "/features",
    "/solutions",
    "/pricing",
    "/about",
    "/testimonials",
    "/help",
    "/contact",
    "/terms-and-conditions",
    "/privacy-policy",
  ];

  // Check if current path is a public route that needs the loader
  const shouldShowLoader = publicRoutes.includes(location.pathname);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (shouldShowLoader) {
      // Only set a timer if we're on a route that should show the loader
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 8000);
    } else {
      // For dashboard routes, don't show loader
      setIsLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [location.pathname, shouldShowLoader]);

  // Show loader only on public routes and only if still in loading state
  if (shouldShowLoader && isLoading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/solutions" element={<SolutionsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
      <Route path="/help" element={<FAQsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* Authentication Routes - Restricted when logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute restricted={true}>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute restricted={true}>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/registration-success"
        element={
          <PublicRoute restricted={false}>
            <RegistrationSuccess />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute restricted={false}>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/activate/:uid/:token"
        element={
          <PublicRoute restricted={false}>
            <AccountActivation />
          </PublicRoute>
        }
      />
      <Route
        path="/resend-activation"
        element={
          <PublicRoute restricted={false}>
            <ResendActivation />
          </PublicRoute>
        }
      />

      {/* Protected Routes - Require Authentication */}
      <Route
        path="/create-business"
        element={
          <ProtectedRoute>
            <BusinessRegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <SuppliersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock-entries"
        element={
          <ProtectedRoute>
            <StockEntriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/new"
        element={
          <ProtectedRoute>
            <NewSalePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/:id"
        element={
          <ProtectedRoute>
            <SaleDetailPageWithLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/new"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="/loading" element={<Loader />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ApiProvider>
          <AppRoutes />
          <Toaster richColors />
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
