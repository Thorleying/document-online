"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard, exact: true },
  { href: "/admin/documents", label: "文档管理", icon: FileText, exact: false },
  { href: "/admin/stats", label: "数据统计", icon: BarChart3, exact: false },
];

type AdminSidebarProps = {
  username: string;
  logoutAction: () => Promise<void>;
};

function SidebarBrand() {
  return (
    <Link href="/admin" className="block">
      <span className="text-foreground text-lg font-semibold tracking-tight">
        DocShare
      </span>
      <span className="text-muted-foreground mt-0.5 block text-xs">
        管理后台
      </span>
    </Link>
  );
}

function SidebarContent({
  username,
  logoutAction,
  pathname,
  onNavigate,
}: AdminSidebarProps & { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
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
            className="text-muted-foreground hover:text-accent flex min-h-9 cursor-pointer items-center gap-2 text-sm transition-colors duration-200"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            退出登录
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminSidebar({ username, logoutAction }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* 移动端顶栏：lg 以下显示，汉堡按钮唤出抽屉 */}
      <header className="border-sidebar-border bg-sidebar flex shrink-0 items-center justify-between border-b px-4 py-2.5 lg:hidden">
        <SidebarBrand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="打开导航菜单"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>

      {/* 抽屉遮罩 */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* 移动端抽屉 */}
      <aside
        id="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="后台导航"
        inert={!open}
        className={cn(
          "border-sidebar-border bg-sidebar fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-sidebar-border flex items-center justify-between border-b px-5 py-4">
          <SidebarBrand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭导航菜单"
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <SidebarContent
          username={username}
          logoutAction={logoutAction}
          pathname={pathname}
          onNavigate={() => setOpen(false)}
        />
      </aside>

      {/* 桌面端固定侧栏 */}
      <aside className="border-sidebar-border bg-sidebar hidden h-full w-60 shrink-0 flex-col border-r lg:flex">
        <div className="border-sidebar-border border-b px-5 py-5">
          <SidebarBrand />
        </div>
        <SidebarContent
          username={username}
          logoutAction={logoutAction}
          pathname={pathname}
        />
      </aside>
    </>
  );
}
