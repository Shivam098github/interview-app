import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "@/components/layout/star-rating";
import { Navbar } from "@/components/layout/navbar";
import BookingModal from "@/components/booking/booking-modal";
import { CheckCircle, Linkedin, Star, Clock, MapPin, Calendar } from "lucide-react";
import { parseJsonArray, WEEKDAYS } from "@/lib/utils";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id, role: "interviewer" },
    include: {
      interviewerProfile: {
        include: {
          availability: { where: { isActive: true }, orderBy: [{ weekday: "asc" }, { startTime: "asc" }] },
        },
      },
      ratingsReceived: {
        where: { isPublic: true },
        include: { fromUser: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user || !user.interviewerProfile) notFound();

  const profile = user.interviewerProfile;
  const domains = parseJsonArray(profile.domains);
  const languages = parseJsonArray(profile.languages);
  const isOwnProfile = session?.user?.id === id;
  const isCandidate = session?.user?.role === "candidate";

  const slotsByDay = profile.availability.reduce<Record<number, typeof profile.availability>>(
    (acc, slot) => {
      (acc[slot.weekday] = acc[slot.weekday] || []).push(slot);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src={user.image ?? ""} />
                  <AvatarFallback className="text-xl">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h1 className="text-xl font-bold">{user.name}</h1>
                  {profile.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-gray-500 text-sm">{profile.jobTitle}</p>
                <p className="text-gray-400 text-sm">{profile.company}</p>

                <div className="flex items-center justify-center gap-1 mt-2">
                  <StarRating rating={profile.ratingAvg} size="md" />
                  <span className="text-sm font-medium">{profile.ratingAvg.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({profile.ratingCount} reviews)</span>
                </div>

                <div className="mt-4 text-2xl font-bold text-indigo-600">
                  ${profile.hourlyRate}<span className="text-sm font-normal text-gray-400">/session</span>
                </div>

                {isCandidate && (
                  <BookingModal interviewer={user} profile={profile} slots={profile.availability} />
                )}

                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn Profile
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Experience</p>
                  <p className="text-sm font-medium">{profile.yearsExp} years</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {languages.map((l) => <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>)}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Domains</p>
                  <div className="flex flex-wrap gap-1">
                    {domains.map((d) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({profile.ratingCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="pt-5">
                    {profile.bio ? (
                      <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No bio yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="mt-4">
                <Card>
                  <CardContent className="pt-5">
                    {Object.keys(slotsByDay).length === 0 ? (
                      <p className="text-sm text-gray-400">No availability set yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(slotsByDay).map(([day, slots]) => (
                          <div key={day} className="flex items-start gap-4">
                            <span className="text-sm font-medium w-10 text-gray-500">{WEEKDAYS[Number(day)]}</span>
                            <div className="flex flex-wrap gap-2">
                              {slots.map((slot) => (
                                <Badge key={slot.id} variant="secondary" className="text-xs">
                                  {slot.startTime} – {slot.endTime} ({slot.durationMins}min)
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-3">
                {user.ratingsReceived.length === 0 ? (
                  <Card><CardContent className="pt-5 text-sm text-gray-400">No reviews yet.</CardContent></Card>
                ) : (
                  user.ratingsReceived.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={rating.fromUser.image ?? ""} />
                            <AvatarFallback className="text-xs">{rating.fromUser.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{rating.fromUser.name}</span>
                          <StarRating rating={rating.stars} size="sm" />
                        </div>
                        {rating.comment && <p className="text-sm text-gray-600">{rating.comment}</p>}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
