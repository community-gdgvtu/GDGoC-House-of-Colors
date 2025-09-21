
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { type User, type House } from "@/lib/data";
import { ManagePointsDialog } from "@/components/manage-points-dialog";
import { HouseSelector } from "@/components/house-selector";
import { BulkAddUsersDialog } from "@/components/bulk-add-users-dialog";
import { Button } from "./ui/button";
import { backfillCustomIds } from "@/ai/flows/backfill-user-ids-flow";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Search, ArrowUpDown, Download } from "lucide-react";
import { Input } from "./ui/input";
import { BulkManagePointsDialog } from "./bulk-manage-points-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "./ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type SortKey = keyof User | 'houseName';
type SortDirection = 'asc' | 'desc';

interface AdminUsersClientProps {
    initialUsers: User[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [houseFilter, setHouseFilter] = useState("all");
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { toast } = useToast();

  const houseMap = useMemo(() => new Map(houses.map(h => [h.id, h])), [houses]);

  useEffect(() => {
    const housesQuery = query(collection(db, "houses"));
    const unsubHouses = onSnapshot(housesQuery, (snapshot) => {
        setHouses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House)));
    });

    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
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

    return () => {
      unsubHouses();
      unsubUsers();
    };
  }, [toast]);


  const handleBackfill = async () => {
    if (!confirm("This will find all users who do not have a custom ID (e.g., GOOGE001) and assign one to them based on the current user count. This is irreversible. Are you sure?")) {
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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const query = searchQuery.toLowerCase();
        const customId = user.customId || "";
        const matchesSearch = user.name.toLowerCase().includes(query) ||
                              user.email.toLowerCase().includes(query) ||
                              customId.toLowerCase().includes(query);
        
        const matchesHouse = houseFilter === 'all' || user.houseId === houseFilter;

        return matchesSearch && matchesHouse;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (sortKey === 'houseName') {
          valA = houseMap.get(a.houseId)?.name || 'Z'; // Unassigned last
          valB = houseMap.get(b.houseId)?.name || 'Z';
        } else {
          valA = a[sortKey as keyof User];
          valB = b[sortKey as keyof User];
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, searchQuery, houseFilter, sortKey, sortDirection, houseMap]);


  const downloadCSV = () => {
    const headers = ["customId", "name", "email", "houseName", "points"];
    const csvRows = [headers.join(",")];

    sortedAndFilteredUsers.forEach(user => {
      const houseName = houseMap.get(user.houseId)?.name || 'Unassigned';
      const row = [user.customId, user.name, user.email, houseName, user.points];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `user_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  const onUsersUpdated = (updatedUsers: User[]) => {
    setUsers(currentUsers => {
      const userMap = new Map(currentUsers.map(u => [u.id, u]));
      updatedUsers.forEach(u => userMap.set(u.id, u));
      return Array.from(userMap.values());
    });
  }

  const onUserDeleted = (userId: string) => {
    setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
  }

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle>All Users</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <div className="flex-1 min-w-[150px] relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
             <Select value={houseFilter} onValueChange={setHouseFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by house" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Houses</SelectItem>
                {houses.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-wrap">
               <BulkManagePointsDialog onUpdate={onUsersUpdated} />
               <BulkAddUsersDialog />
               <Button variant="outline" onClick={handleBackfill} disabled={backfillLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {backfillLoading ? "Backfilling..." : "Backfill IDs"}
              </Button>
               <Button variant="outline" onClick={downloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
               </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                 <Button variant="ghost" onClick={() => handleSort('name')}>
                  User
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                 <Button variant="ghost" onClick={() => handleSort('houseName')}>
                  House
                  {getSortIcon('houseName')}
                </Button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort('points')}>
                  Points
                  {getSortIcon('points')}
                </Button>
              </TableHead>
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
            ) : sortedAndFilteredUsers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      {users.length > 0 ? "No users found for your search/filter." : "No users have been added yet."}
                    </TableCell>
                </TableRow>
            ) : (
              sortedAndFilteredUsers.map((user) => (
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
                  <TableCell className="text-right font-medium tabular-nums">
                     {user.role === 'admin' ? "-" : user.points}
                  </TableCell>
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
        </div>
      </CardContent>
    </Card>
  );
}

    