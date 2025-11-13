
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import HistoryClient from './_components/history-client';

export const metadata = {
  title: 'Histórico de Análises | ARBORIS AI',
  description: 'Veja todas as suas análises de plantas anteriores',
};

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return <HistoryClient session={session} />;
}
