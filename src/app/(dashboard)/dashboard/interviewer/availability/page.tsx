"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { WEEKDAYS } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekday, setWeekday] = useState<string>("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [saving, setSaving] = useState(false);

  async function fetchSlots() {
    const res = await fetch("/api/availability");
    const data = await res.json();
    setSlots(data);
    setLoading(false);
  }

  useEffect(() => { fetchSlots(); }, []);

  async function addSlot() {
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekday: parseInt(weekday),
        startTime,
        endTime,
        durationMins: parseInt(duration),
      }),
    });
    if (res.ok) {
      toast.success("Slot added");
      fetchSlots();
    } else {
      toast.error("Failed to add slot");
    }
    setSaving(false);
  }

  async function deleteSlot(id: string) {
    const res = await fetch(`/api/availability?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Slot removed");
      setSlots((prev) => prev.filter((s) => s.id !== id));
    }
  }

  const slotsByDay = slots.reduce<Record<number, any[]>>((acc, slot) => {
    (acc[slot.weekday] = acc[slot.weekday] || []).push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Manage Availability</h1>
        <p className="text-gray-500 mt-1">Set your weekly interview slots</p>
      </div>

      {/* Add slot form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add New Slot</CardTitle>
          <CardDescription>Slots repeat weekly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Day</Label>
              <Select value={weekday} onValueChange={setWeekday}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day, i) => (
                    <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addSlot} disabled={saving} className="gap-2">
            <Plus className="h-4 w-4" />
            {saving ? "Adding..." : "Add Slot"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing slots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            Current Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No slots added yet</p>
          ) : (
            <div className="space-y-4">
              {WEEKDAYS.map((day, i) => {
                const daySlots = slotsByDay[i];
                if (!daySlots?.length) return null;
                return (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{day}</p>
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {slot.startTime} – {slot.endTime}
                            </Badge>
                            <span className="text-xs text-gray-400">{slot.durationMins} min</span>
                          </div>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
