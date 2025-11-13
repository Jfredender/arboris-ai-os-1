
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const articles = await prisma.codexArticle.findMany({
      where: {
        isPublished: true,
        ...(category && category !== 'all' ? {
          category: {
            slug: category
          }
        } : {})
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar artigos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      categoryId,
      tags,
      isPublished
    } = body;

    if (!title || !slug || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    const article = await prisma.codexArticle.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        categoryId,
        authorId: user.id,
        tags: tags || [],
        isPublished: isPublished || false
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Erro ao criar artigo' },
      { status: 500 }
    );
  }
}
