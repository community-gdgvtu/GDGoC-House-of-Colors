
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
import { type User, type Community } from "@/lib/data";
import { Trophy, Award, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where, orderBy, limit, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function CommunityPageClient({ community: initialCommunity, initialMembers }: { community: Community, initialMembers: User[] }) {
  const [members, setMembers] = useState<User[]>(initialMembers);
  const [community, setCommunity] = useState<Community>(initialCommunity);
  const [manager, setManager] = useState<User | null>(null);

  const totalPoints = useMemo(() => {
    return members.reduce((sum, member) => sum + (member.points || 0), 0);
  }, [members]);

  useEffect(() => {
    if (!community.id) return;

    const membersQuery = query(
        collection(db, "users"),
        where("communityId", "==", community.id),
        orderBy("points", "desc")
    );

    const membersUnsubscribe = onSnapshot(membersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => doc.data() as User);
        setMembers(usersData);
    }, (error) => {
        console.error(`Error fetching members for community ${community.name}:`, error);
    });

    const communityUnsubscribe = onSnapshot(doc(db, "communities", community.id), (docSnap) => {
        if (docSnap.exists()) {
            const communityData = docSnap.data() as Community;
            setCommunity(communityData);

            if (communityData.managerId) {
                const managerUnsubscribe = onSnapshot(doc(db, "users", communityData.managerId), (managerSnap) => {
                    if (managerSnap.exists()) {
                        setManager(managerSnap.data() as User);
                    } else {
                        setManager(null);
                    }
                });
                return () => managerUnsubscribe();
            } else {
                setManager(null);
            }
        }
    });

    return () => {
        membersUnsubscribe();
        communityUnsubscribe();
    };
  }, [community.id, community.name]);


  return (
    <div className="space-y-6">
      <div className={`p-6 md:p-8 rounded-lg relative overflow-hidden bg-card border`}>
        <div className="relative">
          <PageHeader
            title={`${community.name}`}
            description={`Meet the members of the mighty ${community.name}.`}
            className={`mb-0`}
          />
           <div className={`mt-4 flex items-center gap-2`}>
              <Award className="h-6 w-6" />
              <span className="text-2xl font-bold">{totalPoints} Points</span>
            </div>
          <div className={`mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4`}>
            <div>
              <h3 className="font-bold text-lg text-muted-foreground">Community Manager</h3>
              <p className="font-semibold text-xl">{manager?.name || 'Unassigned'}</p>
            </div>
             <div>
              <h3 className="font-bold text-lg text-muted-foreground">Total Members</h3>
              <p className="font-semibold text-xl">{members.length}</p>
            </div>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">Rank</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {members.length === 0 ? (
                <TableRow>
                <TableCell colSpan={3} className="text-center h-24">No members in this community yet.</TableCell>
                </TableRow>
            ) : (
                members.map((member, index) => (
                <TableRow key={member.id} className={index === 0 ? 'bg-amber-400/10 hover:bg-amber-400/20' : ''}>
                    <TableCell className="font-medium text-lg text-center w-[60px]">
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
