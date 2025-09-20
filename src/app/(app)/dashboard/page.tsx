
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
import { getHouseById, House } from "@/lib/data";
import { Award, Shield, History } from "lucide-react";
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
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const house = user && user.houseId ? getHouseById(user.houseId) : undefined;
  
  useEffect(() => {
    // Only fetch if auth is done and we have a user
    if (!authLoading && user) {
      setLoadingHistory(true);
      const q = query(
        collection(db, "users", user.id, "point_history"),
        orderBy("timestamp", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PointHistory[];
        setPointHistory(historyData);
        setLoadingHistory(false);
      }, (error) => {
        console.error("Error fetching point history:", error);
        setLoadingHistory(false);
      });
      return () => unsubscribe();
    } else if (!authLoading && !user) {
      // If auth is done and there's no user, stop loading
      setLoadingHistory(false);
    }
  }, [user, authLoading]);


  useEffect(() => {
    const fetchHousesAndUsers = async () => {
        const housesQuery = query(collection(db, "houses"));
        const usersQuery = query(collection(db, "users"));
        
        const unsubHouses = onSnapshot(housesQuery, (snapshot) => {
            const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as House[];
            setHouses(housesData);
        });

        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUsers(usersData);
        });

        return () => {
            unsubHouses();
            unsubUsers();
        }
    }
    fetchHousesAndUsers();
  }, []);

  const housePoints = houses.map(h => {
    const houseUsers = allUsers.filter(u => u.houseId === h.id);
    const totalPoints = houseUsers.reduce((acc, u) => acc + (u.points || 0), 0);
    return {
      house: h.name,
      points: totalPoints,
      fill: h.color,
    };
  });
  
  const chartConfig: ChartConfig = {
    points: {
      label: "Points",
    },
  };
  
  housePoints.forEach(item => {
    chartConfig[item.house] = {
      label: item.house,
      color: item.fill,
    }
  });


  if (authLoading) {
    return (
       <div className="flex items-center justify-center">
         <div className="p-4 rounded-lg">Loading dashboard...</div>
       </div>
     );
  }

  if (!user) {
    return <PageHeader title="User not found" />;
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
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your House</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold`}>{house?.name}</div>
            <p className={`text-xs`} style={{color: house?.color}}>Proud member of the {house?.name}</p>
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
                      <TableCell className="text-right font-bold">+{item.pointsAdded}</TableCell>
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
