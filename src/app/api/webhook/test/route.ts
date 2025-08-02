import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@/lib/webhook-service';

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json();

    // Simple admin verification (in production, use proper authentication)
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test webhook connectivity
    const result = await WebhookService.testWebhook();

    return NextResponse.json({
      success: true,
      webhookTest: result,
      configuration: {
        webhookConfigured: WebhookService.validateConfiguration(),
        webhookUrl: process.env.MAKE_WEBHOOK_URL ? '[CONFIGURED]' : '[NOT SET]',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Webhook test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook test failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook test endpoint - POST required',
    requiredFields: ['adminKey'],
  });
}