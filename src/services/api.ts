import { LoginUser, RegisterUser } from "@/types";
import axios from "axios";

export const apiUrl = import.meta.env.VITE_API_URL;

export const registerUser = async (registerUserData: RegisterUser) => {
  try {
    const response = await axios.post(
      `${apiUrl}/auth/users/`,
      registerUserData
    );
    console.log("Registration Success: ", response.data);
    localStorage.setItem("email", response.data.email);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const loginUser = async (loginUserData: LoginUser) => {
  try {
    const response = await axios.post(
      `${apiUrl}/auth/jwt/create/`,
      loginUserData
    );

    console.log("Login Success: ", response.data);
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const resendActivationMail = async (email: string) => {
  try {
    const response = await axios.post(
      `${apiUrl}/auth/users/resend_activation/`,
      { email }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { detail: "Unexpected error" };
  }
};
