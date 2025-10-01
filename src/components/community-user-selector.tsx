
"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type User, type Community } from "@/lib/data";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { changeUserCommunity } from "@/ai/flows/change-user-community-flow";

interface CommunityUserSelectorProps {
  user: User;
  communities: Community[];
  onUpdate?: (updatedUsers: User[]) => void;
}

const UNASSIGN_VALUE = "unassign";

export function CommunityUserSelector({ user, communities, onUpdate }: CommunityUserSelectorProps) {
  const [selectedCommunity, setSelectedCommunity] = useState(user.communityId || UNASSIGN_VALUE);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setSelectedCommunity(user.communityId || UNASSIGN_VALUE);
  }, [user.communityId]);

  const handleCommunityChange = async (value: string) => {
    const newCommunityId = value === UNASSIGN_VALUE ? "" : value;
    if (newCommunityId === selectedCommunity) return;

    setIsLoading(true);
    const oldCommunityId = selectedCommunity;

    try {
        const updatedUser = await changeUserCommunity({
            userId: user.id,
            newCommunityId,
            oldCommunityId
        });

        if (onUpdate) {
            onUpdate([updatedUser]);
        }

        setSelectedCommunity(newCommunityId);
        toast({
            title: "Community Updated",
            description: `${user.name} has been ${newCommunityId ? 'moved to a new community' : 'unassigned'}.`,
        });

    } catch (error: any) {
        console.error("Error updating community:", error);
        toast({
            title: "Update Failed",
            description: `Could not change community. ${error.message}`,
            variant: "destructive",
        });
        setSelectedCommunity(oldCommunityId);
    } finally {
        setIsLoading(false);
    }
  };
  
  if (user.role === 'organizer' || user.role === 'manager') {
    const communityName = communities.find(c => c.id === user.communityId)?.name;
    return <span>{communityName || 'N/A'}</span>
  }

  return (
    <Select
      value={selectedCommunity}
      onValueChange={handleCommunityChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Assign community" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGN_VALUE}>Unassign</SelectItem>
        {communities.map((community) => (
            <SelectItem key={community.id} value={community.id}>
              {community.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
