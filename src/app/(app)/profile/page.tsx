
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="This is a placeholder for the user's profile page."
      />
      <Card>
        <CardContent className="p-6">
          <p>User profile information will be displayed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
