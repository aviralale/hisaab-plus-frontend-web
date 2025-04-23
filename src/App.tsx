import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Authentication/Login";
import { ThemeProvider } from "@/components/theme-provider";
import RegisterPage from "./pages/Authentication/Register";
import Dashboard from "./pages/Authentication/Dashboard";
import ProductsPage from "./pages/Inventory Manager/ProductsPage";
import ProductDetailPage from "./pages/Inventory Manager/ProductDetailPage";
import ProductForm from "./pages/Inventory Manager/ProductForm";
import HomePage from "./pages/HomePage";
import Footer from "./layout/Footer";
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

function App() {
  return (
    <ThemeProvider>
      <Routes>
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/activate/:uid/:token" element={<AccountActivation />} />
        <Route path="/resend-activation" element={<ResendActivation />} />
        <Route path="/create-business" element={<BusinessRegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/stock-entries" element={<StockEntriesPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/new" element={<NewSalePage />} />
        <Route path="/sales/:id" element={<SaleDetailPageWithLayout />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
      <Toaster richColors />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
