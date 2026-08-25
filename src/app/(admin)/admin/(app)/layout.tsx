import { AdminSidebar } from "@/components/admin/sidebar";
import { logoutAction } from "@/server/auth/actions";
import { verifySession } from "@/server/auth/dal";

export default async function AdminAppLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await verifySession();

  return (
    <div className="bg-admin-canvas flex h-screen overflow-hidden">
      <AdminSidebar username={session.username} logoutAction={logoutAction} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
