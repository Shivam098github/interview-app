import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Video, PenLine, Calendar, Clock, User, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { parseJsonArray } from "@/lib/utils";
import AIQuestionSuggestions from "@/components/session/ai-questions";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/auth/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      candidate: {
        select: { id: true, name: true, image: true, email: true, candidateProfile: true },
      },
      interviewer: {
        select: { id: true, name: true, image: true, email: true, interviewerProfile: true },
      },
      slot: true,
      session: true,
      feedback: true,
    },
  });

  if (!booking) notFound();

  const isParticipant =
    booking.candidateId === session.user.id || booking.interviewerId === session.user.id;
  if (!isParticipant) redirect("/dashboard/candidate");

  const isInterviewer = session.user.role === "interviewer";
  const candidate = booking.candidate;
  const interviewer = booking.interviewer;
  const candidateDomains = parseJsonArray(candidate.candidateProfile?.domains);
  const scheduledAt = new Date(booking.scheduledAt);

  const whiteboardUrl = `https://excalidraw.com/#room=${booking.id.replace(/-/g, "").slice(0, 20)},${booking.id.replace(/-/g, "").slice(20, 40)}`;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href={isInterviewer ? "/dashboard/interviewer" : "/dashboard/candidate"}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Session Details</h1>
        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="capitalize">
          {booking.status}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Participants */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Participants</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { user: candidate, label: "Candidate" },
                { user: interviewer, label: "Interviewer" },
              ].map(({ user, label }) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image ?? ""} />
                    <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardContent className="pt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{format(scheduledAt, "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{format(scheduledAt, "h:mm a")} · {booking.durationMins} min</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="capitalize">{booking.interviewType} Interview</span>
              </div>
              {booking.focusTopic && (
                <div className="flex items-start gap-2 text-gray-600">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <span>Focus: {booking.focusTopic}</span>
                </div>
              )}
              <Separator />
              <div className="flex flex-wrap gap-1">
                {candidateDomains.map((d) => (
                  <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Session tools */}
        <div className="lg:col-span-2 space-y-4">
          {/* Join + Whiteboard */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Session Tools</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {booking.meetLink && (
                <a href={booking.meetLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full gap-2" size="lg">
                    <Video className="h-5 w-5" />
                    Join Google Meet
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                </a>
              )}

              <a href={whiteboardUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full gap-2">
                  <PenLine className="h-4 w-4" />
                  Open Whiteboard (Excalidraw)
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              </a>

              <div className="rounded-lg bg-gray-50 border p-3 text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-1">Pre-session checklist</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Camera and microphone working</li>
                  <li>Google Meet opened in browser</li>
                  <li>Resume ready to share (if needed)</li>
                  {booking.focusTopic && <li>Reviewed: {booking.focusTopic}</li>}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Question Suggestions — for interviewers */}
          {isInterviewer && (
            <AIQuestionSuggestions
              domain={candidateDomains[0] ?? "DSA"}
              experienceLevel={candidate.candidateProfile?.experienceLevel ?? "mid"}
              interviewType={booking.interviewType}
              focusTopic={booking.focusTopic ?? undefined}
            />
          )}

          {/* Post-session actions */}
          {booking.status === "confirmed" && isInterviewer && (
            <Card>
              <CardContent className="pt-5">
                <Link href={`/feedback/${booking.id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="h-4 w-4" />
                    Submit Feedback After Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Feedback display for candidate */}
          {booking.feedback && session.user.role === "candidate" && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Your Feedback Report</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Problem Solving", score: booking.feedback.problemSolving },
                  { label: "Communication", score: booking.feedback.communication },
                  { label: "Code Quality", score: booking.feedback.codeQuality },
                  { label: "System Design", score: booking.feedback.systemDesign },
                ].map(({ label, score }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(score / 5) * 100}%` }} />
                      </div>
                      <span className="font-medium w-6 text-right">{score}/5</span>
                    </div>
                  </div>
                ))}
                {booking.feedback.writtenFeedback && (
                  <>
                    <Separator />
                    <p className="text-sm text-gray-600">{booking.feedback.writtenFeedback}</p>
                  </>
                )}
                <Badge variant={
                  booking.feedback.hireSignal === "strong_yes" || booking.feedback.hireSignal === "yes" ? "success" :
                  booking.feedback.hireSignal === "no" || booking.feedback.hireSignal === "strong_no" ? "destructive" : "secondary"
                } className="capitalize">
                  {booking.feedback.hireSignal?.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
