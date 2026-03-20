import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const slotSchema = z.object({
  weekday: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  durationMins: z.number().default(60),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const interviewerId = searchParams.get("interviewerId") ?? session.user.id;

  const profile = await prisma.interviewerProfile.findFirst({
    where: { userId: interviewerId },
    include: { availability: { orderBy: [{ weekday: "asc" }, { startTime: "asc" }] } },
  });

  return NextResponse.json(profile?.availability ?? []);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "interviewer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = slotSchema.parse(body);

  const profile = await prisma.interviewerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const slot = await prisma.availabilitySlot.create({
    data: { ...data, interviewerId: profile.id },
  });

  return NextResponse.json(slot, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "interviewer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slotId = searchParams.get("id");
  if (!slotId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.availabilitySlot.deleteMany({
    where: {
      id: slotId,
      interviewer: { userId: session.user.id },
    },
  });

  return NextResponse.json({ success: true });
}
