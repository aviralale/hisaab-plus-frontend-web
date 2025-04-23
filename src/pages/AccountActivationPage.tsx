import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiUrl } from "@/services/api";

interface ActivationResponse {
  detail: string;
}

export default function AccountActivation() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  // Function to activate the account
  const activateAccount = async () => {
    if (!uid || !token) {
      setStatus("error");
      setMessage(
        "Missing activation parameters. Please check your email link."
      );
      return;
    }

    setStatus("loading");

    try {
      // Send activation request to the backend
      const response = await axios.post<ActivationResponse>(
        `${apiUrl}/auth/users/activation/`,
        { uid, token }
      );
      setStatus("success");
      setMessage(
        response.data.detail || "Your account has been successfully activated!"
      );
    } catch (error) {
      setStatus("error");
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        setMessage(error.response.data.detail);
      } else {
        setMessage(
          "An error occurred while activating your account. Please try again later."
        );
      }
    }
  };

  // Auto-activate when component mounts if params are present
  useEffect(() => {
    if (uid && token) {
      activateAccount();
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Account Activation
          </CardTitle>
          <CardDescription>
            Activate your account to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "idle" && !uid && !token && (
            <Alert className="mb-4">
              <AlertTitle>Missing Information</AlertTitle>
              <AlertDescription>
                The activation link appears to be invalid or incomplete. Please
                check your email and try again with the correct link.
              </AlertDescription>
            </Alert>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-sm text-slate-600">
                Activating your account...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {status === "success" && (
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/login")}
            >
              Continue to Login
            </Button>
          )}

          {status === "error" && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => (window.location.href = "/contact")}
            >
              Contact Support
            </Button>
          )}

          {status === "idle" && !uid && !token && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => (window.location.href = "/resend-activation")}
            >
              Resend Activation Mail
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
