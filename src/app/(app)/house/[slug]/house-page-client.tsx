
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
import { Trophy, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy, limit, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function HousePageClient({ house: initialHouse, initialMembers }: { house: House, initialMembers: User[] }) {
  const [members, setMembers] = useState<User[]>(initialMembers);
  const [house, setHouse] = useState<House>(initialHouse);

  useEffect(() => {
    if (!house.id) return;

    const membersQuery = query(
        collection(db, "users"),
        where("houseId", "==", house.id),
        orderBy("points", "desc"),
        limit(1000)
    );

    const membersUnsubscribe = onSnapshot(membersQuery, (snapshot) => {
        if (snapshot.metadata.fromCache && snapshot.docs.length === 0) {
            return;
        }
        const usersData = snapshot.docs.map(doc => doc.data() as User);
        setMembers(usersData);
    }, (error) => {
        console.error(`Error fetching members for house ${house.name}:`, error);
    });

    const houseUnsubscribe = onSnapshot(doc(db, "houses", house.id), (docSnap) => {
        if (docSnap.exists()) {
            setHouse(docSnap.data() as House);
        }
    });

    return () => {
        membersUnsubscribe();
        houseUnsubscribe();
    };
  }, [house.id, house.name]);


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
           <div className={`mt-4 flex items-center gap-2 ${house.textColor}`}>
              <Award className="h-6 w-6" />
              <span className="text-2xl font-bold">{house.points} Points</span>
            </div>
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
            {members.length === 0 ? (
                <TableRow>
                <TableCell colSpan={3} className="text-center h-24">No members in this house yet.</TableCell>
                </TableRow>
            ) : (
                members.map((member, index) => (
                <TableRow key={member.id} className={index === 0 ? 'bg-amber-400/10 hover:bg-amber-400/20' : ''}>
                    <TableCell className="font-medium text-lg text-center w-[80px]">
                        {index === 0 ? <Trophy className="w-5 h-5 text-amber-400 inline-block" /> : (index + 1)}
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
