
"use client";

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, runTransaction, doc, onSnapshot, increment } from 'firebase/firestore';
import type { House, User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface HouseSelectorProps {
  user: User;
}

export function HouseSelector({ user }: HouseSelectorProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This listener provides real-time updates for the house list.
    const unsubscribe = onSnapshot(collection(db, 'houses'), (snapshot) => {
        const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
        setHouses(housesData);
    }, (error) => {
        // This will now correctly fire if there's a permission issue.
        console.error("Failed to fetch houses:", error);
        toast({
            title: "Error",
            description: "Could not fetch house list. Check permissions.",
            variant: "destructive"
        });
    });

    return () => unsubscribe();
  }, [toast]);

  const handleHouseChange = async (selectedValue: string) => {
    const newHouseId = selectedValue === "unassigned" ? "" : selectedValue;
    const oldHouseId = user.houseId;

    if (newHouseId === oldHouseId) return;

    setIsUpdating(true);
    
    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.id);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists()) {
                throw new Error("User document not found.");
            }
            const userPoints = userDoc.data().points || 0;

            // 1. Update the user's house assignment
            transaction.update(userRef, { houseId: newHouseId });

            // 2. Decrement points from the old house, if it exists
            if (oldHouseId) {
                const oldHouseRef = doc(db, "houses", oldHouseId);
                const oldHouseDoc = await transaction.get(oldHouseRef);
                if (oldHouseDoc.exists()) {
                    transaction.update(oldHouseRef, { points: increment(-userPoints) });
                } else {
                    console.warn(`Old house document (ID: ${oldHouseId}) not found. Skipping point deduction.`);
                }
            }

            // 3. Increment points for the new house, if it exists
            if (newHouseId) {
                const newHouseRef = doc(db, "houses", newHouseId);
                const newHouseDoc = await transaction.get(newHouseRef);
                if (newHouseDoc.exists()) {
                    transaction.update(newHouseRef, { points: increment(userPoints) });
                } else {
                    console.warn(`New house document (ID: ${newHouseId}) not found. Skipping point addition.`);
                }
            }
        });

      toast({
        title: "House Updated",
        description: `${user.name} has been assigned to a new house.`,
      });
    } catch (error: any) {
      console.error("Error updating house:", error);
      toast({
        title: "Update Failed",
        description: `Could not update the user's house. ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const selectValue = user.houseId || "unassigned";

  return (
    <Select
      value={selectValue}
      onValueChange={handleHouseChange}
      disabled={isUpdating || houses.length === 0}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder={houses.length > 0 ? "Select a house" : "Loading..."} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          Unassigned
        </SelectItem>
        {houses.map((house) => (
          <SelectItem key={house.id} value={house.id}>
            {house.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
