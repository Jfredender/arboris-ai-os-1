
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import CommunityClient from "./_components/community-client";

export const metadata = {
  title: "Comunidade - ARBORIS AI OS 1",
  description: "Compartilhe descobertas e conecte-se com outros exploradores",
};

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  return <CommunityClient session={session} />;
}
