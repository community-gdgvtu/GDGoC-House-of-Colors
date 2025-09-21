
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon } from "lucide-react";
import { bulkCreateUsers } from "@/ai/flows/create-users-flow";
import type { BulkCreateUsersOutput } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function BulkAddUsersDialog() {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkCreateUsersOutput | null>(null);
  const { toast } = useToast();

  const handleBulkAdd = async () => {
    const emailList = emails.split('\n').map(e => e.trim()).filter(e => e);
    if (emailList.length === 0) {
      toast({
        title: "No Emails Provided",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await bulkCreateUsers(emailList);
      setResult(response);
      toast({
        title: "Bulk Add Complete",
        description: `${response.successCount} users created. ${response.failedCount} failed.`,
      });
    } catch (error: any) {
      console.error("Error bulk adding users:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Failed to add users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setEmails("");
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setResult(null);
    setEmails("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>
          <UsersIcon className="mr-2 h-4 w-4" />
          Bulk Add Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Bulk Add Users</DialogTitle>
          <DialogDescription>
            Enter a list of emails, one per line. A random password will be
            generated for each user, which they can reset using the 'Forgot
            Password' link on the login page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="emails">Emails</Label>
            <Textarea
              id="emails"
              placeholder="user1@example.com
user2@example.com
user3@example.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="min-h-[120px]"
              disabled={loading}
            />
          </div>
        </div>

        {result && (
          <Alert variant={result.failedCount > 0 ? "destructive" : "default"} className="bg-muted">
            {result.failedCount > 0 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertTitle>
              {result.failedCount > 0 ? "Process Complete with Errors" : "Process Complete"}
            </AlertTitle>
            <AlertDescription>
              <p>Successfully created: {result.successCount} user(s)</p>
              <p>Failed to create: {result.failedCount} user(s)</p>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Close
          </Button>
          <Button onClick={handleBulkAdd} disabled={loading || !emails}>
            {loading ? "Creating Users..." : "Add Users"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
