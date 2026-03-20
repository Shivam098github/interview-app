import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const DOMAINS = ["DSA", "System Design", "Behavioral", "Frontend", "Backend", "DevOps"];

const INTERVIEWERS = [
  {
    name: "Alex Chen",
    email: "alex@example.com",
    company: "Google",
    jobTitle: "Senior SWE",
    yearsExp: 7,
    domains: ["DSA", "System Design", "Backend"],
    bio: "7 years at Google working on distributed systems. Conducted 200+ interviews. Passionate about helping candidates crack FAANG interviews.",
    hourlyRate: 75,
    ratingAvg: 4.9,
    ratingCount: 48,
    isVerified: true,
    isFeatured: true,
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    company: "Amazon",
    jobTitle: "Staff Engineer",
    yearsExp: 10,
    domains: ["System Design", "Behavioral", "Backend"],
    bio: "Staff Engineer at Amazon with deep expertise in system design. I focus on practical, real-world scenarios.",
    hourlyRate: 90,
    ratingAvg: 4.8,
    ratingCount: 62,
    isVerified: true,
    isFeatured: true,
  },
  {
    name: "Marcus Johnson",
    email: "marcus@example.com",
    company: "Meta",
    jobTitle: "Senior Frontend Engineer",
    yearsExp: 5,
    domains: ["Frontend", "DSA", "Behavioral"],
    bio: "Senior FE at Meta specializing in React, performance, and web fundamentals. Great for frontend-heavy roles.",
    hourlyRate: 60,
    ratingAvg: 4.7,
    ratingCount: 31,
    isVerified: true,
    isFeatured: false,
  },
  {
    name: "Sarah Kim",
    email: "sarah@example.com",
    company: "Microsoft",
    jobTitle: "ML Engineer",
    yearsExp: 6,
    domains: ["Machine Learning", "Backend", "DSA"],
    bio: "ML Engineer at Microsoft. Specialize in ML system design and Python-focused coding interviews.",
    hourlyRate: 80,
    ratingAvg: 4.6,
    ratingCount: 24,
    isVerified: true,
    isFeatured: false,
  },
  {
    name: "David Park",
    email: "david@example.com",
    company: "Stripe",
    jobTitle: "Backend Engineer",
    yearsExp: 4,
    domains: ["Backend", "Database", "System Design"],
    bio: "Backend engineer at Stripe. Love discussing API design, databases, and payment systems architecture.",
    hourlyRate: 55,
    ratingAvg: 4.5,
    ratingCount: 18,
    isVerified: false,
    isFeatured: false,
  },
  {
    name: "Aisha Williams",
    email: "aisha@example.com",
    company: "Airbnb",
    jobTitle: "Engineering Manager",
    yearsExp: 9,
    domains: ["Behavioral", "System Design", "Backend"],
    bio: "EM at Airbnb. Help candidates with behavioral questions, leadership, and career progression conversations.",
    hourlyRate: 100,
    ratingAvg: 4.9,
    ratingCount: 55,
    isVerified: true,
    isFeatured: true,
  },
];

