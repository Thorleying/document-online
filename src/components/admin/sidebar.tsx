"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard, exact: true },
  { href: "/admin/documents", label: "文档管理", icon: FileText, exact: false },
];

type AdminSidebarProps = {
  username: string;
  logoutAction: () => Promise<void>;
};

export function AdminSidebar({ username, logoutAction }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-sidebar-border bg-sidebar flex h-full w-60 shrink-0 flex-col border-r">
      <div className="border-sidebar-border border-b px-5 py-5">
        <Link href="/admin" className="block">
          <span className="text-foreground text-lg font-semibold tracking-tight">
            DocShare
          </span>
          <span className="text-muted-foreground mt-0.5 block text-xs">
            管理后台
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-accent"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-sidebar-border border-t px-4 py-4">
        <p className="text-foreground truncate text-sm font-medium">
          {username}
        </p>
        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="text-muted-foreground hover:text-accent flex items-center gap-2 text-sm transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            退出登录
          </button>
        </form>
      </div>
    </aside>
  );
}
