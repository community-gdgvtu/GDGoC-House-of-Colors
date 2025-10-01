
'use client';

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type User, type Community } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { updateCommunityManager } from "@/ai/flows/update-community-manager-flow";

interface CommunityManagerSelectorProps {
  community: Community;
  managers: User[];
  onManagerAssigned: (communityId: string, managerId?: string) => void;
}

const UNASSIGN_VALUE = "unassign";

export function CommunityManagerSelector({ community, managers, onManagerAssigned }: CommunityManagerSelectorProps) {
  const [selectedManager, setSelectedManager] = useState(community.managerId || UNASSIGN_VALUE);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManagerChange = async (value: string) => {
    const newManagerId = value === UNASSIGN_VALUE ? "" : value;
    if (newManagerId === selectedManager) return;
    
    setIsLoading(true);
    const oldManagerId = selectedManager;
    setSelectedManager(newManagerId);

    try {
        await updateCommunityManager({
            communityId: community.id,
            newManagerId: newManagerId,
            oldManagerId: oldManagerId === UNASSIGN_VALUE ? undefined : oldManagerId,
        });

        onManagerAssigned(community.id, newManagerId || undefined);

        toast({
            title: "Manager Updated",
            description: `Manager for ${community.name} has been updated.`,
        });

    } catch (error: any) {
        console.error("Error updating manager:", error);
        toast({
            title: "Update Failed",
            description: `Could not change manager. ${error.message}`,
            variant: "destructive",
        });
        setSelectedManager(oldManagerId);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Select
      value={selectedManager}
      onValueChange={handleManagerChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Assign a manager" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGN_VALUE}>Unassigned</SelectItem>
        {managers.map((manager) => (
            <SelectItem key={manager.id} value={manager.id}>
              {manager.name} ({manager.role})
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
