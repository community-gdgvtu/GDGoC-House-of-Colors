
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type User } from "@/lib/data";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, addDoc, serverTimestamp, increment, getDoc } from "firebase/firestore";
import { PlusCircle, MinusCircle } from "lucide-react";

interface ManagePointsDialogProps {
  user: User;
  mode: 'add' | 'deduct';
}

export function ManagePointsDialog({ user, mode }: ManagePointsDialogProps) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isAddMode = mode === 'add';

  const handleManagePoints = async () => {
    if (points <= 0) {
      toast({
        title: "Invalid Points",
        description: "Please enter a positive number for points.",
        variant: "destructive",
      });
      return;
    }
    if (!remark) {
      toast({
        title: "Remark Required",
        description: `Please provide a reason for ${isAddMode ? 'awarding' : 'deducting'} points.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const userRef = doc(db, "users", user.id);
      const pointHistoryRef = collection(db, "users", user.id, "point_history");

      // Check current points if deducting
      if (!isAddMode) {
        const userDoc = await getDoc(userRef);
        const currentPoints = userDoc.data()?.points || 0;
        if (currentPoints < points) {
           toast({
            title: "Insufficient Points",
            description: `Cannot deduct ${points} points. User only has ${currentPoints}. User points will be set to 0.`,
            variant: "destructive",
          });
        }
      }

      const newPoints = isAddMode ? increment(points) : increment(-Math.min(user.points, points));
      const pointsToLog = isAddMode ? points : -Math.min(user.points, points);


      await updateDoc(userRef, {
        points: newPoints,
      });

      await addDoc(pointHistoryRef, {
        pointsAdded: pointsToLog,
        remark: remark,
        timestamp: serverTimestamp(),
      });

      toast({
        title: `Points ${isAddMode ? 'Awarded' : 'Deducted'}!`,
        description: `${Math.abs(pointsToLog)} points have been successfully ${isAddMode ? 'awarded to' : 'deducted from'} ${user.name}.`,
      });
      
      setPoints(0);
      setRemark("");
      setOpen(false);
    } catch (error: any) {
      console.error(`Error ${isAddMode ? 'awarding' : 'deducting'} points:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isAddMode ? 'award' : 'deduct'} points. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={isAddMode ? "outline" : "destructive"}>
          {isAddMode ? <PlusCircle className="mr-2 h-4 w-4" /> : <MinusCircle className="mr-2 h-4 w-4" />}
          {isAddMode ? 'Add Points' : 'Deduct Points'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAddMode ? 'Add' : 'Deduct'} Points for {user.name}</DialogTitle>
          <DialogDescription>
            {isAddMode ? 'Award points for participation, wins, or other contributions.' : 'Deduct points for penalties or corrections. Points cannot go below zero.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="points" className="text-right">
              Points
            </Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(Math.abs(parseInt(e.target.value, 10)) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remark" className="text-right">
              Remark
            </Label>
            <Textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="col-span-3"
              placeholder={isAddMode ? "e.g., 'Won the Flutter quiz'" : "e.g., 'Violation of rules'"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleManagePoints} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
