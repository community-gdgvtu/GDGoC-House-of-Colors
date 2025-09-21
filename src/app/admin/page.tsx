
import { PageHeader } from "@/components/page-header";
import { type User, type House } from "@/lib/data";
import { Award, Users as UsersIcon, Trophy } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { AdminUsersClient } from "@/components/admin-users-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

function TopPerformers({ users, houses }: { users: User[], houses: House[] }) {
    const topUsers = users.slice(0, 5);
    const houseMap = new Map(houses.map(h => [h.id, h]));

    return (
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {topUsers.length > 0 ? (
                  topUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{houseMap.get(user.houseId)?.name || 'Unassigned'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg tabular-nums">{user.points}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-10">
                      No users with points yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    )
}

function HousePerformance({ houses }: { houses: House[] }) {
    const housePoints = houses.map(h => ({
        house: h.name,
        points: h.points >= 0 ? h.points : 0,
        fill: h.color,
    }));

    const chartConfig: ChartConfig = {
        points: {
          label: "Points",
        },
        ...housePoints.reduce((acc, cur) => {
          acc[cur.house] = { label: cur.house, color: cur.fill };
          return acc;
        }, {} as ChartConfig)
    };
    
    return (
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>House Performance</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
                data={housePoints}
                layout="vertical"
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                accessibilityLayer
            >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="house"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                    width={90}
                />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                />
                <Bar dataKey="points" radius={8}>
                {housePoints.map((entry) => (
                    <Cell key={entry.house} fill={entry.fill} />
                ))}
                </Bar>
            </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
    )
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
        <HousePerformance houses={houses} />
        <TopPerformers users={users} houses={houses} />
      </div>
      
      <AdminUsersClient initialUsers={users} />
    </>
  );
}
