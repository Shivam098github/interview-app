import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Star, Users, Zap, CalendarDays, ArrowRight, Code2, Brain, MessageSquare } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Real Industry Professionals", desc: "Interview with engineers from top tech companies — Google, Amazon, Microsoft, and more." },
  { icon: CalendarDays, title: "Flexible Scheduling", desc: "Book slots that fit your schedule. Evening and weekend availability from professionals." },
  { icon: Star, title: "Structured Feedback", desc: "Get detailed written feedback on problem solving, communication, code quality, and system design." },
  { icon: Zap, title: "Google Meet Sessions", desc: "Seamless video interviews via Google Meet. No downloads, no fuss." },
  { icon: Code2, title: "Live Whiteboard", desc: "Collaborative whiteboard via Excalidraw for system design interviews." },
  { icon: Brain, title: "AI Question Suggestions", desc: "AI-powered interview question suggestions tailored to your target role and domain." },
];

const STATS = [
  { value: "500+", label: "Interviewers" },
  { value: "4.8★", label: "Avg Rating" },
  { value: "10K+", label: "Sessions Done" },
  { value: "85%", label: "Placement Rate" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 z-40 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-lg">InterviewHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/auth/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">Now live — book your first interview</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Practice interviews with<br />
            <span className="text-indigo-600">real professionals</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Book 1-on-1 mock interviews with engineers from top companies. Get structured feedback, improve faster, and land your dream job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=candidate">
              <Button size="lg" className="gap-2">
                Book an Interview <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register?role=interviewer">
              <Button size="lg" variant="outline">Become an Interviewer</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-white">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-indigo-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to ace your interviews</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-gray-100">
                <CardContent className="pt-6">
                  <f.icon className="h-8 w-8 text-indigo-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Browse Interviewers", desc: "Filter by domain, company, rating, and price." },
              { step: "02", title: "Book a Slot", desc: "Pick an available time and confirm instantly." },
              { step: "03", title: "Get Feedback", desc: "Attend the session and receive a detailed report." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-4xl font-bold text-indigo-200 mb-3">{s.step}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Join thousands of candidates who have improved their interview skills.</p>
          <Link href="/auth/register">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CalendarDays className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-gray-700">InterviewHub</span>
        </div>
        <p>© 2026 InterviewHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
