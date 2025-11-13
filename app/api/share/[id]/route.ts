
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const analysis = await prisma.plantAnalysis.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Return public data
    const result = typeof analysis.analysisResult === 'string' 
      ? JSON.parse(analysis.analysisResult) 
      : analysis.analysisResult || {};
    
    return NextResponse.json({
      id: analysis.id,
      plantName: result.plantName || 'Desconhecida',
      scientificName: result.scientificName,
      confidence: result.confidence || 0,
      imageUrl: analysis.imageUrl,
      date: analysis.createdAt,
      userName: analysis.user?.name || 'Usuário ARBORIS',
    });
  } catch (error) {
    console.error('Share fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
