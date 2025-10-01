
'use client';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Community, type User } from "@/lib/data";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { PlusCircle, Trash2, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { createCommunity } from "@/ai/flows/create-community-flow";
import { deleteCommunity } from "@/ai/flows/delete-community-flow";
import { CommunityManagerSelector } from "@/components/community-manager-selector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function AdminCommunitiesPage() {
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setLoading(true);
    const communitiesQuery = query(collection(db, "communities"));
    const usersQuery = query(collection(db, "users"));

    const unsubCommunities = onSnapshot(communitiesQuery, (snapshot) => {
      const communitiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));
      setCommunities(communitiesData);
    });
    
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });

    Promise.all([new Promise(res => onSnapshot(communitiesQuery, res)), new Promise(res => onSnapshot(usersQuery, res))])
        .then(() => setLoading(false))

    return () => {
      unsubCommunities();
      unsubUsers();
    };
  }, []);

  const managers = users.filter(u => u.role === 'manager' || u.role === 'organizer');
  const communityMap = new Map(communities.map(c => [c.id, c]));
  const userMap = new Map(users.map(u => [u.id, u]));

  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim()) {
      toast({ title: "Community name is required", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      await createCommunity(newCommunityName);
      toast({ title: "Community Created", description: `"${newCommunityName}" has been created.` });
      setNewCommunityName("");
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Error Creating Community", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }
  
  const handleDeleteCommunity = async (communityId: string, communityName: string) => {
     if (!confirm(`Are you sure you want to delete the community "${communityName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteCommunity(communityId);
      toast({ title: "Community Deleted", description: `"${communityName}" has been deleted.` });
    } catch (error: any) {
      toast({ title: "Error Deleting Community", description: error.message, variant: "destructive" });
    }
  }
  
  const onManagerAssigned = (communityId: string, managerId?: string) => {
      setCommunities(prev => prev.map(c => c.id === communityId ? {...c, managerId} : c));
  }


  return (
    <>
      <PageHeader
        title="Community Management"
        description="Create, manage, and assign managers to communities."
      />
       {communities.length === 0 && !loading && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertTitle>No Communities Found</AlertTitle>
          <AlertDescription>
            Get started by creating your first community. Users can be assigned to communities to be managed by community managers.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Communities</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Community
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Community</DialogTitle>
                <DialogDescription>
                  Enter the name for the new community below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="community-name">Community Name</Label>
                <Input
                  id="community-name"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="e.g., 'Web Development Wing'"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCommunity} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Community Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>Loading...</TableCell>
                    <TableCell>Loading...</TableCell>
                    <TableCell className="text-right">Loading...</TableCell>
                  </TableRow>
                ))
              ) : communities.length > 0 ? (
                communities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">{community.name}</TableCell>
                    <TableCell>
                      <CommunityManagerSelector
                        community={community}
                        managers={managers}
                        onManagerAssigned={onManagerAssigned}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteCommunity(community.id, community.name)}>
                           <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No communities created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

