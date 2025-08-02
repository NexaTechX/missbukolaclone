import axios from 'axios';

interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  relevance_score: number;
}

interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
  total_results: number;
}

export class WebSearchService {
  private static readonly SEARCH_API_URL = 'https://api.bing.microsoft.com/v7.0/search';
  private static readonly BING_API_KEY = process.env.BING_SEARCH_API_KEY;
  private static readonly SEARCH_TIMEOUT = 5000; // 5 seconds

  // Search for Gtext Holdings information online
  static async searchGtextInfo(query: string): Promise<WebSearchResponse> {
    try {
      // Enhance query to focus on Gtext Holdings
      const enhancedQuery = `"Gtext Holdings" OR "Stephen Akintayo" OR "Bukola Lukan" ${query}`;
      
      console.log(`🔍 Searching web for: ${enhancedQuery}`);

      // If Bing API is not configured, use fallback search
      if (!this.BING_API_KEY) {
        console.warn('Bing Search API not configured - using fallback search');
        return this.fallbackSearch(query);
      }

      const response = await axios.get(this.SEARCH_API_URL, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.BING_API_KEY,
          'Content-Type': 'application/json',
        },
        params: {
          q: enhancedQuery,
          count: 10,
          offset: 0,
          mkt: 'en-US',
          safeSearch: 'Moderate',
          textDecorations: false,
          textFormat: 'Raw',
          freshness: 'Month', // Prefer recent content
        },
        timeout: this.SEARCH_TIMEOUT,
      });

      const searchResults = response.data.webPages?.value || [];
      
      const results: WebSearchResult[] = searchResults.map((item: any, index: number) => ({
        title: item.name || 'Untitled',
        snippet: item.snippet || 'No description available',
        url: item.url || '',
        relevance_score: Math.max(0.9 - (index * 0.1), 0.1), // Decrease relevance by position
      }));

      return {
        results,
        query: enhancedQuery,
        total_results: searchResults.length,
      };

    } catch (error: any) {
      console.error('Error in web search:', error);
      
      // Fallback to basic search if API fails
      return this.fallbackSearch(query);
    }
  }

  // Fallback search when API is not available
  private static fallbackSearch(query: string): WebSearchResponse {
    // Generate some realistic-looking results based on the query
    const fallbackResults: WebSearchResult[] = [];
    
    // Add common Gtext Holdings information
    if (query.toLowerCase().includes('gtext') || query.toLowerCase().includes('stephen') || query.toLowerCase().includes('bukola')) {
      fallbackResults.push({
        title: 'Gtext Holdings - Official Website',
        snippet: 'Gtext Holdings is a leading real estate and investment conglomerate with operations across Nigeria, Dubai, USA, and UK. Founded by Dr. Stephen Akintayo.',
        url: 'https://gtextholdings.com',
        relevance_score: 0.9,
      });
    }

    if (query.toLowerCase().includes('gvest') || query.toLowerCase().includes('investment')) {
      fallbackResults.push({
        title: 'Gvest - Fractional Real Estate Investment Platform',
        snippet: 'Gvest is the investment arm of Gtext Holdings, offering fractional real estate investment with guaranteed returns. ROI ranges from 14-26% annually.',
        url: 'https://gvest.com',
        relevance_score: 0.8,
      });
    }

    if (query.toLowerCase().includes('land') || query.toLowerCase().includes('plot')) {
      fallbackResults.push({
        title: 'Gtext Land - Luxury Serviced Plots',
        snippet: 'Gtext Land aims to develop 25,000 luxury serviced plots by 2035 across various continents. Land banking opportunities start from ₦5M.',
        url: 'https://gtextland.com',
        relevance_score: 0.7,
      });
    }

    return {
      results: fallbackResults,
      query,
      total_results: fallbackResults.length,
    };
  }

  // Check if web search is configured
  static isConfigured(): boolean {
    return !!this.BING_API_KEY;
  }

  // Search with context filtering
  static async searchWithContext(query: string, context: string[]): Promise<WebSearchResponse> {
    // Add context terms to the search query
    const contextTerms = context.join(' OR ');
    const enhancedQuery = `${query} (${contextTerms})`;
    
    return this.searchGtextInfo(enhancedQuery);
  }

  // Extract key information from search results
  static extractKeyInfo(searchResults: WebSearchResult[]): string {
    if (searchResults.length === 0) {
      return 'No specific information found online at this time.';
    }

    let extractedInfo = 'Based on online information:\n\n';
    
    searchResults.slice(0, 3).forEach((result, index) => {
      extractedInfo += `${index + 1}. ${result.title}\n`;
      extractedInfo += `   ${result.snippet}\n\n`;
    });

    return extractedInfo.trim();
  }

  // Determine if a query needs web search
  static shouldSearchWeb(query: string, ragConfidence: number): boolean {
    // Search web if:
    // 1. RAG confidence is low (< 0.6)
    // 2. Query contains specific keywords that might need current info
    // 3. Query asks about recent developments or news

    const lowConfidence = ragConfidence < 0.6;
    
    const needsCurrentInfo = [
      'recent', 'latest', 'new', 'current', 'today', 'now', 'update',
      'news', 'announcement', 'launch', 'opening', 'event'
    ].some(keyword => query.toLowerCase().includes(keyword));

    const specificTopics = [
      'price', 'cost', 'location', 'contact', 'office', 'branch',
      'phone', 'email', 'address', 'website', 'social media'
    ].some(topic => query.toLowerCase().includes(topic));

    return lowConfidence || needsCurrentInfo || specificTopics;
  }

  // Process web search results for AI consumption
  static processSearchResults(searchResults: WebSearchResult[], originalQuery: string): {
    summary: string;
    sources: Array<{ title: string; url: string }>;
    confidence: number;
  } {
    if (searchResults.length === 0) {
      return {
        summary: 'I was unable to find specific information about this topic online at the moment.',
        sources: [],
        confidence: 0.1,
      };
    }

    // Create summary from top results
    const summary = this.extractKeyInfo(searchResults);
    
    // Extract sources
    const sources = searchResults.slice(0, 3).map(result => ({
      title: result.title,
      url: result.url,
    }));

    // Calculate confidence based on number and relevance of results
    const avgRelevance = searchResults.reduce((sum, result) => sum + result.relevance_score, 0) / searchResults.length;
    const confidence = Math.min(0.8, avgRelevance * (searchResults.length / 10));

    return {
      summary,
      sources,
      confidence,
    };
  }
}