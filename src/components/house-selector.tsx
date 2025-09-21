
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
import { doc, updateDoc, collection, onSnapshot, increment, runTransaction } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface HouseSelectorProps {
  user: User;
}

export function HouseSelector({ user }: HouseSelectorProps) {
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

  const handleHouseChange = async (newHouseId: string) => {
    if (newHouseId === selectedHouse) return;

    setIsLoading(true);
    const oldHouseId = selectedHouse;

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.id);
            const newHouseRef = newHouseId ? doc(db, "houses", newHouseId) : null;
            const oldHouseRef = oldHouseId ? doc(db, "houses", oldHouseId) : null;

            // 1. Perform all reads first.
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }
            const userPoints = userDoc.data().points || 0;

            // 2. Perform all writes.
            transaction.update(userRef, { houseId: newHouseId });

            if (oldHouseRef) {
                transaction.update(oldHouseRef, { points: increment(-userPoints) });
            }

            if (newHouseRef) {
                transaction.update(newHouseRef, { points: increment(userPoints) });
            }
        });

        setSelectedHouse(newHouseId);
        toast({
            title: "House Updated",
            description: `${user.name} has been moved to a new house.`,
        });

    } catch (error: any) {
        console.error("Error updating house:", error);
        toast({
            title: "Update Failed",
            description: `Could not change house. ${error.message}`,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Select
      value={selectedHouse}
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
         <SelectItem value="">Unassign</SelectItem>
      </SelectContent>
    </Select>
  );
}
