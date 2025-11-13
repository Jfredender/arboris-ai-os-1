
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import VulcanoPortal from './_components/vulcano-portal';

export const metadata = {
  title: 'VULCANO Architect Portal | ARBORIS AI',
  description: 'Chief Architect comprehensive documentation and system overview',
};

export default async function VulcanoPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <VulcanoPortal session={session} />;
}
