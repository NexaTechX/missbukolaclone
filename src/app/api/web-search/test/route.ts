import { NextRequest, NextResponse } from 'next/server';
import { WebSearchService } from '@/lib/web-search-service';

export async function POST(request: NextRequest) {
  try {
    const { query, adminKey } = await request.json();

    // Simple admin verification
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Test web search
    const searchResults = await WebSearchService.searchGtextInfo(query);
    const processedResults = WebSearchService.processSearchResults(searchResults.results, query);

    return NextResponse.json({
      success: true,
      searchQuery: query,
      rawResults: searchResults,
      processedResults: processedResults,
      webSearchConfigured: WebSearchService.isConfigured(),
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Web search test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Web search test failed',
        details: error.message,
        webSearchConfigured: WebSearchService.isConfigured(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Web search test endpoint - POST required',
    requiredFields: ['query', 'adminKey'],
    webSearchConfigured: WebSearchService.isConfigured(),
  });
}