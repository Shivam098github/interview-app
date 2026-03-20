import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, name: true, image: true, email: true, candidateProfile: true } },
      interviewer: { select: { id: true, name: true, image: true, email: true, interviewerProfile: true } },
      slot: true,
      session: true,
      feedback: true,
      ratings: true,
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    booking.candidateId === session.user.id || booking.interviewerId === session.user.id;
  if (!isParticipant && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(booking);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant =
    booking.candidateId === session.user.id || booking.interviewerId === session.user.id;
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: body.status,
      ...(body.status === "cancelled"
        ? { cancelledAt: new Date(), cancelledBy: session.user.id }
        : {}),
    },
  });

  return NextResponse.json(updated);
}
