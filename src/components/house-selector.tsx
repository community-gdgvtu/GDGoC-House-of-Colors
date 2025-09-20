
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
import { collection, getDocs, doc, runTransaction, onSnapshot } from 'firebase/firestore';
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
    // Reverted to onSnapshot for real-time updates now that rules are correct.
    const unsubscribe = onSnapshot(collection(db, 'houses'), (snapshot) => {
        const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
        setHouses(housesData);
    }, (error) => {
        // This will now correctly fire if there's a permission issue.
        console.error("Failed to fetch houses:", error);
    });

    return () => unsubscribe();
  }, []);

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

            transaction.update(userRef, { houseId: newHouseId });

            // Decrement points from the old house, if it exists
            if (oldHouseId) {
                const oldHouseRef = doc(db, "houses", oldHouseId);
                transaction.update(oldHouseRef, { points: -userPoints });
            }

            // Increment points for the new house, if it exists
            if (newHouseId) {
                const newHouseRef = doc(db, "houses", newHouseId);
                transaction.update(newHouseRef, { points: userPoints });
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
