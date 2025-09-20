
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getHouseById, users, houses as staticHouses, House } from "@/lib/data";
import { Award, Shield, User as UserIcon, MessageSquareQuote } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PointHistory {
  id: string;
  pointsAdded: number;
  remark: string;
  timestamp: any;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>(staticHouses);
  const [allUsers, setAllUsers] = useState<any[]>(users);
  const [latestRemark, setLatestRemark] = useState<string>("");

  const house = user && user.houseId ? getHouseById(user.houseId) : undefined;
  
  useEffect(() => {
    if (user?.id) {
      const q = query(
        collection(db, "users", user.id, "point_history"),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const latest = querySnapshot.docs[0].data() as PointHistory;
          setLatestRemark(latest.remark);
        } else {
          setLatestRemark("No points awarded yet.");
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);


  useEffect(() => {
    const fetchHousesAndUsers = async () => {
        const housesQuery = query(collection(db, "houses"));
        const usersQuery = query(collection(db, "users"));
        
        onSnapshot(housesQuery, (snapshot) => {
            const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as House[];
            setHouses(housesData);
        });

        onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUsers(usersData);
        });
    }
    fetchHousesAndUsers();
  }, []);

  const housePoints = houses.map(h => {
    const houseUsers = allUsers.filter(u => u.houseId === h.id);
    const totalPoints = houseUsers.reduce((acc, u) => acc + u.points, 0);
    return {
      house: h.name,
      points: totalPoints,
      fill: h.color,
    };
  });
  
  const chartConfig = {
    points: {
      label: "Points",
    },
  } as ChartConfig;
  
  housePoints.forEach(item => {
    chartConfig[item.house] = {
      label: item.house,
      color: item.fill,
    }
  });


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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your House</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold`}>{house?.name}</div>
            <p className={`text-xs`} style={{color: house?.color}}>Proud member of the {house?.name}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
            <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate" title={latestRemark}>{latestRemark}</div>
            <p className="text-xs text-muted-foreground">Reason for your latest points.</p>
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
      </div>
    </>
  );
}
