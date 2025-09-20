
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
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import type { House, User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface HouseSelectorProps {
  user: User;
}

export function HouseSelector({ user }: HouseSelectorProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        setLoading(true);
        setError(null);
        const querySnapshot = await getDocs(collection(db, 'houses'));
        if (querySnapshot.empty) {
            setError("No houses found in database.");
        } else {
            const housesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
            setHouses(housesData);
        }
      } catch (e: any) {
        console.error("Failed to fetch houses:", e);
        setError("Failed to load houses.");
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
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

            if (oldHouseId) {
                const oldHouseRef = doc(db, "houses", oldHouseId);
                const oldHouseDoc = await transaction.get(oldHouseRef);
                if (oldHouseDoc.exists()) {
                    const currentPoints = oldHouseDoc.data().points || 0;
                    transaction.update(oldHouseRef, { points: currentPoints - userPoints });
                }
            }

            if (newHouseId) {
                const newHouseRef = doc(db, "houses", newHouseId);
                const newHouseDoc = await transaction.get(newHouseRef);
                 if (newHouseDoc.exists()) {
                    const currentPoints = newHouseDoc.data().points || 0;
                    transaction.update(newHouseRef, { points: currentPoints + userPoints });
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

  if (loading || error) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={loading ? "Loading houses..." : error} />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={selectValue}
      onValueChange={handleHouseChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Select a house" />
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
