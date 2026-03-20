"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

// Sample payout data (payments not wired in MVP)
const SAMPLE_PAYOUTS = [
  { id: "1", amount: 160, status: "paid", periodStart: "2026-03-01", periodEnd: "2026-03-07", paidAt: "2026-03-09" },
  { id: "2", amount: 200, status: "paid", periodStart: "2026-03-08", periodEnd: "2026-03-14", paidAt: "2026-03-16" },
  { id: "3", amount: 120, status: "pending", periodStart: "2026-03-15", periodEnd: "2026-03-21", paidAt: null },
];

export default function EarningsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings?status=completed")
      .then((r) => r.json())
      .then((d) => { setBookings(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const totalEarnings = bookings.reduce((s, b) => s + b.interviewerPayout, 0);
  const thisMonth = bookings
    .filter((b) => new Date(b.scheduledAt).getMonth() === new Date().getMonth())
    .reduce((s, b) => s + b.interviewerPayout, 0);
  const pendingPayout = SAMPLE_PAYOUTS.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-gray-500 mt-1">Track your interview income</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Earned", value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-emerald-600" },
          { label: "This Month", value: `$${thisMonth.toFixed(0)}`, icon: TrendingUp, color: "text-blue-600" },
          { label: "Pending Payout", value: `$${pendingPayout}`, icon: Clock, color: "text-yellow-500" },
          { label: "Sessions Done", value: bookings.length, icon: CheckCircle, color: "text-green-600" },
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

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Session Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 rounded bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No earnings yet. Complete sessions to see earnings.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{b.candidate?.name}</p>
                        <p className="text-xs text-gray-500">{format(new Date(b.scheduledAt), "MMM d, yyyy")} · {b.interviewType} · {b.durationMins}min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">+${b.interviewerPayout.toFixed(0)}</p>
                        <p className="text-xs text-gray-400">(after 20% fee)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
                Payouts are processed weekly every Monday via Stripe. Bank details can be added in Settings.
              </div>
              <div className="divide-y divide-gray-50">
                {SAMPLE_PAYOUTS.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(p.periodStart), "MMM d")} – {format(new Date(p.periodEnd), "MMM d, yyyy")}
                      </p>
                      {p.paidAt && (
                        <p className="text-xs text-gray-400">Paid on {format(new Date(p.paidAt), "MMM d")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${p.amount}</span>
                      <Badge variant={p.status === "paid" ? "success" : "warning"} className="capitalize">
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
