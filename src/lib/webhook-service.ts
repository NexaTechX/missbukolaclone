import axios from 'axios';
import type { TaskRequest, WebhookResponse } from '@/types';

export class WebhookService {
  private static readonly WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL!;
  private static readonly TIMEOUT = 10000; // 10 seconds

  // Send task to Make.com webhook
  static async sendTaskToMake(task: any): Promise<WebhookResponse> {
    try {
      console.log('Sending task to Make.com:', task);

      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'Bukola-AI-Clone/1.0'
      };

      const response = await axios.post(
        this.WEBHOOK_URL,
        task,
        {
          timeout: this.TIMEOUT,
          headers
        }
      );

      console.log('Make.com response:', response.data);

      return {
        success: true,
        taskId: response.data?.taskId || response.data?.id || `task_${Date.now()}`,
        message: response.data?.message || 'Task sent successfully to Make.com',
      };

    } catch (error: any) {
      console.error('Error sending task to Make.com:', error);

      let errorMessage = 'Failed to send task to automation system';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - automation system may be busy';
      } else if (error.response) {
        errorMessage = `Automation system error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
      } else if (error.request) {
        errorMessage = 'Cannot connect to automation system - please check network connection';
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }
  }

  // Validate webhook URL configuration
  static validateConfiguration(): boolean {
    if (!this.WEBHOOK_URL) {
      console.error('MAKE_WEBHOOK_URL is not configured');
      return false;
    }

    try {
      new URL(this.WEBHOOK_URL);
      return true;
    } catch (error) {
      console.error('Invalid MAKE_WEBHOOK_URL format:', error);
      return false;
    }
  }

  // Send test webhook to verify connectivity
  static async testWebhook(): Promise<WebhookResponse> {
    const testTask = {
      to_email: 'hr@gtextholdings.com',
      subject: 'Test Connection',
      message: 'Test connection to Make.com webhook',
      from: 'Bukola Lukan AI',
      requested_by: 'system_test@gtextholdings.com'
    };

    return this.sendTaskToMake(testTask);
  }

  // Send notification webhook (for important system events)
  static async sendNotification(data: {
    type: 'error' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    userId?: string;
    metadata?: any;
  }): Promise<WebhookResponse> {
    try {
      const notificationPayload = {
        notification_type: data.type,
        title: data.title,
        message: data.message,
        user_id: data.userId,
        metadata: data.metadata,
        timestamp: new Date().toISOString(),
        source: 'bukola_ai_system'
      };

      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'Bukola-AI-Clone/1.0',
        'X-Notification': 'true'
      };

      const response = await axios.post(
        this.WEBHOOK_URL,
        notificationPayload,
        {
          timeout: this.TIMEOUT,
          headers
        }
      );

      return {
        success: true,
        message: 'Notification sent successfully',
        taskId: response.data?.id
      };

    } catch (error: any) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        message: 'Failed to send notification',
        error: error.message
      };
    }
  }

  // Batch send multiple tasks (for bulk operations)
  static async sendBatchTasks(tasks: any[]): Promise<{
    successful: number;
    failed: number;
    results: WebhookResponse[];
  }> {
    const results: WebhookResponse[] = [];
    let successful = 0;
    let failed = 0;

    // Process tasks in parallel with a reasonable concurrency limit
    const BATCH_SIZE = 5;
    
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(task => 
        this.sendTaskToMake(task)
          .then(result => {
            if (result.success) successful++;
            else failed++;
            return result;
          })
          .catch(error => {
            failed++;
            return {
              success: false,
              message: 'Batch processing error',
              error: error.message
            } as WebhookResponse;
          })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid overwhelming the webhook
      if (i + BATCH_SIZE < tasks.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return { successful, failed, results };
  }

  // Retry failed webhook with exponential backoff
  static async retryWebhook(
    task: any, 
    maxRetries: number = 3
  ): Promise<WebhookResponse> {
    let lastError: WebhookResponse | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Webhook attempt ${attempt}/${maxRetries} for task:`, task.task);
        
        const result = await this.sendTaskToMake(task);
        
        if (result.success) {
          console.log(`Webhook succeeded on attempt ${attempt}`);
          return result;
        }
        
        lastError = result;
        
        // Don't retry on client errors (4xx), only on server errors (5xx) or network issues
        if (result.error && result.error.includes('4')) {
          console.log('Client error detected, not retrying');
          break;
        }

      } catch (error: any) {
        lastError = {
          success: false,
          message: `Retry attempt ${attempt} failed`,
          error: error.message
        };
      }

      // Exponential backoff: wait 2^attempt seconds before retry
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return lastError || {
      success: false,
      message: 'All retry attempts failed',
      error: 'Maximum retries exceeded'
    };
  }
}