import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-gray-500 mb-6">Something went wrong during sign in. Please try again.</p>
        <Link href="/auth/login"><Button>Back to Login</Button></Link>
      </div>
    </div>
  );
}
