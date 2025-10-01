
import { PageHeader } from "@/components/page-header";
import { AdminUsersClient } from "@/components/admin-users-client";

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="User Management"
        description="View, filter, sort, and manage all users in the system."
      />
      <AdminUsersClient initialUsers={[]} />
    </>
  );
}
