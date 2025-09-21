
import { PageHeader } from "@/components/page-header";
import { type User, type House } from "@/lib/data";
import { Award, Users as UsersIcon } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { AdminUsersClient } from "@/components/admin-users-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HousePerformanceChart } from "@/components/house-performance-chart";
import { TopPerformersList } from "@/components/top-performers-list";

async function getDashboardData() {
  try {
    const usersSnapshot = await adminDb.collection("users").orderBy("points", "desc").get();
    const users = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[];

    const housesSnapshot = await adminDb.collection("houses").orderBy("points", "desc").get();
    const houses = housesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as House[];

    return { users, houses };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return { users: [], houses: [] };
  }
}

export default async function AdminDashboardPage() {
  const { users, houses } = await getDashboardData();
  
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalPoints = users.reduce((acc, user) => acc + (user.points > 0 ? user.points : 0), 0);

  return (
    <>
      <PageHeader title="Admin Overview" description="Manage your community and events from one place." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <HousePerformanceChart houses={houses} />
        <TopPerformersList users={users} houses={houses} />
      </div>
      
      <AdminUsersClient initialUsers={users} />
    </>
  );
}
