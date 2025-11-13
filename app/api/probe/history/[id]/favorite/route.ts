
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { isFavorite } = body;

    const analysis = await prisma.plantAnalysis.update({
      where: { id: params.id },
      data: { isFavorite }
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error updating favorite:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar favorito' },
      { status: 500 }
    );
  }
}
