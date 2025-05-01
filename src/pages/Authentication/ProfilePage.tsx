import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/contexts/ApiContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Info, Upload, X } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Loader from "@/components/loader";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  bio?: string;
  location?: string;
}

interface Notification {
  type: "success" | "error";
  message: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const { patch } = useApi();
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (user) {
          setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            bio: "",
            location: "",
          });
        }
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.id) return;

      await patch(`/auth/users/me/`, formData);
      setIsEditing(false);
      setNotification({
        type: "success",
        message: "Profile updated successfully!",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to update profile. Please try again.",
      });
    }
  };

  const getInitials = () => {
    if (!formData.full_name) return "";
    const nameParts = formData.full_name.split(" ");
    return nameParts
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Info className="h-8 w-8 mx-auto text-red-500" />
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {notification && (
          <Alert
            className={`mb-6 ${
              notification.type === "success"
                ? " text-green-900 border-green-200"
                : " text-red-900 border-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertTitle>
              {notification.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Your profile photo visible to other users
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage
                      src={user?.profile_picture}
                      alt={formData.full_name}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Your public profile information
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          disabled={!isEditing}
                          value={formData.full_name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          disabled={true}
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-3">
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                  <CardDescription>Details about your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Role</p>
                        <p className="text-sm text-muted-foreground">
                          Your role in the business
                        </p>
                      </div>
                      <Badge variant="outline">
                        {user?.role_display || "Member"}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                          Date you joined the platform
                        </p>
                      </div>
                      <span className="text-sm">
                        {user?.date_joined
                          ? formatDate(user.date_joined)
                          : "Unknown"}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Last Login</p>
                        <p className="text-sm text-muted-foreground">
                          When you last accessed the system
                        </p>
                      </div>
                      <span className="text-sm">
                        {user?.last_login
                          ? formatDate(user.last_login)
                          : "Unknown"}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Status</p>
                        <p className="text-sm text-muted-foreground">
                          Your account's current status
                        </p>
                      </div>
                      <Badge
                        className={
                          user?.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {user?.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Details about your business account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.business_details ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Business Name</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.name}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Legal Name</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.legal_name}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Business Type</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.business_type}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Industry</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.industry}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.city},{" "}
                        {user.business_details.state}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.zip_code},{" "}
                        {user.business_details.country}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Tax ID</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.business_details.tax_id || "Not provided"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No business information available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
