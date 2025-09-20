
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
import { getHouseById, type User, type House } from "@/lib/data";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, limit, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

interface PointHistory {
  remark: string;
}

interface UserWithRemark extends User {
  latestRemark?: string;
}

export default function HousePage({ params }: { params: { slug: string } }) {
  const house = getHouseById(params.slug);
  const [members, setMembers] = useState<UserWithRemark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!house) return;

    const usersQuery = query(
      collection(db, "users"),
      where("houseId", "==", house.id),
      where("role", "==", "user")
    );

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[];
      const sortedUsers = usersData.sort((a, b) => b.points - a.points);
      setMembers(sortedUsers);
      setLoading(false);

      // For each user, get the latest remark
      sortedUsers.forEach(user => {
        const remarksQuery = query(
          collection(db, "users", user.id, "point_history"),
          orderBy("timestamp", "desc"),
          limit(1)
        );

        onSnapshot(remarksQuery, (remarksSnapshot) => {
          if (!remarksSnapshot.empty) {
            const latestRemark = remarksSnapshot.docs[0].data() as PointHistory;
            setMembers(prevMembers => prevMembers.map(m => 
                m.id === user.id ? { ...m, latestRemark: latestRemark.remark } : m
            ));
          }
        });
      });
    });

    return () => unsubscribeUsers();
  }, [house]);

  if (!house) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg`} style={{ backgroundColor: house.color }}>
        <PageHeader
          title={`${house.name}`}
          description={`Meet the members of the mighty ${house.name}.`}
          className={`${house.textColor}`}
        />
        <div className={`mt-4 grid grid-cols-2 gap-4 ${house.textColor}`}>
          <div>
            <h3 className="font-bold text-lg">President</h3>
            <p>{house.president}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg">House Captain</h3>
            <p>{house.houseCaptain}</p>
          </div>
        </div>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Latest Reason</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading members...</TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center">No members in this house yet.</TableCell>
                </TableRow>
              ) : (
                members.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{member.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]" title={member.latestRemark}>
                      {member.latestRemark || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-bold">{member.points}</TableCell>
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
