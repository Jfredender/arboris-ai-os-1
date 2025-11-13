
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import ChecklistClient from "./_components/checklist-client";

export const metadata = {
  title: "Checklist Administrativo | ARBORIS AI",
  description: "Verificação completa do sistema",
};

export default async function ChecklistPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  return <ChecklistClient session={session} />;
}
