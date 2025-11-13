
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import SignInForm from "./_components/signin-form";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/explorator");
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--negro-vacuo)] via-[var(--azul-noite-profundo)] to-[var(--negro-vacuo)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
