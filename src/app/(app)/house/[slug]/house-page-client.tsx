
"use client";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type User, type House } from "@/lib/data";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export function HousePageClient({ house }: { house: House }) {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!house) return;

    setLoading(true);
    const usersQuery = query(
      collection(db, "users"),
      where("houseId", "==", house.id),
      orderBy("points", "desc")
    );

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      setMembers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching house members: ", error);
      setLoading(false);
    });

    return () => unsubscribeUsers();
  }, [house]);

  return (
    <div className="space-y-6">
      <div className={`p-8 rounded-lg relative overflow-hidden`} style={{ backgroundColor: house.color }}>
         <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="relative">
          <PageHeader
            title={`${house.name}`}
            description={`Meet the members of the mighty ${house.name}.`}
            className={`mb-0 ${house.textColor}`}
          />
          <div className={`mt-6 grid grid-cols-2 gap-4 ${house.textColor}`}>
            <div>
              <h3 className="font-bold text-lg opacity-80">President</h3>
              <p className="font-semibold text-xl">{house.president}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg opacity-80">House Captain</h3>
              <p className="font-semibold text-xl">{house.houseCaptain}</p>
            </div>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium"><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                    </TableRow>
                  ))
              ) : members.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">No members in this house yet.</TableCell>
                </TableRow>
              ) : (
                members.map((member, index) => (
                  <TableRow key={member.id} className={index === 0 ? 'bg-amber-400/10 hover:bg-amber-400/20' : ''}>
                    <TableCell className="font-medium text-lg text-center">
                        {index === 0 && <Trophy className="w-5 h-5 text-amber-400 inline-block" />}
                        {index > 0 && (index + 1)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.customId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg tabular-nums">{member.points}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
