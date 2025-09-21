
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type User } from "@/lib/data";
import { ManagePointsDialog } from "@/components/manage-points-dialog";
import { HouseSelector } from "@/components/house-selector";
import { BulkAddUsersDialog } from "@/components/bulk-add-users-dialog";
import { Button } from "./ui/button";
import { backfillCustomIds } from "@/ai/flows/backfill-user-ids-flow";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Search } from "lucide-react";
import { Input } from "./ui/input";
import { BulkManagePointsDialog } from "./bulk-manage-points-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "./ui/skeleton";

interface AdminUsersClientProps {
    initialUsers: User[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [backfillLoading, setBackfillLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const usersQuery = query(collection(db, "users"), orderBy("name", "asc"));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time users:", error);
      toast({
        title: "Error fetching users",
        description: "Could not retrieve real-time user data.",
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const handleBackfill = async () => {
    if (!confirm("This will find all users who do not have a custom ID (e.g., GOOGE001) and assign one to them. Are you sure you want to proceed?")) {
      return;
    }
    setBackfillLoading(true);
    try {
      const result = await backfillCustomIds();
      toast({
        title: "Backfill Complete",
        description: `${result.updatedCount} users were updated with new IDs. ${result.skippedCount} users already had IDs.`,
      });
    } catch (error: any) {
       toast({
        title: "Backfill Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBackfillLoading(false);
    }
  }

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const customId = user.customId || "";
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      customId.toLowerCase().includes(query)
    );
  });

  const onUsersUpdated = (updatedUsers: User[]) => {
    // This function can be called from child dialogs to optimistically update state,
    // but the onSnapshot listener is the source of truth.
    setUsers(currentUsers => {
      const userMap = new Map(currentUsers.map(u => [u.id, u]));
      updatedUsers.forEach(u => userMap.set(u.id, u));
      return Array.from(userMap.values());
    });
  }

  const onUserDeleted = (userId: string) => {
    // Optimistically remove user from local state.
    // The onSnapshot listener will then confirm this from the database.
    setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle>All Users</CardTitle>
          <div className="flex gap-2 sm:gap-4 flex-col sm:flex-row">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 sm:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2 flex-wrap">
               <BulkManagePointsDialog onUpdate={onUsersUpdated} />
               <BulkAddUsersDialog />
               <Button variant="outline" onClick={handleBackfill} disabled={backfillLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {backfillLoading ? "Backfilling..." : "Backfill IDs"}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">House</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="w-auto text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({length: 10}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[150px] mt-1" />
                      </div>
                    </div>
                  </TableCell>
                   <TableCell className="hidden md:table-cell"><Skeleton className="h-8 w-[120px]" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-[50px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-[30px] ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-[150px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      {users.length > 0 ? "No users found for your search." : "No users have been added yet."}
                    </TableCell>
                </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground block sm:hidden md:block">{user.email}</div>
                        <div className="text-xs text-muted-foreground font-mono block sm:hidden md:block">{user.customId || 'NO ID'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.role === 'admin' ? (
                      <span>-</span>
                    ) : (
                      <HouseSelector user={user} onUpdate={onUsersUpdated} />
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{user.points}</TableCell>
                  <TableCell className="text-right">
                    {user.role === 'user' && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <ManagePointsDialog user={user} mode="add" onUpdate={onUsersUpdated} />
                        <ManagePointsDialog user={user} mode="deduct" onUpdate={onUsersUpdated} />
                        <DeleteUserDialog user={user} onUserDeleted={onUserDeleted} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
