
import { PageHeader } from "@/components/page-header";
import { type User, type House } from "@/lib/data";
import { Award, Users as UsersIcon } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { AdminUsersClient } from "@/components/admin-users-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HousePerformanceChart } from "@/components/house-performance-chart";
import { TopPerformersList } from "@/components/top-performers-list";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// This forces the page to be dynamically rendered and not cached.
export const revalidate = 0;

async function getDashboardData() {
  try {
    const housesSnapshot = await adminDb.collection("houses").orderBy("points", "desc").get();
    const houses = housesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as House[];
    
    const topUsersSnapshot = await adminDb.collection("users").orderBy("points", "desc").limit(5).get();
    const topUsers = topUsersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[];

    const statsSnapshot = await adminDb.collection('users').get();
    const totalUsers = statsSnapshot.docs.filter(doc => doc.data().role !== 'admin').length;
    const totalPoints = statsSnapshot.docs.reduce((acc, doc) => acc + (doc.data().points > 0 ? doc.data().points : 0), 0);


    return { houses, topUsers, totalUsers, totalPoints };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return { houses: [], topUsers: [], totalUsers: 0, totalPoints: 0 };
  }
}

export default async function AdminDashboardPage() {
  const { houses, topUsers, totalUsers, totalPoints } = await getDashboardData();
  
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
        <TopPerformersList users={topUsers} houses={houses} />
      </div>
      
      {/* Pass an empty array; the client component will fetch the real-time data. */}
      <AdminUsersClient initialUsers={[]} />
    </>
  );
}
