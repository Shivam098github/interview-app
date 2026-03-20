import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const minRating = parseFloat(searchParams.get("minRating") ?? "0");
  const maxRate = parseFloat(searchParams.get("maxRate") ?? "9999");
  const search = searchParams.get("search") ?? "";
  const featured = searchParams.get("featured") === "true";

  const interviewers = await prisma.user.findMany({
    where: {
      role: "interviewer",
      interviewerProfile: {
        isNot: undefined,
        ...(domain ? { domains: { contains: domain } } : {}),
        ratingAvg: { gte: minRating },
        hourlyRate: { lte: maxRate },
        ...(featured ? { isFeatured: true } : {}),
      },
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { interviewerProfile: { company: { contains: search } } },
              { interviewerProfile: { jobTitle: { contains: search } } },
            ],
          }
        : {}),
    },
    include: {
      interviewerProfile: {
        include: { availability: { where: { isActive: true } } },
      },
    },
    orderBy: [
      { interviewerProfile: { isFeatured: "desc" } },
      { interviewerProfile: { ratingAvg: "desc" } },
    ],
    take: 50,
  });

  return NextResponse.json(interviewers);
}
