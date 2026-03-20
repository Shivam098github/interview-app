"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Video,
  Star,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

export default function CandidateDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => { setBookings(d); setLoading(false); });
  }, []);

  const upcoming = bookings.filter((b) => ["confirmed", "pending"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "completed");
  const avgRating = completed.length
    ? completed.reduce((s, b) => s + (b.feedback?.problemSolving ?? 0), 0) / completed.length
    : 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Track your interview preparation journey</p>
        </div>
        <Link href="/browse">
          <Button className="gap-2">Book Interview <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-blue-600" },
          { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-green-600" },
          { label: "Avg Score", value: avgRating ? avgRating.toFixed(1) : "—", icon: Star, color: "text-yellow-500" },
          { label: "Total Spent", value: `$${bookings.reduce((s, b) => s + (b.status === "completed" ? b.amount : 0), 0)}`, icon: TrendingUp, color: "text-indigo-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past Sessions ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-white border animate-pulse" />
            ))
          ) : upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No upcoming interviews</p>
                <Link href="/browse" className="mt-3 inline-block">
                  <Button size="sm">Browse Interviewers</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((booking) => (
              <BookingCard key={booking.id} booking={booking} role="candidate" />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No completed sessions yet</p>
              </CardContent>
            </Card>
          ) : (
            completed.map((booking) => (
              <BookingCard key={booking.id} booking={booking} role="candidate" showFeedback />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingCard({
  booking,
  role,
  showFeedback = false,
}: {
  booking: any;
  role: "candidate" | "interviewer";
  showFeedback?: boolean;
}) {
  const other = role === "candidate" ? booking.interviewer : booking.candidate;
  const profile = role === "candidate" ? booking.interviewer?.interviewerProfile : booking.candidate?.candidateProfile;
  const scheduledAt = new Date(booking.scheduledAt);

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={other?.image ?? ""} />
            <AvatarFallback>{other?.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{other?.name}</span>
              <Badge variant={STATUS_COLORS[booking.status] as any} className="capitalize text-xs">
                {booking.status}
              </Badge>
              <Badge variant="outline" className="capitalize text-xs">{booking.interviewType}</Badge>
            </div>
            {role === "candidate" && (
              <p className="text-xs text-gray-500">{profile?.jobTitle} @ {profile?.company}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(scheduledAt, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(scheduledAt, "h:mm a")}
              </span>
              <span>{booking.durationMins} min</span>
            </div>
            {booking.focusTopic && (
              <p className="text-xs text-indigo-600 mt-1">Focus: {booking.focusTopic}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-bold text-indigo-600">${booking.amount}</span>
            {booking.status === "confirmed" && (
              <div className="flex gap-2">
                <a href={booking.meetLink} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1"><Video className="h-3 w-3" />Join</Button>
                </a>
                <Link href={`/session/${booking.id}`}>
                  <Button size="sm" variant="outline">Details</Button>
                </Link>
              </div>
            )}
            {showFeedback && booking.feedback && (
              <Link href={`/feedback/${booking.id}`}>
                <Button size="sm" variant="secondary">View Feedback</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
