
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Award } from "lucide-react";
import { bulkManagePoints } from "@/ai/flows/bulk-manage-points-flow";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { type BulkManagePointsOutput } from "@/lib/types";
import { type User } from "@/lib/data";

interface BulkManagePointsDialogProps {
    onUpdate: (updatedUsers: User[]) => void;
}

export function BulkManagePointsDialog({ onUpdate }: BulkManagePointsDialogProps) {
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState("");
  const [points, setPoints] = useState(0);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkManagePointsOutput | null>(null);
  const { toast } = useToast();

  const handleBulkManage = async (mode: 'add' | 'deduct') => {
    const pointsToApply = mode === 'add' ? points : -points;
    if (points <= 0) {
      toast({ title: "Invalid Points", description: "Please enter a positive number of points.", variant: "destructive" });
      return;
    }
    if (!ids.trim()) {
      toast({ title: "No User IDs", description: "Please provide at least one user ID.", variant: "destructive" });
      return;
    }
     if (!remark.trim()) {
      toast({ title: "Remark Required", description: "Please provide a reason for this bulk update.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await bulkManagePoints({ userCustomIds: ids, points: pointsToApply, remark });
      setResult(res);
      onUpdate(res.updatedUsers);
      toast({
        title: "Bulk Update Complete",
        description: `${res.successful.length} users updated. See dialog for details.`,
      });
    } catch (error: any) {
      toast({ title: "An Error Occurred", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setTimeout(() => {
        setIds("");
        setPoints(0);
        setRemark("");
        setResult(null);
        setLoading(false);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Award className="mr-2 h-4 w-4" />
          Bulk Manage Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Manage Points</DialogTitle>
          <DialogDescription>
            Award or deduct points for multiple users at once. Enter user IDs (e.g., GOOGE001), one per line.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="GOOGE001
GOOGE002
GOOGE003"
            value={ids}
            onChange={(e) => setIds(e.target.value)}
            rows={8}
            disabled={loading || !!result}
          />
          <div className="space-y-2">
            <Label htmlFor="points">Points to Add or Deduct</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(Math.abs(parseInt(e.target.value, 10)) || 0)}
              disabled={loading || !!result}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="remark">Remark for this action</Label>
            <Input
              id="remark"
              type="text"
              placeholder="e.g., 'Quiz competition winners'"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={loading || !!result}
            />
          </div>
          {result && (
            <Alert variant={result.failed.length > 0 ? "destructive" : "default"}>
              <AlertTitle>Processing Complete</AlertTitle>
              <AlertDescription className="max-h-32 overflow-y-auto">
                <p>{result.successful.length} users updated successfully.</p>
                {result.failed.length > 0 && (
                   <div className="mt-2">
                     <p className="font-bold">{result.failed.length} users failed:</p>
                     <ul className="list-disc pl-5 text-xs">
                        {result.failed.map(f => <li key={f.customId}>{f.customId}: {f.reason}</li>)}
                     </ul>
                   </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          {result ? (
            <Button onClick={closeDialog} className="w-full">Close</Button>
          ) : (
            <>
                <Button onClick={() => handleBulkManage('add')} disabled={loading} className="w-full">
                    {loading ? "Processing..." : `Add ${points} Points`}
                </Button>
                <Button onClick={() => handleBulkManage('deduct')} variant="destructive" disabled={loading} className="w-full">
                    {loading ? "Processing..." : `Deduct ${points} Points`}
                </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
