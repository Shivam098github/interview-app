"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { DOMAINS, EXPERIENCE_LEVELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

const interviewerSchema = z.object({
  company: z.string().min(1, "Required"),
  jobTitle: z.string().min(1, "Required"),
  yearsExp: z.coerce.number().min(0).max(50),
  bio: z.string().optional(),
  linkedinUrl: z.string().optional(),
  hourlyRate: z.coerce.number().min(10).max(500),
});

const candidateSchema = z.object({
  targetRole: z.string().min(1, "Required"),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"]),
});

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const role = session?.user?.role ?? "candidate";

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(role === "interviewer" ? interviewerSchema : candidateSchema),
    defaultValues: { experienceLevel: "junior", hourlyRate: 50 },
  });

  const expLevel = watch("experienceLevel");

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  }

  async function onSubmit(data: any) {
    if (selectedDomains.length === 0) {
      toast.error("Select at least one domain");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role, domains: selectedDomains }),
    });
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? "Something went wrong");
      setLoading(false);
      return;
    }
    await update({ onboardingComplete: true });
    toast.success("Profile set up! Welcome to InterviewHub.");
    router.push(role === "interviewer" ? "/dashboard/interviewer" : "/browse");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <CalendarDays className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Set up your profile</h1>
          <p className="text-gray-500 mt-1">This takes about 2 minutes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{role === "interviewer" ? "Interviewer Profile" : "Candidate Profile"}</CardTitle>
            <CardDescription>Tell us about yourself so we can match you better</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {role === "interviewer" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Company</Label>
                      <Input placeholder="Google" {...register("company")} className="mt-1" />
                      {errors.company && <p className="text-xs text-red-500 mt-1">{String(errors.company.message)}</p>}
                    </div>
                    <div>
                      <Label>Job Title</Label>
                      <Input placeholder="Senior SWE" {...register("jobTitle")} className="mt-1" />
                      {errors.jobTitle && <p className="text-xs text-red-500 mt-1">{String(errors.jobTitle.message)}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Years of Experience</Label>
                      <Input type="number" min={0} max={50} {...register("yearsExp")} className="mt-1" />
                    </div>
                    <div>
                      <Label>Rate per Session (USD)</Label>
                      <Input type="number" min={10} max={500} {...register("hourlyRate")} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Bio (optional)</Label>
                    <Textarea placeholder="Tell candidates about your experience and interview style..." {...register("bio")} className="mt-1" rows={3} />
                  </div>
                  <div>
                    <Label>LinkedIn URL (optional)</Label>
                    <Input placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} className="mt-1" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Target Role</Label>
                    <Input placeholder="Software Engineer, Product Manager..." {...register("targetRole")} className="mt-1" />
                    {errors.targetRole && <p className="text-xs text-red-500 mt-1">{String(errors.targetRole.message)}</p>}
                  </div>
                  <div>
                    <Label>Experience Level</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {EXPERIENCE_LEVELS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setValue("experienceLevel", value)}
                          className={cn(
                            "rounded-md border-2 p-2 text-sm text-left transition-all",
                            expLevel === value ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Domains */}
              <div>
                <Label>Domains {role === "interviewer" ? "you can interview in" : "you want to practice"}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DOMAINS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDomain(d)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border-2 transition-all",
                        selectedDomains.includes(d)
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 text-gray-600 hover:border-indigo-300"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {selectedDomains.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Select at least one</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
