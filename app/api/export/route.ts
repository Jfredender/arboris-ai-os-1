
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids, format, includeImages, includeStats } = await req.json();

    // Fetch analyses
    const analyses = await prisma.plantAnalysis.findMany({
      where: {
        id: { in: ids },
        user: { email: session.user.email },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (analyses.length === 0) {
      return NextResponse.json({ error: 'No analyses found' }, { status: 404 });
    }

    // Generate export based on format
    switch (format) {
      case 'csv':
        return generateCSV(analyses, includeStats);
      
      case 'json':
        return generateJSON(analyses);
      
      case 'pdf':
        // For now, return JSON with a note about PDF generation
        return NextResponse.json({
          message: 'PDF generation coming soon',
          data: analyses,
        });
      
      case 'images':
        // For now, return image URLs
        return NextResponse.json({
          message: 'Image archive generation coming soon',
          images: analyses.map((a) => a.imageUrl),
        });
      
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

function generateCSV(analyses: any[], includeStats: boolean) {
  const headers = [
    'ID',
    'Date',
    'Plant Name',
    'Scientific Name',
    'Confidence',
    'Health Status',
    'Location',
    'User',
  ];

  const rows = analyses.map((a: any) => {
    const result = typeof a.analysisResult === 'string' 
      ? JSON.parse(a.analysisResult) 
      : a.analysisResult || {};
    return [
      a.id,
      new Date(a.createdAt).toISOString(),
      result.plantName || 'N/A',
      result.scientificName || 'N/A',
      result.confidence || 0,
      result.healthStatus || 'N/A',
      a.location ? `${a.location.lat},${a.location.lng}` : 'N/A',
      a.user?.name || a.user?.email || 'N/A',
    ];
  });

  // Add statistics if requested
  if (includeStats && analyses.length > 0) {
    rows.push([]);
    rows.push(['Statistics']);
    rows.push(['Total Analyses', analyses.length]);
    
    const avgConfidence =
      analyses.reduce((sum, a) => {
        const result = typeof a.analysisResult === 'string' 
          ? JSON.parse(a.analysisResult) 
          : a.analysisResult || {};
        return sum + (result.confidence || 0);
      }, 0) / analyses.length;
    
    rows.push(['Average Confidence', avgConfidence.toFixed(2) + '%']);
    
    const uniqueSpecies = new Set(
      analyses.map((a) => {
        const result = typeof a.analysisResult === 'string' 
          ? JSON.parse(a.analysisResult) 
          : a.analysisResult || {};
        return result.plantName;
      })
    );
    rows.push(['Unique Species', uniqueSpecies.size]);
  }

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="arboris-export-${Date.now()}.csv"`,
    },
  });
}

function generateJSON(analyses: any[]) {
  const data = {
    exportDate: new Date().toISOString(),
    totalAnalyses: analyses.length,
    analyses: analyses.map((a) => {
      const result = typeof a.analysisResult === 'string' 
        ? JSON.parse(a.analysisResult) 
        : a.analysisResult || {};
      return {
        id: a.id,
        date: a.createdAt,
        imageUrl: a.imageUrl,
        result,
        operationMode: a.operationMode,
        location: a.location,
        user: {
          name: a.user?.name,
          email: a.user?.email,
        },
      };
    }),
    statistics: {
      totalAnalyses: analyses.length,
      avgConfidence:
        analyses.reduce((sum, a) => {
          const result = typeof a.analysisResult === 'string' 
            ? JSON.parse(a.analysisResult) 
            : a.analysisResult || {};
          return sum + (result.confidence || 0);
        }, 0) / analyses.length,
      uniqueSpecies: new Set(
        analyses.map((a) => {
          const result = typeof a.analysisResult === 'string' 
            ? JSON.parse(a.analysisResult) 
            : a.analysisResult || {};
          return result.plantName;
        })
      ).size,
    },
  };

  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': `attachment; filename="arboris-export-${Date.now()}.json"`,
    },
  });
}