const WEEKDAY_SLOTS = [
  { weekday: 1, startTime: "18:00", endTime: "19:00", durationMins: 60 },
  { weekday: 2, startTime: "19:00", endTime: "20:00", durationMins: 60 },
  { weekday: 3, startTime: "20:00", endTime: "21:00", durationMins: 60 },
  { weekday: 6, startTime: "10:00", endTime: "11:00", durationMins: 60 },
];

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 12);

  // Create candidate
  const candidateUser = await prisma.user.upsert({
    where: { email: "candidate@example.com" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "candidate@example.com",
      password,
      role: "candidate",
      onboardingComplete: true,
    },
  });

  await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id,
      targetRole: "Software Engineer",
      experienceLevel: "junior",
      domains: JSON.stringify(["DSA", "Frontend", "System Design"]),
      completeness: 75,
    },
  });

  // Create interviewers
  for (const iv of INTERVIEWERS) {
    const user = await prisma.user.upsert({
      where: { email: iv.email },
      update: {},
      create: {
        name: iv.name,
        email: iv.email,
        password,
        role: "interviewer",
        onboardingComplete: true,
      },
    });

    const profile = await prisma.interviewerProfile.upsert({
      where: { userId: user.id },
      update: {
        ratingAvg: iv.ratingAvg,
        ratingCount: iv.ratingCount,
      },
      create: {
        userId: user.id,
        company: iv.company,
        jobTitle: iv.jobTitle,
        yearsExp: iv.yearsExp,
        domains: JSON.stringify(iv.domains),
        bio: iv.bio,
        hourlyRate: iv.hourlyRate,
        ratingAvg: iv.ratingAvg,
        ratingCount: iv.ratingCount,
        isVerified: iv.isVerified,
        isFeatured: iv.isFeatured,
        completeness: 100,
      },
    });

    // Add availability slots
    for (const slot of WEEKDAY_SLOTS) {
      const existing = await prisma.availabilitySlot.findFirst({
        where: { interviewerId: profile.id, weekday: slot.weekday, startTime: slot.startTime },
      });
      if (!existing) {
        await prisma.availabilitySlot.create({
          data: { interviewerId: profile.id, ...slot },
        });
      }
    }
  }

  // Create a sample completed booking for the candidate
  const alexUser = await prisma.user.findUnique({ where: { email: "alex@example.com" } });
  if (alexUser) {
    const alexProfile = await prisma.interviewerProfile.findUnique({ where: { userId: alexUser.id } });
    const slot = await prisma.availabilitySlot.findFirst({ where: { interviewerId: alexProfile!.id } });

    if (slot) {
      const existingBooking = await prisma.booking.findFirst({
        where: { candidateId: candidateUser.id, interviewerId: alexUser.id },
      });

      if (!existingBooking) {
        const booking = await prisma.booking.create({
          data: {
            candidateId: candidateUser.id,
            interviewerId: alexUser.id,
            slotId: slot.id,
            scheduledAt: new Date("2026-03-15T18:00:00Z"),
            durationMins: 60,
            interviewType: "mock",
            focusTopic: "Dynamic Programming",
            meetLink: "https://meet.google.com/abc-defg-hij",
            amount: 75,
            platformFee: 15,
            interviewerPayout: 60,
            status: "completed",
          },
        });

        await prisma.feedback.create({
          data: {
            bookingId: booking.id,
            interviewerId: alexUser.id,
            candidateId: candidateUser.id,
            problemSolving: 4,
            communication: 5,
            codeQuality: 4,
            systemDesign: 3,
            writtenFeedback: "Jordan showed great communication skills and was able to break down problems clearly. DP needs more practice but the approach was logical. Would recommend booking another session.",
            hireSignal: "yes",
            shareToken: "sample-share-token-123",
          },
        });

        await prisma.rating.create({
          data: {
            bookingId: booking.id,
            fromUserId: candidateUser.id,
            toUserId: alexUser.id,
            stars: 5,
            comment: "Alex was incredibly helpful and gave detailed feedback. Highly recommend!",
          },
        });
      }
    }
  }

  // Sample payout records
  await prisma.payout.createMany({
    data: [
      { interviewerId: "placeholder", amount: 160, periodStart: new Date("2026-03-01"), periodEnd: new Date("2026-03-07"), status: "paid", paidAt: new Date("2026-03-09") },
      { interviewerId: "placeholder", amount: 200, periodStart: new Date("2026-03-08"), periodEnd: new Date("2026-03-14"), status: "paid", paidAt: new Date("2026-03-16") },
    ],
  });

  console.log("Seed complete!");
  console.log("\nTest accounts:");
  console.log("  Candidate: candidate@example.com / password123");
  console.log("  Interviewer: alex@example.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
