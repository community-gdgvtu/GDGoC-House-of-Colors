
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
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { House, User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface HouseSelectorProps {
  user: User;
}

export function HouseSelector({ user }: HouseSelectorProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'houses'), (snapshot) => {
      const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as House));
      setHouses(housesData);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleHouseChange = async (newHouseId: string) => {
    if (newHouseId === user.houseId) return;

    setIsUpdating(true);
    const userRef = doc(db, "users", user.id);
    try {
      await updateDoc(userRef, { houseId: newHouseId });
      toast({
        title: "House Updated",
        description: `${user.name} has been assigned to a new house.`,
      });
    } catch (error) {
      console.error("Error updating house:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the user's house. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="text-xs text-muted-foreground">Loading...</div>;
  }

  return (
    <Select
      value={user.houseId || ""}
      onValueChange={handleHouseChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Select a house" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">
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
