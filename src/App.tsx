import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Authentication/Login";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
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
import SaleDetailPage from "./pages/Inventory Manager/SalesDetailPage";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/stock-entries" element={<StockEntriesPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/:id" element={<SaleDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />
        <Route path="/products/new" element={<ProductForm />} />
      </Routes>
      <Toaster richColors />
      <ModeToggle />
      <Footer />
    </ThemeProvider>
  );
}

export default App;
