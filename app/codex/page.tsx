
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import CodexClient from './_components/codex-client';

export const metadata = {
  title: 'Codex | ARBORIS AI OS 1',
  description: 'Biblioteca de Conhecimento Botânico',
};

export default async function CodexPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <CodexClient session={session} />;
}
