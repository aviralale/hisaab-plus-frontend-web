import { useState, useEffect, useRef } from "react";
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
import { Check, Info, Upload, X, Crop as CropIcon } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Loader from "@/components/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
}

interface Notification {
  type: "success" | "error";
  message: string;
}

export function ProfilePage() {
  const { user, loading: authLoading, updateUserData } = useAuth();
  const { patch } = useApi();
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photo upload state
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCropMode, setIsCropMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (user) {
          setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
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

      const response = await patch(`/auth/users/me/`, formData);

      // Update the user data in the auth context
      updateUserData(response);

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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file is an image
    if (!file.type.match("image.*")) {
      setNotification({
        type: "error",
        message: "Please select an image file (PNG, JPG, JPEG, etc)",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: "error",
        message: "Image is too large. Please select an image under 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setIsCropMode(true);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Image cropping functions
  const getCroppedImg = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current || !completedCrop) {
        reject(new Error("No image or crop data"));
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Calculate the size of the crop
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleSaveImage = async () => {
    try {
      setIsUploading(true);

      if (!uploadedImage) {
        setNotification({
          type: "error",
          message: "No image to upload",
        });
        return;
      }

      let imageBlob: Blob;

      if (isCropMode && completedCrop) {
        // Get the cropped image
        imageBlob = await getCroppedImg();
      } else {
        // Use the full image if not cropped
        const response = await fetch(uploadedImage);
        imageBlob = await response.blob();
      }

      // Create a File from the Blob
      const imageFile = new File([imageBlob], "profile_photo.jpg", {
        type: "image/jpeg",
      });

      // Create a FormData to send to the server
      const formData = new FormData();
      formData.append("profile_picture", imageFile);

      // Upload the image using standard post with FormData
      const response = await patch("/auth/users/me/", formData);

      // Update the user data in the auth context
      updateUserData(response);

      setNotification({
        type: "success",
        message: "Profile picture updated successfully!",
      });

      // Close the dialog and reset state
      setIsPhotoDialogOpen(false);
      setUploadedImage(null);
      setIsCropMode(false);

      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to update profile picture. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setIsPhotoDialogOpen(false);
    setUploadedImage(null);
    setIsCropMode(false);
  };

  const toggleCropMode = () => {
    setIsCropMode(!isCropMode);
  };

  if (loading || authLoading) {
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsPhotoDialogOpen(true)}
                  >
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

      {/* Profile Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture. You can drag and drop an image or
              browse your files.
            </DialogDescription>
          </DialogHeader>

          {!uploadedImage ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                isDragging ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileInputChange}
              />
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: JPG, PNG, GIF (Max size: 5MB)
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full">
                {isCropMode ? (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    circularCrop
                    aspect={1 / 1}
                  >
                    <img
                      ref={imgRef}
                      src={uploadedImage}
                      alt="Profile"
                      className="max-h-64 mx-auto"
                    />
                  </ReactCrop>
                ) : (
                  <img
                    ref={imgRef}
                    src={uploadedImage}
                    alt="Profile"
                    className="max-h-64 mx-auto"
                  />
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isCropMode ? "default" : "outline"}
                        size="sm"
                        onClick={toggleCropMode}
                      >
                        <CropIcon className="h-4 w-4 mr-1" />
                        {isCropMode ? "Finish Crop" : "Crop Image"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isCropMode
                          ? "Apply crop settings"
                          : "Crop your image to fit"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadedImage(null);
                    setIsCropMode(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="ghost" onClick={handleCancelUpload}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={!uploadedImage || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
