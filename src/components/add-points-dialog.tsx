
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
import { doc, updateDoc, collection, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { PlusCircle } from "lucide-react";

interface AddPointsDialogProps {
  user: User;
}

export function AddPointsDialog({ user }: AddPointsDialogProps) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddPoints = async () => {
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
        description: "Please provide a reason for awarding points.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.id);
      const pointHistoryRef = collection(db, "users", user.id, "point_history");

      // Update user's points
      await updateDoc(userRef, {
        points: increment(points),
      });

      // Add a record to the point history
      await addDoc(pointHistoryRef, {
        pointsAdded: points,
        remark: remark,
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Points Awarded!",
        description: `${points} points have been successfully awarded to ${user.name}.`,
      });
      
      setPoints(0);
      setRemark("");
      setOpen(false);
    } catch (error: any) {
      console.error("Error awarding points:", error);
      toast({
        title: "Error",
        description: "Failed to award points. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Points to {user.name}</DialogTitle>
          <DialogDescription>
            Award points for participation, wins, or other contributions.
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
              onChange={(e) => setPoints(parseInt(e.target.value, 10))}
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
              placeholder="e.g., 'Won the Flutter quiz'"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddPoints} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
