import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
}

// Create clients with fallback values for development
const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeAnonKey = supabaseAnonKey || 'placeholder-key';
const safeServiceKey = supabaseServiceKey || 'placeholder-service-key';

// Use service role key for all operations (client and server)
export const supabase = createClient<Database>(safeSupabaseUrl, safeServiceKey);

// Keep admin client for backward compatibility
export const supabaseAdmin = createClient<Database>(safeSupabaseUrl, safeServiceKey);

// Environment validation helper
export function validateSupabaseConfig(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

// Database helper functions
export class DatabaseService {
  // Log conversation interactions
  static async logConversation(data: {
    user_id: string;
    user_message: string;
    ai_response: string;
    request_mode_enabled: boolean;
    task_generated?: any;
    webhook_sent: boolean;
    webhook_response?: any;
  }) {
    if (!validateSupabaseConfig()) {
      console.warn('Supabase not configured - skipping conversation logging');
      return null;
    }

    const { data: result, error } = await supabaseAdmin
      .from('conversation_logs')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error logging conversation:', error);
      throw error;
    }

    return result;
  }

  // Get conversation history for a user
  static async getConversationHistory(userId: string, limit: number = 50) {
    if (!validateSupabaseConfig()) {
      console.warn('Supabase not configured - returning empty conversation history');
      return [];
    }

    const { data, error } = await supabase
      .from('conversation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }

    return data;
  }

  // Store or update user session
  static async updateUserSession(data: {
    user_id: string;
    employee_name: string;
    department: string;
    role: string;
  }) {
    if (!validateSupabaseConfig()) {
      console.warn('Supabase not configured - skipping user session update');
      return null;
    }

    const { data: result, error } = await supabaseAdmin
      .from('user_sessions')
      .upsert([{
        ...data,
        session_start: new Date().toISOString(),
        total_interactions: 1,
      }], {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user session:', error);
      throw error;
    }

    return result;
  }

  // Increment interaction count for active session
  static async incrementInteractionCount(userId: string) {
    if (!validateSupabaseConfig()) {
      console.warn('Supabase not configured - skipping interaction count increment');
      return 0;
    }

    const { data, error } = await supabaseAdmin
      .rpc('increment_interaction_count', { user_id: userId });

    if (error) {
      console.error('Error incrementing interaction count:', error);
      throw error;
    }

    return data;
  }

  // Get documents for RAG system
  static async getDocuments(filters?: {
    type?: string;
    department?: string;
    access_level?: string;
    is_active?: boolean;
  }) {
    if (!validateSupabaseConfig()) {
      console.warn('Supabase not configured - returning fallback documents');
      return this.getFallbackDocuments();
    }

    let query = supabase
      .from('document_store')
      .select('*');

    if (filters) {
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.department) query = query.eq('department', filters.department);
      if (filters.access_level) query = query.eq('access_level', filters.access_level);
      if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query.order('last_updated', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }

    return data;
  }

  // Store new document
  static async storeDocument(data: {
    title: string;
    content: string;
    type: 'policy' | 'procedure' | 'guideline' | 'memo' | 'report';
    department?: string;
    author: string;
    access_level: 'public' | 'management' | 'executive';
  }) {
    const { data: result, error } = await supabaseAdmin
      .from('document_store')
      .insert([{
        ...data,
        date_created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing document:', error);
      throw error;
    }

    return result;
  }

  // Search documents by content (full-text search)
  static async searchDocuments(query: string, limit: number = 10) {
    if (!validateSupabaseConfig()) {
      console.warn('Supabase not configured - using fallback documents for search');
      const fallbackDocs = this.getFallbackDocuments();
      // Simple text search through fallback documents
      return fallbackDocs.filter(doc => 
        doc.content.toLowerCase().includes(query.toLowerCase()) ||
        doc.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    }

    try {
      // Sanitize the query to prevent SQL syntax errors
      const sanitizedQuery = this.sanitizeSearchQuery(query);
      
      const { data, error } = await supabase
        .from('document_store')
        .select('*')
        .textSearch('search_vector', sanitizedQuery)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('Error searching documents:', error);
        // Fallback to simple text search if full-text search fails
        return this.fallbackTextSearch(sanitizedQuery, limit);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      return this.fallbackTextSearch(query, limit);
    }
  }

  private static sanitizeSearchQuery(query: string): string {
    // Remove special characters that cause SQL syntax errors
    return query
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .toLowerCase();
  }

  private static async fallbackTextSearch(query: string, limit: number) {
    try {
      const sanitizedQuery = this.sanitizeSearchQuery(query);
      
      const { data, error } = await supabase
        .from('document_store')
        .select('*')
        .or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%`)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('Fallback search also failed:', error);
        return this.getFallbackDocuments();
      }

      return data || [];
    } catch (error) {
      console.error('Error in fallback search:', error);
      return this.getFallbackDocuments();
    }
  }

  // Get analytics data for dashboard
  static async getAnalytics(timeRange: '1d' | '7d' | '30d' = '7d') {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    const [conversationsResult, sessionsResult] = await Promise.all([
      supabase
        .from('conversation_logs')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('user_sessions')
        .select('*')
        .gte('session_start', startDate.toISOString())
    ]);

    return {
      conversations: conversationsResult.data || [],
      sessions: sessionsResult.data || [],
      totalInteractions: conversationsResult.data?.length || 0,
      uniqueUsers: new Set(sessionsResult.data?.map(s => s.user_id) || []).size,
      requestModeUsage: conversationsResult.data?.filter(c => c.request_mode_enabled).length || 0,
    };
  }

  // Fallback documents when Supabase is not configured
  static getFallbackDocuments() {
    return [
      {
        id: 'fallback-1',
        title: 'Gtext Holdings Leadership Philosophy and Core Values',
        content: 'Bukola Lukan Leadership Mantra: "Bukola, lead right, and the people will follow." Leadership Philosophy: A confident woman radiates quiet strength—not through volume, but through clarity, emotional intelligence, and decisiveness. Loyalty must be modeled from the top before it can be expected from others. Leadership is not about aggression; it is about assertiveness. We are privileged shepherds, entrusted with guiding people toward purpose. Core Values: Energy, Excellence, Integrity, Innovation, Punctuality, Proactiveness, Good Leadership. Personality Traits for all leaders: Selflessness, Positivity, Innovation & Creativity, Integrity, Excellence, Loyalty.',
        type: 'policy',
        department: 'Operations',
        author: 'Bukola Lukan',
        access_level: 'public',
        date_created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      },
      {
        id: 'fallback-2',
        title: 'Gtext Holdings Leadership and Subsidiaries Overview',
        content: 'Gtext Holdings Leadership: Stephen Akintayo is our visionary Chairman and founder, leading our global expansion. As GCOO, I work directly with Stephen to execute our strategic vision across all subsidiaries. Gtext Holdings operates globally with subsidiaries across Nigeria, Dubai, Doha, and USA: 1) Stephen Akintayo Foundation - Educational empowerment and investment coaching, helping people build wealth through knowledge 2) Gtext and Associates - Agent network raising 100,000 billionaires yearly through real estate partnerships 3) Gtext Suites - Dubai/Doha residency programs, golden visa, zero VAT properties 4) Gtext Land - Goal of 25,000 luxury serviced plots by 2035 across 200 estates, land banking from ₦5M 5) Gtext Homes - Luxury smart/green estates, largest global developer vision 6) Gtext Farms - Agribusiness, food security, wealth creation 7) Gtext Media - Content creation to increase visibility and property sales 8) Gvest - Fractional real estate investment platform, target 200,000 investors by 2027, ROI 14-26% annually. Stephen Akintayo leads with vision, and I ensure operational excellence across all these ventures.',
        type: 'procedure',
        department: 'Operations',
        author: 'Bukola Lukan',
        access_level: 'public',
        date_created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      },
      {
        id: 'fallback-3',
        title: 'Executive Decision Framework - Bukola Lukan Style',
        content: 'Decision-making approach aligned with Bukola Lukan philosophy: 1) Make decisive calls based on logic, performance data, and organizational goals 2) Do not micromanage but always follow up for accountability 3) Focus on solutions, not blame 4) Align all decisions with Chairman vision and group strategy 5) Prioritize people development and operational excellence. Emergency response: Remain calm, diplomatic, factual. Avoid blame, focus on solutions, end with actionable resolution steps. For underperformance: "Take ownership, be responsible" - clear, supportive accountability.',
        type: 'policy',
        department: 'Operations',
        author: 'Bukola Lukan',
        access_level: 'executive',
        date_created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      },
      {
        id: 'fallback-4',
        title: 'Communication Standards and Response Templates',
        content: 'Bukola Lukan Communication Style: Speak with calm confidence and quiet authority. Use phrases: "Let us lead right", "Take ownership, be responsible". Do not confuse noise for impact - focus on execution, consistency, integrity. Address people warmly but with clear expectations. End with actionable next steps and timelines. Response Patterns: For delays/problems - address proactively, request specifics with deadlines. For new team members - welcome warmly, set clear expectations about growth and impact. For meetings - focus on purpose, value-add, alignment with vision. For wins - acknowledge process and people, reinforce that success comes from leading right.',
        type: 'guideline',
        department: 'Operations',
        author: 'Bukola Lukan',
        access_level: 'management',
        date_created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        is_active: true,
      },
    ];
  }
}