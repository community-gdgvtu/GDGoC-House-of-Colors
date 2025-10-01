
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
import { doc, collection, serverTimestamp, increment, runTransaction, getDoc } from "firebase/firestore";
import { PlusCircle, MinusCircle } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

interface ManagePointsDialogProps {
  user: User;
  awardingUser: User;
  mode: 'add' | 'deduct';
  onUpdate?: (updatedUsers: User[]) => void;
}

export function ManagePointsDialog({ user, awardingUser, mode, onUpdate }: ManagePointsDialogProps) {
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
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.id);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }
            
            const currentPoints = userDoc.data().points || 0;
            let pointsToLog = isAddMode ? points : -points;
            
            if (!isAddMode && currentPoints < points) {
                pointsToLog = -currentPoints;
            }
            
            const pointHistoryRef = doc(collection(db, "users", user.id, "point_history"));

            transaction.update(userRef, {
                points: increment(pointsToLog)
            });

            transaction.set(pointHistoryRef, {
                pointsAdded: pointsToLog,
                remark: remark,
                timestamp: serverTimestamp(),
                awardedById: awardingUser.id,
                awardedByName: awardingUser.name,
                awardedToId: user.id,
                awardedToName: user.name,
            });
        });

      const updatedUserDoc = await getDoc(doc(db, "users", user.id));
      if (updatedUserDoc.exists() && onUpdate) {
        onUpdate([updatedUserDoc.data() as User]);
      }

      toast({
        title: `Points ${isAddMode ? 'Awarded' : 'Deducted'}!`,
        description: `${Math.abs(points)} points have been successfully managed for ${user.name}.`,
      });
      
      setPoints(0);
      setRemark("");
      setOpen(false);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `/users/${user.id}`,
            operation: 'update',
            requestResourceData: { points: `increment(${isAddMode ? points : -points})` }
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
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
            {isAddMode ? 'Award points for participation, wins, or other contributions.' : 'Deduct points for penalties or corrections. Points will not go below zero.'}
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
