
import { PageHeader } from "@/components/page-header";
import { type User } from "@/lib/data";
import { Award, Users as UsersIcon } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { AdminUsersClient } from "@/components/admin-users-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopPerformersList } from "@/components/top-performers-list";

// This forces the page to be dynamically rendered and not cached.
export const revalidate = 0;

async function getDashboardData() {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const allUsers = usersSnapshot.docs.map(doc => doc.data() as User);
    
    const topUsers = allUsers.filter(u => u.role !== 'organizer').sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0, 5);
    
    const totalUsers = allUsers.filter(doc => doc.role !== 'organizer').length;
    const totalPoints = allUsers.reduce((acc, doc) => acc + (doc.points > 0 ? doc.points : 0), 0);


    return { topUsers, totalUsers, totalPoints };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return { topUsers: [], totalUsers: 0, totalPoints: 0 };
  }
}

export default async function AdminDashboardPage() {
  const { topUsers, totalUsers, totalPoints } = await getDashboardData();
  
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
            <p className="text-xs text-muted-foreground">managers and users in the community</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Awarded</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">across all communities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <div className="col-span-12 lg:col-span-4">
            {/* Placeholder for future chart */}
        </div>
        <TopPerformersList users={topUsers} />
      </div>
      
      <AdminUsersClient initialUsers={[]} />
    </>
  );
}
