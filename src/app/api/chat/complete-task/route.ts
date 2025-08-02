import { NextRequest, NextResponse } from 'next/server';
import { BukolaAIService } from '@/lib/ai-service';
import { WebhookService } from '@/lib/webhook-service';
import { DatabaseService, validateSupabaseConfig } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalMessage, userId, assigneeName, assigneeEmail, userInfo } = body;

    if (!originalMessage || !userId || !assigneeName || !assigneeEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate task with email
    const task = await BukolaAIService.completeTaskWithEmail(
      originalMessage,
      userId,
      assigneeName,
      assigneeEmail
    );

    if (!task) {
      return NextResponse.json(
        { error: 'Failed to generate task' },
        { status: 500 }
      );
    }

    // Add user info to task
    if (userInfo) {
      task.requested_by = userInfo.name || userId;
      // You could add more user context here if needed
    }

    // Send to webhook
    try {
      const webhookResponse = await WebhookService.sendTaskToMake(task);
      console.log('✅ Task sent to webhook:', webhookResponse);
    } catch (webhookError) {
      console.error('❌ Webhook failed:', webhookError);
      // Continue even if webhook fails - the task was created successfully
    }

    // Log to database if configured
    if (validateSupabaseConfig()) {
      try {
        await DatabaseService.logConversation({
          user_id: userId,
          user_message: originalMessage,
          ai_response: `Task assigned to ${assigneeName} (${assigneeEmail})`,
          request_mode_enabled: true,
          task_generated: task,
          webhook_sent: true
        });
      } catch (dbError) {
        console.error('Database logging failed:', dbError);
        // Continue even if logging fails
      }
    }

    return NextResponse.json({
      success: true,
      task,
      message: `Task successfully assigned to ${assigneeName}`
    });

  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 