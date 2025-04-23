// src/context/ApiContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { axiosInstance } from "@/services/api";
import { toast } from "sonner";
import { AxiosRequestConfig } from "axios";
import { useAuth } from "./AuthContext";

interface LoadingState {
  [key: string]: boolean;
}

interface ApiContextType {
  get: <T = any>(endpoint: string) => Promise<T>;
  post: <T = any>(endpoint: string, data?: any) => Promise<T>;
  put: <T = any>(endpoint: string, data?: any) => Promise<T>;
  patch: <T = any>(endpoint: string, data?: any) => Promise<T>;
  delete: <T = any>(endpoint: string) => Promise<T>;
  isLoading: (endpoint: string, method?: string) => boolean;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const [loading, setLoading] = useState<LoadingState>({});
  const { logout } = useAuth();

  const fetchData = async <T = any,>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    const requestKey = `${options.method || "GET"}_${endpoint}`;

    setLoading((prev) => ({ ...prev, [requestKey]: true }));

    try {
      const config: AxiosRequestConfig = {
        ...options,
        url: endpoint,
      };

      const response = await axiosInstance(config);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;

        if (statusCode === 401) {
          const errorCode = error.response?.data?.code;

          // If it's an authentication error that wasn't handled by the interceptor
          if (errorCode === "token_not_valid") {
            toast.error("Your session has expired. Please login again.");
            logout(); // Use the logout function from AuthContext
            return Promise.reject(error);
          }
        }

        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "An error occurred";
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error(
          "No response received from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("An error occurred while processing your request.");
      }

      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, [requestKey]: false }));
    }
  };

  const get = <T = any,>(endpoint: string): Promise<T> => {
    return fetchData<T>(endpoint);
  };

  const post = <T = any,>(endpoint: string, data?: any): Promise<T> => {
    return fetchData<T>(endpoint, {
      method: "POST",
      data,
    });
  };

  const put = <T = any,>(endpoint: string, data?: any): Promise<T> => {
    return fetchData<T>(endpoint, {
      method: "PUT",
      data,
    });
  };

  const patch = <T = any,>(endpoint: string, data?: any): Promise<T> => {
    return fetchData<T>(endpoint, {
      method: "PATCH",
      data,
    });
  };

  const remove = <T = any,>(endpoint: string): Promise<T> => {
    return fetchData<T>(endpoint, {
      method: "DELETE",
    });
  };

  const isLoading = (endpoint: string, method: string = "GET"): boolean => {
    const key = `${method}_${endpoint}`;
    return !!loading[key];
  };

  const value: ApiContextType = {
    get,
    post,
    put,
    patch,
    delete: remove, // 'delete' is a reserved keyword
    isLoading,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
