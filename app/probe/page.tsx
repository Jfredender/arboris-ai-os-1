
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import ProbeViewClient from "./_components/probe-view-client";

export const metadata = {
  title: "Lente Simbiótica | ARBORIS AI",
  description: "Interface de análise avançada e visualização holográfica",
};

export default async function ProbePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  return <ProbeViewClient session={session} />;
}
