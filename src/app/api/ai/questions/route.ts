import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { domain, experienceLevel, interviewType, focusTopic } = await req.json();

  const prompt = `You are an expert technical interviewer. Generate 8 high-quality interview questions for the following context:

- Domain: ${domain}
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType}
${focusTopic ? `- Focus Topic: ${focusTopic}` : ""}

Return a JSON array of objects with this structure:
[
  {
    "question": "The question text",
    "difficulty": "easy" | "medium" | "hard",
    "followUp": "A good follow-up question",
    "hint": "What to look for in the answer"
  }
]

Only return valid JSON, no markdown.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "[]";
    const questions = JSON.parse(text);

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
