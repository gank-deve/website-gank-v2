"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Package,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/internal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/internal/servis", label: "Order Servis", icon: Wrench },
  { href: "/internal/stok", label: "Stok HP", icon: Package, adminOnly: true },
  { href: "/internal/pengaturan", label: "Pengaturan", icon: Settings, adminOnly: true },
];

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = navItems.filter((i) => !i.adminOnly || isAdmin);

  return (
    <nav className="flex gap-1 lg:flex-col">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              active
                ? "bg-accent-soft text-accent"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-surface-muted hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        Situs Publik
      </a>
    </nav>
  );
}
