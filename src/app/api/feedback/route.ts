import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const feedbackSchema = z.object({
  bookingId: z.string(),
  problemSolving: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  codeQuality: z.number().min(1).max(5),
  systemDesign: z.number().min(1).max(5),
  writtenFeedback: z.string().optional(),
  hireSignal: z.enum(["strong_yes", "yes", "maybe", "no", "strong_no"]),
});

const ratingSchema = z.object({
  bookingId: z.string(),
  toUserId: z.string(),
  stars: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.type === "feedback" && session.user.role === "interviewer") {
    const data = feedbackSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { interviewer: true },
    });
    if (!booking || booking.interviewerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const shareToken = randomBytes(16).toString("hex");

    const feedback = await prisma.feedback.upsert({
      where: { bookingId: data.bookingId },
      create: {
        bookingId: data.bookingId,
        interviewerId: session.user.id,
        candidateId: booking.candidateId,
        problemSolving: data.problemSolving,
        communication: data.communication,
        codeQuality: data.codeQuality,
        systemDesign: data.systemDesign,
        writtenFeedback: data.writtenFeedback ?? null,
        hireSignal: data.hireSignal,
        shareToken,
      },
      update: {
        problemSolving: data.problemSolving,
        communication: data.communication,
        codeQuality: data.codeQuality,
        systemDesign: data.systemDesign,
        writtenFeedback: data.writtenFeedback ?? null,
        hireSignal: data.hireSignal,
      },
    });

    await prisma.booking.update({ where: { id: data.bookingId }, data: { status: "completed" } });

    return NextResponse.json(feedback, { status: 201 });
  }

  if (body.type === "rating") {
    const data = ratingSchema.parse(body);

    const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const isParticipant =
      booking.candidateId === session.user.id || booking.interviewerId === session.user.id;
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const rating = await prisma.rating.create({
      data: {
        bookingId: data.bookingId,
        fromUserId: session.user.id,
        toUserId: data.toUserId,
        stars: data.stars,
        comment: data.comment ?? null,
      },
    });

    // Recalculate avg rating for the recipient
    const allRatings = await prisma.rating.aggregate({
      where: { toUserId: data.toUserId },
      _avg: { stars: true },
      _count: { stars: true },
    });

    const profile = await prisma.interviewerProfile.findFirst({
      where: { userId: data.toUserId },
    });
    if (profile) {
      await prisma.interviewerProfile.update({
        where: { userId: data.toUserId },
        data: {
          ratingAvg: allRatings._avg.stars ?? 0,
          ratingCount: allRatings._count.stars,
        },
      });
    }

    return NextResponse.json(rating, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
