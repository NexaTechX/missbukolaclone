import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasWebhook: !!process.env.MAKE_WEBHOOK_URL,
    hasAdminSecret: !!process.env.ADMIN_SECRET,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
} 