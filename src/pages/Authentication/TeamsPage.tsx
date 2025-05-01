import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "@/components/user-table";
import { AddUserForm } from "@/components/add-user-form";
import { User, Business } from "@/types";
import { fetchBusinessUsers } from "@/services/userApi";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/loader";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export const Teams: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Get current user info
        setCurrentUser(user);

        if (user?.business) {
          setBusiness(user?.business_details);

          // Get users for the business
          const businessUsers = await fetchBusinessUsers(user.business);
          setUsers(businessUsers);
        }
      } catch (err) {
        setError("Failed to load user data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUserAdded = (newUser: User) => {
    setUsers([...users, newUser]);
    setActiveTab("users");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded-md">
        {error}
      </div>
    );
  }

  if (!currentUser || !business) {
    return <div className="p-4">No business associated with your account</div>;
  }

  const canAddUsers =
    currentUser.role === "owner" || currentUser.role === "admin";

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            {business.name} - Manage users for your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              {canAddUsers && <TabsTrigger value="add">Add User</TabsTrigger>}
            </TabsList>

            <TabsContent value="users">
              <UserTable users={users} />
            </TabsContent>

            {canAddUsers && (
              <TabsContent value="add">
                <AddUserForm
                  businessId={business.id}
                  onUserAdded={handleUserAdded}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            {users.length} user(s) in this business
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default function TeamsPage() {
  return (
    <DashboardLayout>
      <Teams />
    </DashboardLayout>
  );
}
