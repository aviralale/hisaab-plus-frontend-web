import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, RefreshCw } from "lucide-react";
import { resendActivationMail } from "@/services/api";

export default function RegistrationSuccess() {
  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const email = localStorage.getItem("email");
  const handleResendEmail = async () => {
    if (!email) return;

    setResendStatus("loading");

    try {
      await resendActivationMail(email);
      setResendStatus("success");
      setTimeout(() => {
        setResendStatus("idle");
      }, 3000);
    } catch (error) {
      setResendStatus("error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Registration Successful!
          </CardTitle>
          <CardDescription>Your account has been created</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 text-center  rounded-lg">
            <Mail className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Check Your Email</h3>
            <CardDescription className="text-sm ">
              We've sent an activation link to{" "}
              {email ? <strong>{email}</strong> : "your email address"}. Please
              check your inbox and click the link to activate your account.
            </CardDescription>
          </div>

          <div className="text-sm space-y-4">
            <CardDescription>
              The activation link will expire in 24 hours. If you don't see the
              email, please check your spam or junk folder.
            </CardDescription>

            {resendStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  Verification email has been resent successfully!
                </AlertDescription>
              </Alert>
            )}

            {resendStatus === "error" && (
              <Alert className="bg-red-50 text-red-800 border-red-200">
                <AlertDescription>
                  Failed to resend verification email. Please try again later.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          {email && (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleResendEmail}
              disabled={resendStatus === "loading"}
            >
              {resendStatus === "loading" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>Resend Verification Email</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
