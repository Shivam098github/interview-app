"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/layout/star-rating";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const DIMENSIONS = [
  { key: "problemSolving", label: "Problem Solving", desc: "Approach, logic, edge cases" },
  { key: "communication", label: "Communication", desc: "Clarity, asking questions, thinking aloud" },
  { key: "codeQuality", label: "Code Quality", desc: "Clean code, naming, structure" },
  { key: "systemDesign", label: "System Design", desc: "Architecture, trade-offs, scalability" },
];

const HIRE_SIGNALS = [
  { value: "strong_yes", label: "Strong Yes — Definitely hire" },
  { value: "yes", label: "Yes — Would hire" },
  { value: "maybe", label: "Maybe — On the fence" },
  { value: "no", label: "No — Would not hire" },
  { value: "strong_no", label: "Strong No — Definitely not" },
];

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const isInterviewer = session?.user?.role === "interviewer";

  const [scores, setScores] = useState({
    problemSolving: 0,
    communication: 0,
    codeQuality: 0,
    systemDesign: 0,
  });
  const [writtenFeedback, setWrittenFeedback] = useState("");
  const [hireSignal, setHireSignal] = useState<string>("");
  const [candidateRating, setCandidateRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (isInterviewer) {
      if (Object.values(scores).some((s) => s === 0)) {
        toast.error("Please score all dimensions");
        return;
      }
      if (!hireSignal) {
        toast.error("Please select a hire signal");
        return;
      }
    }

    setLoading(true);

    if (isInterviewer) {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feedback", bookingId, ...scores, writtenFeedback, hireSignal }),
      });
      if (!res.ok) {
        toast.error("Failed to submit feedback");
        setLoading(false);
        return;
      }
    }

    // Submit rating
    if (candidateRating > 0) {
      // Interviewer rates candidate (private) or candidate rates interviewer (public)
      // We get the booking to find the other user's ID - for simplicity, this is done via the booking ID
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rating",
          bookingId,
          toUserId: "placeholder", // will be resolved server-side via bookingId
          stars: candidateRating,
          comment: ratingComment,
        }),
      });
    }

    toast.success(isInterviewer ? "Feedback submitted!" : "Rating submitted!");
    router.push(isInterviewer ? "/dashboard/interviewer" : "/dashboard/candidate");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href={isInterviewer ? "/dashboard/interviewer" : "/dashboard/candidate"}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold">
          {isInterviewer ? "Submit Interview Feedback" : "Rate Your Interviewer"}
        </h1>
      </div>

      <div className="space-y-4">
        {/* Interviewer: dimension scores */}
        {isInterviewer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Scores</CardTitle>
              <CardDescription>Rate the candidate on each dimension (1–5)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{dim.label}</p>
                    <p className="text-xs text-gray-400">{dim.desc}</p>
                  </div>
                  <StarRating
                    rating={scores[dim.key as keyof typeof scores]}
                    interactive
                    size="lg"
                    onChange={(val) => setScores((prev) => ({ ...prev, [dim.key]: val }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Interviewer: written feedback + hire signal */}
        {isInterviewer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Written Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Detailed Feedback</Label>
                <Textarea
                  placeholder="Describe the candidate's performance, strengths, areas to improve..."
                  value={writtenFeedback}
                  onChange={(e) => setWrittenFeedback(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label>Hiring Signal</Label>
                <Select value={hireSignal} onValueChange={setHireSignal}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Would you hire this candidate?" />
                  </SelectTrigger>
                  <SelectContent>
                    {HIRE_SIGNALS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Both: star rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isInterviewer ? "Rate the Candidate" : "Rate the Interviewer"}
            </CardTitle>
            <CardDescription>
              {isInterviewer ? "Private rating, not shown publicly" : "Public rating shown on their profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <StarRating
                rating={candidateRating}
                interactive
                size="lg"
                onChange={setCandidateRating}
              />
              <span className="text-sm text-gray-500">{candidateRating > 0 ? `${candidateRating}/5` : "Click to rate"}</span>
            </div>
            <div>
              <Label>Comment (optional)</Label>
              <Textarea
                placeholder="Share your thoughts..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full gap-2" onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Submit</>}
        </Button>
      </div>
    </div>
  );
}
