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
import { getUserById, getHouseById, users, houses } from "@/lib/data";
import { Award, Shield, User as UserIcon } from "lucide-react";

export default function DashboardPage() {
  const user = getUserById("user_1");
  const house = user ? getHouseById(user.houseId) : undefined;

  const housePoints = houses.map(h => {
    const houseUsers = users.filter(u => u.houseId === h.id);
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
  
  // Add house colors to chart config dynamically
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
