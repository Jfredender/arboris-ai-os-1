
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import ExploratorClient from "./_components/explorator-client";

export const metadata = {
  title: "EXPLORATOR - ARBORIS AI OS 1",
  description: "Sistema inteligente de exploração e análise",
};

export default async function ExploratorPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  return <ExploratorClient session={session} />;
}
