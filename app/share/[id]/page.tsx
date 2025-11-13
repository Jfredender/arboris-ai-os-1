
import { Suspense } from 'react';
import ShareView from './_components/share-view';

export const metadata = {
  title: 'Análise Compartilhada | ARBORIS AI',
  description: 'Visualize análises de plantas compartilhadas',
};

export default function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ShareView params={params} />
    </Suspense>
  );
}
