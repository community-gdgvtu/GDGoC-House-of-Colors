
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setHasChanged(e.target.value !== user?.name);
  };

  const handleSaveChanges = async () => {
    if (!user || !hasChanged) return;

    setIsSaving(true);
    const userRef = doc(db, "users", user.id);

    try {
      await updateDoc(userRef, {
        name: name,
      });
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
      });
      setHasChanged(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return <div className="text-center">Loading profile...</div>;
  }
  
  if (!user) {
     return <PageHeader title="User not found" description="Please log in to view your profile." />;
  }

  return (
    <>
      <PageHeader
        title="My Profile"
        description="View and edit your personal information."
      />
      <Card>
        <CardHeader>
           <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <CardDescription className="font-mono mt-1">{user.customId}</CardDescription>
            </div>
           </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={handleNameChange} 
                className="max-w-sm"
              />
              <p className="text-sm text-muted-foreground">This is the name that will be displayed throughout the portal.</p>
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user.email} 
                disabled 
                className="max-w-sm bg-muted/50"
              />
               <p className="text-sm text-muted-foreground">Your email address cannot be changed.</p>
            </div>
            <div className="flex">
                <Button onClick={handleSaveChanges} disabled={!hasChanged || isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
