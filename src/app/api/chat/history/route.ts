import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, validateSupabaseConfig } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!validateSupabaseConfig()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured',
          message: 'Conversation history is not available. Please contact IT support.'
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch conversation history
    const conversations = await DatabaseService.getConversationHistory(userId, limit);

    return NextResponse.json({
      success: true,
      conversations: conversations,
      count: conversations.length
    });

  } catch (error: any) {
    console.error('Error fetching conversation history:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch conversation history. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 