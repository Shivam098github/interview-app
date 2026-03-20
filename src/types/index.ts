export type UserRole = "candidate" | "interviewer" | "admin";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type HireSignal =
  | "strong_yes"
  | "yes"
  | "maybe"
  | "no"
  | "strong_no";

export type InterviewType = "mock" | "screening" | "domain";

export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior";

export interface InterviewerWithProfile {
  id: string;
  name: string | null;
  image: string | null;
  interviewerProfile: {
    id: string;
    company: string;
    jobTitle: string;
    yearsExp: number;
    domains: string;
    bio: string | null;
    hourlyRate: number;
    ratingAvg: number;
    ratingCount: number;
    isVerified: boolean;
    isFeatured: boolean;
    languages: string;
    completeness: number;
  } | null;
}
