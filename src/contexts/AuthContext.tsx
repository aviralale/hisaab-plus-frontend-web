// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { LoginUser, User } from "@/types";
import { loginUser, axiosInstance } from "@/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasBusiness: boolean;
  login: (credentials: LoginUser) => Promise<boolean>;
  logout: () => void;
  updateUserData: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasBusiness, setHasBusiness] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...");
      console.log("Current token:", localStorage.getItem("access"));

      const response = await axiosInstance.get("/auth/users/me/");
      console.log("User data received:", response.data);

      setUser(response.data);
      setHasBusiness(response.data.business);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Failed to fetch user data:", error);

      return false;
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    const token = localStorage.getItem("access");

    if (token) {
      try {
        const success = await fetchUserData();
        if (!success) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginUser): Promise<boolean> => {
    setLoading(true);
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      const data = await loginUser(credentials);

      if (!data || !data.access) {
        toast.error("Login failed. No authentication token received.");
        setLoading(false);
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));

      const success = await fetchUserData();

      if (!success) {
        toast.error("Failed to retrieve user information.");
        setLoading(false);
        return false;
      }

      toast.success("Login successful!");

      const origin = location.state?.from?.pathname || "/dashboard";
      navigate(origin);

      setLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("email");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
    toast.success("Logged out successfully");
  };

  // Add the updateUserData function
  const updateUserData = (userData: User) => {
    setUser(userData);
    setHasBusiness(!!userData.business);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    hasBusiness,
    login,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
