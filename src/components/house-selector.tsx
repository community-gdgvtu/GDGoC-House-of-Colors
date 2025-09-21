
"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type User, type House } from "@/lib/data";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { changeUserHouse } from "@/ai/flows/change-user-house-flow";

interface HouseSelectorProps {
  user: User;
  onUpdate?: (updatedUsers: User[]) => void;
}

const UNASSIGN_VALUE = "unassign";

export function HouseSelector({ user, onUpdate }: HouseSelectorProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState(user.houseId || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "houses"), (snapshot) => {
      const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as House[];
      setHouses(housesData);
    });
    return () => unsub();
  }, []);
  
  // Keep component state in sync if the user prop changes from above
  useEffect(() => {
    setSelectedHouse(user.houseId || "");
  }, [user.houseId]);

  const handleHouseChange = async (value: string) => {
    const newHouseId = value === UNASSIGN_VALUE ? "" : value;
    if (newHouseId === selectedHouse) return;

    setIsLoading(true);
    const oldHouseId = selectedHouse;

    try {
        const updatedUser = await changeUserHouse({
            userId: user.id,
            newHouseId,
            oldHouseId
        });

        if (onUpdate && updatedUser) {
            onUpdate([updatedUser]);
        }

        setSelectedHouse(newHouseId);
        toast({
            title: "House Updated",
            description: `${user.name} has been ${newHouseId ? 'moved to a new house' : 'unassigned'}.`,
        });

    } catch (error: any) {
        console.error("Error updating house:", error);
        toast({
            title: "Update Failed",
            description: `Could not change house. ${error.message}`,
            variant: "destructive",
        });
        // Revert UI on failure
        setSelectedHouse(oldHouseId);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Select
      value={selectedHouse || UNASSIGN_VALUE}
      onValueChange={handleHouseChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Assign house" />
      </SelectTrigger>
      <SelectContent>
        {houses.length > 0 ? (
          houses.map((house) => (
            <SelectItem key={house.id} value={house.id}>
              {house.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="loading" disabled>Loading houses...</SelectItem>
        )}
         <SelectItem value={UNASSIGN_VALUE}>Unassign</SelectItem>
      </SelectContent>
    </Select>
  );
}
