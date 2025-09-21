
import { PageHeader } from "@/components/page-header";
import { events, type User } from "@/lib/data";
import { Award, Calendar, Users as UsersIcon } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { AdminUsersClient } from "@/components/admin-users-client";

async function getUsers() {
  try {
    const usersSnapshot = await adminDb.collection("users").get();
    const users = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[];
    return users;
  } catch (error) {
    console.error("Error fetching users with Admin SDK:", error);
    // In case of an error on the server, return an empty array.
    // The client component will show a message.
    return [];
  }
}

export default async function AdminDashboardPage() {
  const users = await getUsers();
  
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalPoints = users.reduce((acc, user) => acc + (user.points > 0 ? user.points : 0), 0);
  const totalEvents = events.length;

  return (
    <>
      <PageHeader title="Admin Overview" description="Manage your community and events from one place." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">participants in the community</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Awarded</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">across all houses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">scheduled for the year</p>
          </CardContent>
        </Card>
      </div>
      
      <AdminUsersClient initialUsers={users} />
    </>
  );
}

// We need to re-import these components because the page is now a server component
// and they were not being explicitly imported before.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
