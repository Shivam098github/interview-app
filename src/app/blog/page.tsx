import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { format } from "date-fns";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  const SAMPLE_POSTS = [
    { id: "1", title: "How to Crack the System Design Interview", slug: "system-design-guide", excerpt: "A comprehensive guide to approaching system design questions, from requirements gathering to final architecture.", category: "System Design", readMinutes: 12, publishedAt: new Date("2026-03-10") },
    { id: "2", title: "Top 10 DSA Patterns You Must Know", slug: "dsa-patterns", excerpt: "Master these 10 algorithmic patterns and solve 80% of coding interview problems efficiently.", category: "DSA", readMinutes: 8, publishedAt: new Date("2026-03-05") },
    { id: "3", title: "Behavioral Interview: STAR Method Deep Dive", slug: "star-method", excerpt: "Learn how to structure compelling stories using the STAR method for behavioral interviews.", category: "Behavioral", readMinutes: 6, publishedAt: new Date("2026-02-28") },
    { id: "4", title: "Frontend Interview Questions 2026", slug: "frontend-2026", excerpt: "The most common React, CSS, and JavaScript questions asked in frontend engineering interviews this year.", category: "Frontend", readMinutes: 10, publishedAt: new Date("2026-02-20") },
    { id: "5", title: "How to Negotiate Your Salary Offer", slug: "salary-negotiation", excerpt: "Practical strategies to negotiate a higher salary after receiving an offer, with real scripts.", category: "Career", readMinutes: 7, publishedAt: new Date("2026-02-15") },
    { id: "6", title: "Mock Interview vs. Real Interview: What to Expect", slug: "mock-vs-real", excerpt: "How to use mock interviews to simulate real interview pressure and what to focus on.", category: "General", readMinutes: 5, publishedAt: new Date("2026-02-10") },
  ];

  const allPosts = posts.length > 0 ? posts : SAMPLE_POSTS;

  const CATEGORY_COLORS: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
    "System Design": "default",
    "DSA": "secondary",
    "Behavioral": "warning",
    "Frontend": "success",
    "Career": "outline",
    "General": "outline",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h1 className="text-3xl font-bold">Interview Resources</h1>
          </div>
          <p className="text-gray-500">Guides, tips, and strategies to help you land your dream job</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={CATEGORY_COLORS[post.category] ?? "outline"} className="text-xs">
                    {post.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" /> {post.readMinutes} min
                  </span>
                </div>
                <h2 className="font-semibold text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {format(new Date(post.publishedAt ?? Date.now()), "MMM d, yyyy")}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
