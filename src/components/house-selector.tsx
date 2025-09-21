
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
import { doc, collection, onSnapshot, increment, runTransaction, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

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

  const handleHouseChange = async (value: string) => {
    const newHouseId = value === UNASSIGN_VALUE ? "" : value;
    if (newHouseId === selectedHouse) return;

    setIsLoading(true);
    const oldHouseId = selectedHouse;

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.id);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }
            const userData = userDoc.data() as User;
            const userPoints = userData.points || 0;

            // Define refs for new and old houses
            const newHouseRef = newHouseId ? doc(db, "houses", newHouseId) : null;
            const oldHouseRef = oldHouseId ? doc(db, "houses", oldHouseId) : null;
            
            // Perform all reads first
            const oldHouseDoc = oldHouseRef ? await transaction.get(oldHouseRef) : null;

            // Perform all writes
            transaction.update(userRef, { houseId: newHouseId });

            // Decrement points from the old house only if it exists
            if (oldHouseDoc && oldHouseDoc.exists()) {
                transaction.update(oldHouseRef!, { points: increment(-userPoints) });
            }

            // Increment points for the new house
            if (newHouseRef) {
                transaction.update(newHouseRef, { points: increment(userPoints) });
            }
        });

        const updatedUserDoc = await getDoc(doc(db, "users", user.id));
        if (updatedUserDoc.exists() && onUpdate) {
            onUpdate([updatedUserDoc.data() as User]);
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
