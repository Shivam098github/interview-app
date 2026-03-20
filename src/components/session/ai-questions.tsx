"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Question {
  question: string;
  difficulty: "easy" | "medium" | "hard";
  followUp: string;
  hint: string;
}

interface Props {
  domain: string;
  experienceLevel: string;
  interviewType: string;
  focusTopic?: string;
}

const DIFFICULTY_COLORS = {
  easy: "success" as const,
  medium: "warning" as const,
  hard: "destructive" as const,
};

export default function AIQuestionSuggestions({ domain, experienceLevel, interviewType, focusTopic }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function generateQuestions() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, experienceLevel, interviewType, focusTopic }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        toast.error("Failed to generate questions");
      }
    } catch {
      toast.error("Failed to generate questions");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            AI Question Suggestions
          </CardTitle>
          <Button
            size="sm"
            onClick={generateQuestions}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-3 w-3" /> {questions.length > 0 ? "Regenerate" : "Generate"}</>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400">
          Tailored for {domain} · {experienceLevel} · {interviewType}
          {focusTopic ? ` · ${focusTopic}` : ""}
        </p>
      </CardHeader>
      <CardContent>
        {questions.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">
            Click Generate to get AI-powered interview questions
          </p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Generating questions...</span>
          </div>
        )}
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
              <button
                className="w-full p-3 text-left flex items-start gap-3"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span className="text-xs font-bold text-gray-400 mt-0.5 w-4 shrink-0">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{q.question}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={DIFFICULTY_COLORS[q.difficulty]} className="text-xs capitalize">
                    {q.difficulty}
                  </Badge>
                  {expanded === i ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>
              {expanded === i && (
                <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Follow-up</p>
                    <p className="text-xs text-gray-600">{q.followUp}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">What to look for</p>
                    <p className="text-xs text-gray-600">{q.hint}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
