import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["candidate", "interviewer"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error("[Register] Error:", err);
    return NextResponse.json({
      error: "Internal server error",
      details: err.message,
      stack: err.stack,
      env_check: {
        has_db_url: !!process.env.DATABASE_URL,
        db_url_len: process.env.DATABASE_URL?.length || 0
      }
    }, { status: 500 });
  }
}
