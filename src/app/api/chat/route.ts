import { NextRequest, NextResponse } from 'next/server';
import { BukolaAIService } from '@/lib/ai-service';
import { WebhookService } from '@/lib/webhook-service';
import { DatabaseService, validateSupabaseConfig } from '@/lib/supabase';
import type { TaskRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check environment configuration
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured',
          message: 'I apologize, but my AI capabilities are not configured. Please contact IT support to set up the OpenAI API key.'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, userId, requestMode = false, userInfo, emailData } = body;

    // Validate required fields
    if (!message || !userId) {
      return NextResponse.json(
        { success: false, error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Validate email if emailData is provided
    if (emailData && emailData.to_email) {
      if (!BukolaAIService.validateEmail(emailData.to_email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email address' },
          { status: 400 }
        );
      }
    }

    // Update user session if userInfo provided (only if Supabase is configured)
    if (userInfo && validateSupabaseConfig()) {
      try {
        await DatabaseService.updateUserSession({
          user_id: userId,
          employee_name: userInfo.name,
          department: userInfo.department,
          role: userInfo.role,
        });
      } catch (error) {
        console.error('Error updating user session:', error);
        // Continue processing even if session update fails
      }
    }

    // Increment interaction count (only if Supabase is configured)
    if (validateSupabaseConfig()) {
      try {
        await DatabaseService.incrementInteractionCount(userId);
      } catch (error) {
        console.error('Error incrementing interaction count:', error);
      }
    }

    // Generate AI response
    const aiResponse = await BukolaAIService.generateResponse(
      message,
      userId,
      requestMode,
      emailData
    );

    let webhookResponse = null;
    let taskGenerated: TaskRequest | undefined;

    // Handle Request Mode - send webhook if task generated
    if (requestMode && aiResponse.requestMode?.taskGenerated) {
      taskGenerated = aiResponse.requestMode.taskGenerated;
      
      // Validate webhook configuration
      if (WebhookService.validateConfiguration()) {
        try {
          webhookResponse = await WebhookService.retryWebhook(taskGenerated, 2);
          
          // Send notification if webhook failed
          if (!webhookResponse.success) {
            await WebhookService.sendNotification({
              type: 'error',
              title: 'Task Webhook Failed',
              message: `Failed to send task: ${taskGenerated.message || taskGenerated.subject}`,
              userId,
              metadata: { task: taskGenerated, error: webhookResponse.error }
            });
          }
        } catch (error) {
          console.error('Webhook error:', error);
          webhookResponse = {
            success: false,
            message: 'Webhook service unavailable',
            error: 'Service error'
          };
        }
      } else {
        webhookResponse = {
          success: false,
          message: 'Webhook not configured',
          error: 'Configuration error'
        };
      }
    }

    // Log conversation to database (only if Supabase is configured)
    if (validateSupabaseConfig()) {
      try {
        await DatabaseService.logConversation({
          user_id: userId,
          user_message: message,
          ai_response: aiResponse.message,
          request_mode_enabled: requestMode,
          task_generated: taskGenerated || null,
          webhook_sent: !!webhookResponse?.success,
          webhook_response: webhookResponse || null,
        });
      } catch (error) {
        console.error('Error logging conversation:', error);
        // Continue processing even if logging fails
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: aiResponse.message,
      confidence: aiResponse.confidence,
      sources: aiResponse.sources.map(source => ({
        title: source.metadata.source,
        type: source.metadata.type,
        department: source.metadata.department,
      })),
      executiveDecision: aiResponse.executiveDecision,
      requestMode: {
        enabled: requestMode,
        taskGenerated: taskGenerated,
        webhookSent: !!webhookResponse?.success,
        webhookResponse: webhookResponse,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'I apologize, but I\'m experiencing technical difficulties. Please contact IT support.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        ai: !!process.env.OPENAI_API_KEY,
        database: validateSupabaseConfig(),
        webhook: WebhookService.validateConfiguration(),
      },
      configuration: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        openai_key: !!process.env.OPENAI_API_KEY,
        webhook_url: !!process.env.MAKE_WEBHOOK_URL,
        web_search: !!process.env.BING_SEARCH_API_KEY,
      },
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service check failed' },
      { status: 500 }
    );
  }
}