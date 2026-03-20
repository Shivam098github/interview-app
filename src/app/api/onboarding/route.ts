import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const interviewerSchema = z.object({
  role: z.literal("interviewer"),
  company: z.string().min(1),
  jobTitle: z.string().min(1),
  yearsExp: z.number().min(0).max(50),
  domains: z.array(z.string()).min(1),
  bio: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  hourlyRate: z.number().min(10).max(500),
  languages: z.array(z.string()).default(["English"]),
});

const candidateSchema = z.object({
  role: z.literal("candidate"),
  targetRole: z.string().min(1),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"]),
  domains: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.role === "interviewer") {
      const data = interviewerSchema.parse(body);
      const completeness = [data.company, data.jobTitle, data.bio, data.linkedinUrl].filter(Boolean).length;

      await prisma.interviewerProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          company: data.company,
          jobTitle: data.jobTitle,
          yearsExp: data.yearsExp,
          domains: JSON.stringify(data.domains),
          bio: data.bio ?? null,
          linkedinUrl: data.linkedinUrl || null,
          hourlyRate: data.hourlyRate,
          languages: JSON.stringify(data.languages),
          completeness: Math.round((completeness / 4) * 100),
        },
        update: {
          company: data.company,
          jobTitle: data.jobTitle,
          yearsExp: data.yearsExp,
          domains: JSON.stringify(data.domains),
          bio: data.bio ?? null,
          linkedinUrl: data.linkedinUrl || null,
          hourlyRate: data.hourlyRate,
          languages: JSON.stringify(data.languages),
          completeness: Math.round((completeness / 4) * 100),
        },
      });
    } else {
      const data = candidateSchema.parse(body);

      await prisma.candidateProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          targetRole: data.targetRole,
          experienceLevel: data.experienceLevel,
          domains: JSON.stringify(data.domains),
          completeness: 75,
        },
        update: {
          targetRole: data.targetRole,
          experienceLevel: data.experienceLevel,
          domains: JSON.stringify(data.domains),
          completeness: 75,
        },
      });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingComplete: true, role: body.role },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
