
"use client";

import { useState } from "react";
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
import { Wand2 } from "lucide-react";

interface AdminUsersClientProps {
    initialUsers: User[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const { toast } = useToast();

  const handleBackfill = async () => {
    if (!confirm("Are you sure you want to assign new IDs to all existing users? This should only be run once.")) {
      return;
    }
    setBackfillLoading(true);
    try {
      const result = await backfillCustomIds();
      toast({
        title: "Backfill Complete",
        description: `${result.updatedCount} users were updated with new IDs. Please refresh the page to see the changes.`,
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

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>All Users</CardTitle>
        <div className="flex gap-2">
           <Button variant="outline" onClick={handleBackfill} disabled={backfillLoading}>
             <Wand2 className="mr-2" />
             {backfillLoading ? "Backfilling..." : "Backfill User IDs"}
           </Button>
          <BulkAddUsersDialog />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>House</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="w-[240px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">No users found.</TableCell>
                </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground font-mono">{user.customId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <span>-</span>
                    ) : (
                      <HouseSelector user={user} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{user.points}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {user.role === 'user' && (
                      <>
                        <ManagePointsDialog user={user} mode="add" />
                        <ManagePointsDialog user={user} mode="deduct" />
                      </>
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
