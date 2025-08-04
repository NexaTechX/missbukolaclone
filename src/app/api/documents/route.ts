import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, validateSupabaseConfig } from '@/lib/supabase';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// GET documents (for RAG system)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    const accessLevel = searchParams.get('accessLevel');
    const isActive = searchParams.get('isActive');

    const filters: any = {};
    if (type) filters.type = type;
    if (department) filters.department = department;
    if (accessLevel) filters.access_level = accessLevel;
    if (isActive !== null) filters.is_active = isActive === 'true';

    const documents = await DatabaseService.getDocuments(filters);

    return NextResponse.json({
      success: true,
      documents: documents
    });

  } catch (error: any) {
    console.error('Error fetching documents:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch documents',
        message: 'Unable to retrieve documents. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST new document (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!validateSupabaseConfig()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured',
          message: 'Document upload is not available. Please contact IT support.'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const department = formData.get('department') as string;
    const author = formData.get('author') as string;
    const accessLevel = formData.get('accessLevel') as string;
    const userId = formData.get('userId') as string;

    // Validate required fields
    if (!file || !title || !type || !author || !accessLevel || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Extract text content from file
    let content = '';
    
    if (file.type === 'text/plain') {
      content = await file.text();
    } else {
      // For PDF and Word documents, we'll need to implement text extraction
      // For now, we'll return an error for unsupported formats
      return NextResponse.json(
        { success: false, error: 'PDF and Word document processing is not yet implemented. Please upload TXT files only.' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Document content is too short. Please upload a document with more content.' },
        { status: 400 }
      );
    }

    // Store document in database
    const document = await DatabaseService.storeDocument({
      title: title.trim(),
      content: content,
      type: type as 'policy' | 'procedure' | 'guideline' | 'memo' | 'report',
      department: department || null,
      author: author.trim(),
      access_level: accessLevel as 'public' | 'management' | 'executive',
    });

    // Log document upload
    await DatabaseService.logConversation({
      user_id: userId,
      user_message: `Uploaded document: ${title}`,
      ai_response: `Document "${title}" has been successfully uploaded and added to the knowledge base.`,
      request_mode_enabled: false,
      webhook_sent: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        department: document.department,
        author: document.author,
        access_level: document.access_level,
        date_created: document.date_created,
      }
    });

  } catch (error: any) {
    console.error('Document upload error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to upload document. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}