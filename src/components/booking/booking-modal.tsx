"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { WEEKDAYS } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Props {
  interviewer: any;
  profile: any;
  slots: any[];
}

export default function BookingModal({ interviewer, profile, slots }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [date, setDate] = useState("");
  const [interviewType, setInterviewType] = useState("mock");
  const [focusTopic, setFocusTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get today's date string for min date
  const today = new Date().toISOString().split("T")[0];

  async function handleBook() {
    if (!selectedSlot || !date) {
      toast.error("Please select a slot and date");
      return;
    }

    const slot = slots.find((s) => s.id === selectedSlot);
    if (!slot) return;

    // Build datetime from date + slot startTime
    const scheduledAt = new Date(`${date}T${slot.startTime}:00`).toISOString();

    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewerId: interviewer.id,
        slotId: selectedSlot,
        scheduledAt,
        interviewType,
        focusTopic: focusTopic || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(json.error ?? "Booking failed");
      return;
    }

    toast.success("Interview booked! Check your dashboard.");
    setOpen(false);
    router.push("/dashboard/candidate");
  }

  const selectedSlotData = slots.find((s) => s.id === selectedSlot);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">Book Interview</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book with {interviewer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Slot picker */}
          <div>
            <Label>Select Availability Slot</Label>
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a slot" />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {WEEKDAYS[slot.weekday]} — {slot.startTime} to {slot.endTime} ({slot.durationMins} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date picker */}
          <div>
            <Label>Select Date</Label>
            <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
          </div>

          {/* Interview type */}
          <div>
            <Label>Interview Type</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mock">Mock Interview</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="domain">Domain Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Focus topic */}
          <div>
            <Label>Focus Topic (optional)</Label>
            <Input
              placeholder="e.g., Dynamic Programming, System Design basics..."
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Summary */}
          {selectedSlotData && date && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-sm">
              <div className="flex items-center gap-2 text-indigo-700 mb-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-700">
                <Clock className="h-4 w-4" />
                <span>{selectedSlotData.startTime} — {selectedSlotData.endTime}</span>
              </div>
              <div className="mt-2 font-bold text-indigo-800">
                Total: ${profile.hourlyRate}
                <span className="font-normal text-xs text-indigo-500 ml-1">(payment at confirmation)</span>
              </div>
            </div>
          )}

          <Button className="w-full" onClick={handleBook} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
