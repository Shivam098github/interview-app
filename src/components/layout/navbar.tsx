"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-lg text-gray-900">InterviewHub</span>
            </Link>
            {session && (
              <div className="hidden md:flex items-center gap-6">
                {session.user.role === "candidate" && (
                  <>
                    <Link href="/browse" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Browse</Link>
                    <Link href="/dashboard/candidate" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
                    <Link href="/blog" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Resources</Link>
                  </>
                )}
                {session.user.role === "interviewer" && (
                  <>
                    <Link href="/dashboard/interviewer" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
                    <Link href="/dashboard/interviewer/availability" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Availability</Link>
                    <Link href="/dashboard/interviewer/sessions" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Sessions</Link>
                    <Link href="/dashboard/interviewer/earnings" className="text-sm text-gray-600 hover:text-indigo-600 font-medium">Earnings</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!session ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image ?? ""} />
                      <AvatarFallback>{session.user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                    <Badge variant="secondary" className="mt-1 text-xs capitalize">{session.user.role}</Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session.user.id}`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600 flex items-center gap-2">
                    <LogOut className="h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
