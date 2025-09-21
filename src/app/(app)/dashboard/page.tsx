
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { type House } from "@/lib/data";
import { Award, Shield, History, User as UserIcon, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loadingHouses, setLoadingHouses] = useState(true);

  // Effect for fetching point history
  useEffect(() => {
    if (authLoading || !user) {
      if (!user) {
        setPointHistory([]);
        setLoadingHistory(false);
      }
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
    setLoadingHouses(true);
    const housesQuery = query(collection(db, "houses"), orderBy("points", "desc"));
    const unsubHouses = onSnapshot(housesQuery, (snapshot) => {
        const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), points: doc.data().points || 0 })) as House[];
        setHouses(housesData);
        setLoadingHouses(false);
    }, (error) => {
      console.error("Error fetching houses:", error);
      setLoadingHouses(false);
    });

    return () => unsubHouses();
  }, []);
  
  const userHouse = useMemo(() => houses.find(h => h.id === user?.houseId), [houses, user]);
  const userRankInHouse = useMemo(() => {
      if (!userHouse) return null;
      // This is a placeholder as we don't have all member data on the client
      // A more complex query would be needed for a live rank
      return houses.findIndex(h => h.id === userHouse.id) + 1;
  }, [userHouse, houses]);

  const housePoints = useMemo(() => houses.map(h => ({
    house: h.name,
    points: h.points >= 0 ? h.points : 0,
    fill: h.color,
  })), [houses]);
  
  const chartConfig: ChartConfig = {
    points: {
      label: "Points",
    },
    ...housePoints.reduce((acc, cur) => {
      acc[cur.house] = { label: cur.house, color: cur.fill };
      return acc;
    }, {} as ChartConfig)
  };

  if (authLoading || !user) {
    return (
       <div className="flex items-center justify-center h-full">
         <div className="p-4 rounded-lg">Loading dashboard...</div>
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
                {userHouse ? `Proud member of the ${userHouse.name}` : 'You are not in a house yet.'}
            </p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">House Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loadingHouses ? <Skeleton className="h-8 w-1/4" /> : 
                <div className="text-2xl font-bold">
                    {userRankInHouse ? `#${userRankInHouse}` : 'N/A'}
                </div>
            }
            <p className="text-xs text-muted-foreground">Your house's position on the leaderboard.</p>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your ID</CardTitle>
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
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>House Standings</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {loadingHouses ? <Skeleton className="h-[300px] w-full" /> : 
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                        width={80}
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
            }
          </CardContent>
        </Card>
        <Card className="col-span-12 lg:col-span-3">
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
                  Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-[30px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : pointHistory.length > 0 ? (
                  pointHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium truncate max-w-[150px]" title={item.remark}>{item.remark}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.timestamp?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className={`text-right font-bold tabular-nums ${item.pointsAdded >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.pointsAdded >= 0 ? `+${item.pointsAdded}` : item.pointsAdded}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
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
