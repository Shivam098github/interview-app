"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/layout/star-rating";
import { Search, Filter, MapPin, Clock, CheckCircle, Star } from "lucide-react";
import { DOMAINS } from "@/lib/utils";
import { parseJsonArray } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BrowsePage() {
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");

  async function fetchInterviewers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (domain && domain !== "all") params.set("domain", domain);
    if (maxRate && maxRate !== "any") params.set("maxRate", maxRate);
    if (minRating && minRating !== "any") params.set("minRating", minRating);
    const res = await fetch(`/api/interviewers?${params}`);
    const data = await res.json();
    setInterviewers(data);
    setLoading(false);
  }

  useEffect(() => { fetchInterviewers(); }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Your Interviewer</h1>
        <p className="text-gray-500 mt-1">Browse professionals available for mock interviews</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchInterviewers()}
          />
        </div>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={maxRate} onValueChange={setMaxRate}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Max Rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Rate</SelectItem>
            <SelectItem value="30">Up to $30</SelectItem>
            <SelectItem value="50">Up to $50</SelectItem>
            <SelectItem value="100">Up to $100</SelectItem>
            <SelectItem value="200">Up to $200</SelectItem>
          </SelectContent>
        </Select>
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Min Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchInterviewers} className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white h-64 animate-pulse" />
          ))}
        </div>
      ) : interviewers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No interviewers found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewers.map((interviewer: any) => {
            const profile = interviewer.interviewerProfile;
            const domains = parseJsonArray(profile?.domains);
            return (
              <Card key={interviewer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={interviewer.image ?? ""} />
                      <AvatarFallback>{interviewer.name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm truncate">{interviewer.name}</h3>
                        {profile?.isVerified && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                        {profile?.isFeatured && <Badge variant="default" className="text-xs py-0">Featured</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{profile?.jobTitle} @ {profile?.company}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating rating={profile?.ratingAvg ?? 0} size="sm" />
                        <span className="text-xs text-gray-400">
                          {profile?.ratingAvg?.toFixed(1)} ({profile?.ratingCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {profile?.bio && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {domains.slice(0, 3).map((d: string) => (
                      <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                    ))}
                    {domains.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{domains.length - 3}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{profile?.availability?.length ?? 0} slots/wk</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-600">${profile?.hourlyRate}/session</span>
                      <Link href={`/profile/${interviewer.id}`}>
                        <Button size="sm">Book</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
