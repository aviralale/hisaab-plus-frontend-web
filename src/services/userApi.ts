import { User } from "../types";
import { axiosInstance } from "./api";

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get("users/me/");
  return response.data;
};

export const fetchBusinessUsers = async (
  businessId: number
): Promise<User[]> => {
  const response = await axiosInstance.get(`businesses/${businessId}/users/`);
  return response.data;
};

export const createUser = async (userData: any): Promise<User> => {
  try {
    console.log("Sending user data:", userData);
    const response = await axiosInstance.post(
      "create-business-user/",
      userData
    );
    console.log("Received response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating user:", error.response?.data || error);
    throw error;
  }
};

export const updateUser = async (
  userId: number,
  userData: any
): Promise<User> => {
  const response = await axiosInstance.patch(`users/${userId}/`, userData);
  return response.data;
};

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<any> => {
  const response = await axiosInstance.post(
    `users/${userId}/change_password/`,
    {
      current_password: currentPassword,
      new_password: newPassword,
    }
  );
  return response.data;
};

export const resetPassword = async (
  userId: number,
  newPassword: string
): Promise<any> => {
  // This would likely require admin permissions
  const response = await axiosInstance.post(`users/${userId}/reset_password/`, {
    new_password: newPassword,
  });
  return response.data;
};

export const activateUser = async (
  userId: number,
  isActive: boolean
): Promise<User> => {
  const response = await axiosInstance.patch(`users/${userId}/`, {
    is_active: isActive,
  });
  return response.data;
};
