import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    onboardingComplete: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      onboardingComplete: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    onboardingComplete: boolean;
  }
}
