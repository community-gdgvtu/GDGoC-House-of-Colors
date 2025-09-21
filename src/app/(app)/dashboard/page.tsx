
"use client";

import { PageHeader } from "@/components/page-header";
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type House } from "@/lib/data";
import { Award, Shield, History, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PointHistory {
  id: string;
  pointsAdded: number;
  remark: string;
  timestamp: Timestamp;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Effect for fetching point history
  useEffect(() => {
    if (authLoading) return; // Wait for auth to be ready
    if (!user) {
      setPointHistory([]);
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    const pointHistoryQuery = query(
      collection(db, "users", user.id, "point_history"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(pointHistoryQuery, (querySnapshot) => {
      const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PointHistory[];
      setPointHistory(historyData);
      setLoadingHistory(false);
    }, (error) => {
      console.error("Error fetching point history:", error);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  // Effect for fetching house standings
  useEffect(() => {
    const housesQuery = query(collection(db, "houses"), orderBy("points", "desc"));
    const unsubHouses = onSnapshot(housesQuery, (snapshot) => {
        const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), points: doc.data().points || 0 })) as House[];
        setHouses(housesData);
    });

    return () => unsubHouses();
  }, []);
  
  const userHouse = houses.find(h => h.id === user?.houseId);

  const housePoints = houses.map(h => ({
    house: h.name,
    points: h.points >= 0 ? h.points : 0, // Ensure points are not negative
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

  if (authLoading) {
    return (
       <div className="flex items-center justify-center h-full">
         <div className="p-4 rounded-lg">Loading dashboard...</div>
       </div>
     );
  }

  if (!user) {
    return (
        <div className="flex items-center justify-center h-full">
            <PageHeader title="User not found or not logged in." />
        </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}!`}
        description="Here's your personal overview of the GDGoC."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Points</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.points}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your House</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold`}>{userHouse?.name || 'Unassigned'}</div>
            <p className={`text-xs`} style={{color: userHouse?.color}}>
                {userHouse ? `Proud member of the ${userHouse.name}` : 'You have not been assigned to a house yet.'}
            </p>
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Info</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{user.customId}</div>
            <p className="text-xs text-muted-foreground">
                Your unique identifier for all events.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>House Standings</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={housePoints}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="house"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                 <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="points" radius={8}>
                  {housePoints.map((entry) => (
                    <Bar key={entry.house} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Point History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Loading history...</TableCell>
                  </TableRow>
                ) : pointHistory.length > 0 ? (
                  pointHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium truncate max-w-[150px]" title={item.remark}>{item.remark}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.timestamp?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${item.pointsAdded > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.pointsAdded > 0 ? `+${item.pointsAdded}` : item.pointsAdded}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No points awarded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
