import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, LifeBuoy, LogOut, User } from "lucide-react";
import { NeuroCalmIcon } from "@/components/icons";
import { UserNav } from "@/components/dashboard/user-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold font-headline"
          >
            <NeuroCalmIcon className="h-6 w-6 text-primary" />
            <span>NeuroCalm</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="grid items-start px-4 text-sm font-medium space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/support"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
            >
              <LifeBuoy className="h-4 w-4" />
              Support
            </Link>
          </div>
        </nav>
        <div className="mt-auto p-4">
          {/* In a real app, this would show user info */}
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b bg-background px-6">
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}