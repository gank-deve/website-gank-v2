import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { signOut } from "@/lib/actions/auth";
import { SidebarNav } from "@/components/internal/sidebar";
import { ThemeToggle } from "@/components/internal/theme-toggle";
import { SetupNotice } from "@/components/internal/setup-notice";
import { LogOut, Wrench } from "lucide-react";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <SetupNotice />
      </div>
    );
  }

  const user = await requireUser();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border-subtle bg-surface p-5 lg:flex">
        <a href="/internal" className="font-heading text-2xl font-bold tracking-tight">
          GANK<span className="text-accent">.</span>
        </a>
        <p className="mt-1 mb-8 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Sistem Internal
        </p>

        <SidebarNav isAdmin={user.role === "admin"} />

        <div className="mt-auto space-y-3 border-t border-border-subtle pt-4">
          <div>
            <p className="truncate text-sm font-medium">{user.fullName || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role} · {user.email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger transition-colors duration-200 hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="font-heading flex items-center gap-2 text-lg font-bold lg:hidden">
              <Wrench className="h-5 w-5 text-accent" />
              GANK<span className="text-accent">.</span>
            </p>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <form action={signOut}>
                <button
                  type="submit"
                  aria-label="Keluar"
                  title="Keluar"
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-subtle text-muted-foreground transition-colors duration-200 hover:bg-danger/10 hover:text-danger lg:hidden"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
          {/* Nav mobile */}
          <div className="border-t border-border-subtle px-4 py-2 lg:hidden">
            <SidebarNav isAdmin={user.role === "admin"} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
