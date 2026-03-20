import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBookingSchema = z.object({
  interviewerId: z.string(),
  slotId: z.string(),
  scheduledAt: z.string(),
  interviewType: z.enum(["mock", "screening", "domain"]).default("mock"),
  focusTopic: z.string().optional(),
  timezone: z.string().default("UTC"),
});

function generateMeetLink() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where =
    session.user.role === "candidate"
      ? { candidateId: session.user.id, ...(status ? { status } : {}) }
      : { interviewerId: session.user.id, ...(status ? { status } : {}) };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      candidate: { select: { id: true, name: true, image: true, candidateProfile: true } },
      interviewer: { select: { id: true, name: true, image: true, interviewerProfile: true } },
      slot: true,
      session: true,
      feedback: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "candidate") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = createBookingSchema.parse(body);

  const slot = await prisma.availabilitySlot.findUnique({ where: { id: data.slotId } });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

  const interviewer = await prisma.interviewerProfile.findFirst({
    where: { userId: data.interviewerId },
  });
  if (!interviewer) return NextResponse.json({ error: "Interviewer not found" }, { status: 404 });

  const meetLink = generateMeetLink();

  const booking = await prisma.booking.create({
    data: {
      candidateId: session.user.id,
      interviewerId: data.interviewerId,
      slotId: data.slotId,
      scheduledAt: new Date(data.scheduledAt),
      durationMins: slot.durationMins,
      interviewType: data.interviewType,
      focusTopic: data.focusTopic ?? null,
      timezone: data.timezone,
      meetLink,
      amount: interviewer.hourlyRate,
      platformFee: interviewer.hourlyRate * 0.2,
      interviewerPayout: interviewer.hourlyRate * 0.8,
      status: "confirmed",
    },
    include: {
      candidate: { select: { name: true, email: true } },
      interviewer: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
