// src/api/services.ts
import { LoginUser, RegisterBusiness, RegisterUser } from "@/types";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const apiUrl = import.meta.env.VITE_API_URL;
type TokenErrorResponse = {
  code: string;
  detail: string;
};

export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if a token refresh is in progress
let isRefreshing = false;
// Store pending requests
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If there's no config (e.g., network error), just reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Detect if error is a 401 and we haven't already tried refreshing
    if (
      error.response?.status === 401 &&
      (error.response?.data as TokenErrorResponse)?.code ===
        "token_not_valid" &&
      !originalRequest._retry
    ) {
      // If token refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark this request as retried to prevent infinite loop
      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh the token
      try {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${apiUrl}/auth/jwt/refresh/`, {
          refresh: refreshToken,
        });

        const newToken = response.data.access;
        localStorage.setItem("access", newToken);

        // Update authorization header
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process any queued requests
        processQueue(null, newToken);

        // Return retried request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and process queue with error
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        processQueue(refreshError);

        // Return original error
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export const registerUser = async (registerUserData: RegisterUser) => {
  try {
    const response = await axiosInstance.post("/auth/users/", registerUserData);
    console.log("Registration Success: ", response.data);
    localStorage.setItem("email", response.data.email);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const loginUser = async (loginUserData: LoginUser) => {
  try {
    const response = await axiosInstance.post(
      "/auth/jwt/create/",
      loginUserData
    );
    console.log("Login Success: ", response.data);
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const resendActivationMail = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/users/resend_activation/",
      { email }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { detail: "Unexpected error" };
  }
};

export const registerBusiness = async (
  registerBusinessData: RegisterBusiness
) => {
  try {
    const response = await axiosInstance.post(
      "/businesses/",
      registerBusinessData
    );
    console.log("Business Registration Success: ", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
