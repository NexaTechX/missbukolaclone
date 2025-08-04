import { NextRequest, NextResponse } from 'next/server';
import { validateSupabaseConfig, DatabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      openai_key: !!process.env.OPENAI_API_KEY,
    };

    const supabaseConfigured = validateSupabaseConfig();
    
    let dbTest = null;
    if (supabaseConfigured) {
      try {
        // Test database connection by trying to fetch a user session
        const testUser = await DatabaseService.getConversationHistory('emp001', 1);
        dbTest = {
          success: true,
          conversationCount: testUser.length,
          message: 'Database connection successful'
        };
      } catch (error: any) {
        dbTest = {
          success: false,
          error: error.message,
          message: 'Database connection failed'
        };
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabaseConfigured,
      databaseTest: dbTest,
      message: supabaseConfigured ? 'Supabase is configured' : 'Supabase is not configured'
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 