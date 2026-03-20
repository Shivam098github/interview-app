"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Star, Users, Video, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";

export default function InterviewerDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => { setBookings(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const upcoming = bookings.filter((b) => ["confirmed", "pending"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "completed");
  const totalEarnings = completed.reduce((s, b) => s + b.interviewerPayout, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interviewer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your sessions and availability</p>
        </div>
        <Link href="/dashboard/interviewer/availability">
          <Button variant="outline" className="gap-2">Set Availability <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-blue-600" },
          { label: "Completed", value: completed.length, icon: Users, color: "text-green-600" },
          { label: "Earnings", value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-emerald-600" },
          { label: "This Month", value: `$${completed.filter(b => new Date(b.scheduledAt).getMonth() === new Date().getMonth()).reduce((s: number, b: any) => s + b.interviewerPayout, 0).toFixed(0)}`, icon: Star, color: "text-yellow-500" },
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

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/dashboard/interviewer/availability", label: "Manage Availability", desc: "Set your weekly schedule", icon: Calendar },
          { href: "/dashboard/interviewer/sessions", label: "All Sessions", desc: "View session history", icon: Users },
          { href: "/dashboard/interviewer/earnings", label: "Earnings", desc: "Track your income", icon: DollarSign },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="pt-5">
                <link.icon className="h-6 w-6 text-indigo-600 mb-2" />
                <p className="font-semibold text-sm">{link.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-white border animate-pulse" />
            ))
          ) : upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No upcoming sessions</p>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((booking) => (
              <InterviewerBookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {completed.map((booking) => (
            <InterviewerBookingCard key={booking.id} booking={booking} showFeedbackBtn />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InterviewerBookingCard({ booking, showFeedbackBtn = false }: { booking: any; showFeedbackBtn?: boolean }) {
  const candidate = booking.candidate;
  const scheduledAt = new Date(booking.scheduledAt);

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={candidate?.image ?? ""} />
            <AvatarFallback>{candidate?.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{candidate?.name}</span>
              <Badge variant="secondary" className="capitalize text-xs">{booking.status}</Badge>
              <Badge variant="outline" className="capitalize text-xs">{booking.interviewType}</Badge>
            </div>
            <p className="text-xs text-gray-500">{candidate?.candidateProfile?.targetRole}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(scheduledAt, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(scheduledAt, "h:mm a")}
              </span>
            </div>
            {booking.focusTopic && (
              <p className="text-xs text-indigo-600 mt-1">Focus: {booking.focusTopic}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-bold text-emerald-600">+${booking.interviewerPayout}</span>
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
            {showFeedbackBtn && !booking.feedback && (
              <Link href={`/feedback/${booking.id}`}>
                <Button size="sm" variant="outline">Give Feedback</Button>
              </Link>
            )}
            {showFeedbackBtn && booking.feedback && (
              <Badge variant="success">Feedback Given</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
