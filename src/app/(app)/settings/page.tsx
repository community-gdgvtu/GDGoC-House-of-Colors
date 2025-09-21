
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="This is a placeholder for the user's settings page."
      />
      <Card>
        <CardContent className="p-6">
          <p>User settings and preferences will be configured here.</p>
        </CardContent>
      </Card>
    </>
  );
}
