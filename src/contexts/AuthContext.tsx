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
  fetchUserData: () => Promise<boolean>;
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

  const fetchUserData = async (): Promise<boolean> => {
    try {
      const response = await axiosInstance.get("/auth/users/me/");
      const userData = response.data;

      setUser(userData);
      setHasBusiness(!!userData.business);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setHasBusiness(false);
      setIsAuthenticated(false);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);

    const token = localStorage.getItem("access");
    if (token) {
      const success = await fetchUserData();
      if (!success) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setHasBusiness(false);
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
      if (!data?.access) {
        toast.error("Login failed: No access token received.");
        setLoading(false);
        return false;
      }

      await fetchUserData();

      toast.success("Login successful!");

      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath);

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
    setUser(null);
    setIsAuthenticated(false);
    setHasBusiness(false);
    toast.success("Logged out successfully.");
    navigate("/");
  };

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
    fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
