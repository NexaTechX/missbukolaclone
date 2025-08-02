import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('timeRange') as '1d' | '7d' | '30d') || '7d';
    const adminKey = searchParams.get('adminKey');

    // Simple admin verification (in production, use proper authentication)
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get analytics data
    const analytics = await DatabaseService.getAnalytics(timeRange);

    return NextResponse.json({
      success: true,
      data: analytics,
      timeRange,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        details: error.message,
      },
      { status: 500 }
    );
  }
}