
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
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon } from "lucide-react";
import { bulkCreateUsers } from "@/ai/flows/create-users-flow";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { type BulkCreateUsersOutput } from "@/lib/types";

export function BulkAddUsersDialog() {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkCreateUsersOutput | null>(null);
  const { toast } = useToast();

  const handleBulkAdd = async () => {
    if (!emails.trim()) {
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
      const res = await bulkCreateUsers({ emails });
      setResult(res);
      toast({
        title: "Bulk Add Complete",
        description: `${res.successful.length} users created. See dialog for details.`,
      });
    } catch (error: any) {
      toast({
        title: "An Error Occurred",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setOpen(false);
    // Reset state after a short delay to allow dialog to close
    setTimeout(() => {
        setEmails("");
        setResult(null);
        setLoading(false);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UsersIcon className="mr-2" />
          Bulk Add Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Add Users</DialogTitle>
          <DialogDescription>
            Enter a list of emails, one per line. A random password will be
            generated for each. Users can reset their password using the "Forgot
            Password" link on the login page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="user1@example.com
user2@example.com
user3@example.com"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={10}
            disabled={loading || !!result}
          />
          {result && (
            <Alert variant={result.failed.length > 0 ? "destructive" : "default"}>
              <AlertTitle>
                Processing Complete
              </AlertTitle>
              <AlertDescription>
                <p>{result.successful.length} users created successfully.</p>
                {result.failed.length > 0 && (
                   <div className="mt-2">
                     <p className="font-bold">{result.failed.length} users failed:</p>
                     <ul className="list-disc pl-5 text-xs">
                        {result.failed.map(f => <li key={f.email}>{f.email}: {f.reason}</li>)}
                     </ul>
                   </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          {result ? (
            <Button onClick={closeDialog}>Close</Button>
          ) : (
            <Button onClick={handleBulkAdd} disabled={loading}>
              {loading ? "Creating Users..." : "Create Users"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
