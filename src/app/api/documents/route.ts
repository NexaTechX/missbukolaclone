import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// GET documents (for RAG system)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const department = searchParams.get('department') || undefined;
    const access_level = searchParams.get('access_level') || undefined;
    const search = searchParams.get('search');

    let documents;

    if (search) {
      documents = await DatabaseService.searchDocuments(search);
    } else {
      documents = await DatabaseService.getDocuments({
        type: type || undefined,
        department: department || undefined,
        access_level: access_level || undefined,
        is_active: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
    });

  } catch (error: any) {
    console.error('Documents GET error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch documents',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST new document (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, ...documentData } = body;

    // Simple admin verification (in production, use proper authentication)
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!documentData.title || !documentData.content || !documentData.type || !documentData.author) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content, type, author' },
        { status: 400 }
      );
    }

    const document = await DatabaseService.storeDocument(documentData);

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document stored successfully',
    });

  } catch (error: any) {
    console.error('Documents POST error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to store document',
        details: error.message,
      },
      { status: 500 }
    );
  }
}