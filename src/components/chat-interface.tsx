'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { formatTimestamp, formatTaskPriority } from '@/lib/utils';
import { EmailPrompt } from '@/components/email-prompt';
import { RequestModeInterface } from '@/components/request-mode-interface';
import { Send, User, Bot, CheckCircle, AlertCircle, Clock, Zap, Crown, Briefcase, Upload, History } from 'lucide-react';
import Image from 'next/image';
import type { AppState, TaskRequest } from '@/types';
import { DocumentUpload } from '@/components/document-upload';
import { ConversationHistory } from '@/components/conversation-history';

interface Message {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: string;
  confidence?: number;
  sources?: Array<{
    title: string;
    type: string;
    department?: string;
  }>;
  taskGenerated?: TaskRequest;
  webhookSent?: boolean;
  executiveDecision?: {
    isDecision: boolean;
    actionRequired: boolean;
    urgency: 'low' | 'medium' | 'high' | 'immediate';
  };
}

interface ChatInterfaceProps {
  currentUser: {
    id: string;
    name: string;
    department: string;
    role: string;
  };
}

export function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestMode, setRequestMode] = useState(false);
  const [pendingEmailRequest, setPendingEmailRequest] = useState<{
    assignee: string;
    taskDescription: string;
    originalMessage: string;
  } | null>(null);
  const [showRequestModeInterface, setShowRequestModeInterface] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on component mount
      useEffect(() => {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        message: `Hello. I'm Bukola Lukan, Group Chief Operations Officer of Gtext Holdings. How can I assist you today?`,
        timestamp: new Date().toISOString(),
        confidence: 1.0,
      };
      setMessages([welcomeMessage]);
    }, [currentUser.name]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          userId: currentUser.id,
          requestMode,
          userInfo: {
            name: currentUser.name,
            department: currentUser.department,
            role: currentUser.role,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if email is needed for task assignment
        if (data.requestMode?.needsRecipientEmail) {
          setPendingEmailRequest({
            assignee: data.requestMode.needsRecipientEmail.assignee,
            taskDescription: data.requestMode.needsRecipientEmail.taskDescription,
            originalMessage: data.requestMode.needsRecipientEmail.originalMessage
          });
        }

        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          message: data.message,
          timestamp: data.timestamp,
          confidence: data.confidence,
          sources: data.sources,
          taskGenerated: data.requestMode?.taskGenerated,
          webhookSent: data.requestMode?.webhookSent,
          executiveDecision: data.executiveDecision,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          type: 'ai',
          message: data.message || 'I apologize, but I\'m experiencing technical difficulties. Please try again or contact IT support.',
          timestamp: new Date().toISOString(),
          confidence: 0,
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'ai',
        message: 'I\'m currently unable to process your request. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
        confidence: 0,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmailSubmit = async (email: string) => {
    if (!pendingEmailRequest) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/complete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalMessage: pendingEmailRequest.originalMessage,
          userId: currentUser.id,
          assigneeName: pendingEmailRequest.assignee,
          assigneeEmail: email,
          userInfo: currentUser
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add task completion message
        const taskMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          message: `✅ Task has been assigned to ${pendingEmailRequest.assignee} (${email}) and sent to the automation system.`,
          timestamp: new Date().toISOString(),
          confidence: 1.0,
          taskGenerated: data.task,
        };
        
        setMessages(prev => [...prev, taskMessage]);
      } else {
        throw new Error('Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task with email:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        message: "Failed to complete the task assignment. Please try again.",
        timestamp: new Date().toISOString(),
        confidence: 0,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setPendingEmailRequest(null);
      setIsLoading(false);
    }
  };

  const handleEmailCancel = () => {
    setPendingEmailRequest(null);
    
    // Add cancellation message
    const cancelMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      message: "Task assignment cancelled. Let me know if you'd like to try again with a different approach.",
      timestamp: new Date().toISOString(),
      confidence: 1.0,
    };
    
    setMessages(prev => [...prev, cancelMessage]);
  };

  const handleRequestModeSubmit = async (request: {
    subject: string;
    to: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
  }) => {
    setIsLoading(true);
    setShowRequestModeInterface(false);

    try {
      // Create a structured message from the request form
      const structuredMessage = `Subject: ${request.subject}\nTo: ${request.to}\nPriority: ${request.priority}${request.dueDate ? `\nDue Date: ${request.dueDate}` : ''}\n\nMessage:\n${request.message}`;

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        type: 'user',
        message: structuredMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          userId: currentUser.id,
          requestMode: true,
          userInfo: {
            name: currentUser.name,
            department: currentUser.department,
            role: currentUser.role,
          },
          emailData: {
            to_email: request.to,
            subject: request.subject,
            message: request.message
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          message: data.message,
          timestamp: new Date().toISOString(),
          confidence: data.confidence,
          sources: data.sources,
          taskGenerated: data.requestMode?.taskGenerated,
          webhookSent: data.requestMode?.taskGenerated ? true : false,
          executiveDecision: data.executiveDecision,
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'ai',
        message: 'I apologize, but there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestModeCancel = () => {
    setShowRequestModeInterface(false);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 md:mb-6`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 md:space-x-3 max-w-full md:max-w-4xl w-full`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-100 text-blue-600' 
              : 'executive-gradient text-white'
          }`}>
            {isUser ? <User size={16} className="md:w-5 md:h-5" /> : <Bot size={16} className="md:w-5 md:h-5" />}
          </div>
          
          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 md:space-y-2 max-w-[85%] md:max-w-none`}>
            {/* Message Bubble */}
            <div className={`relative px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-sm text-sm md:text-base ${
              isUser 
                ? 'bg-blue-600 text-white ml-2 md:ml-4' 
                : 'executive-card mr-2 md:mr-4'
            }`}>
              <div className="executive-text leading-relaxed">
                {message.message}
              </div>
              
              {/* Executive Decision Indicator */}
              {!isUser && message.executiveDecision?.isDecision && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">Executive Decision</span>
                    {message.executiveDecision.urgency !== 'low' && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        formatTaskPriority(message.executiveDecision.urgency).bgColor
                      } ${formatTaskPriority(message.executiveDecision.urgency).color}`}>
                        {formatTaskPriority(message.executiveDecision.urgency).label}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Task Generated (Request Mode) */}
            {!isUser && message.taskGenerated && (
              <Card className="mr-2 md:mr-4 bg-amber-50 border-amber-200 max-w-full">
                <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                  <CardTitle className="text-xs md:text-sm flex items-center space-x-2">
                    <Zap size={14} className="text-amber-600 md:w-4 md:h-4" />
                    <span>Task Generated</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 md:px-6 pb-3 md:pb-6">
                  <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                    <div><strong>To:</strong> {message.taskGenerated.to_email}</div>
                    <div><strong>Subject:</strong> {message.taskGenerated.subject}</div>
                    <div><strong>Message:</strong> {message.taskGenerated.message}</div>
                    <div><strong>From:</strong> {message.taskGenerated.from}</div>
                    <div><strong>Requested by:</strong> {message.taskGenerated.requested_by}</div>
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-amber-200">
                      {message.webhookSent ? (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-green-700">Sent to automation system</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="text-red-600" />
                          <span className="text-red-700">Failed to send to automation system</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Sources */}
            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mr-2 md:mr-4 text-xs text-gray-500 space-y-1 max-w-full overflow-hidden">
                <div className="overflow-x-auto">
                  <span>Sources: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {message.sources.map((source, index) => (
                      <span key={index} className={`inline-block px-2 py-1 rounded text-xs whitespace-nowrap ${
                        source.type === 'web_search' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {source.title} ({source.type === 'web_search' ? 'online' : source.type})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Timestamp */}
            <div className={`text-xs text-gray-500 ${isUser ? 'mr-2 md:mr-4' : 'ml-2 md:ml-4'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="executive-gradient text-white p-3 md:p-4 shadow-lg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
        </div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Bukola's Profile Image */}
            <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
              <Image
                src="/Bukky.jpeg"
                alt="Bukola Lukan"
                width={56}
                height={56}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold truncate flex items-center gap-2">
                Bukola Lukan AI
                <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
              </h1>
              <p className="text-blue-100 text-xs md:text-sm truncate flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Group Chief Operations Officer - Digital Clone
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-xs md:text-sm">
              <div className="font-medium truncate">{currentUser.name}</div>
              <div className="text-blue-100 truncate">{currentUser.department} - {currentUser.role}</div>
            </div>
            <div className="flex items-center gap-2">
              {/* Document Upload Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDocumentUpload(true)}
                className="text-white hover:bg-white/20"
                title="Upload Document"
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              {/* Conversation History Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversationHistory(true)}
                className="text-white hover:bg-white/20"
                title="View History"
              >
                <History className="w-4 h-4" />
              </Button>
              
              {/* Request Mode Switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm whitespace-nowrap">Request Mode</span>
                <Switch
                  checked={requestMode}
                  onCheckedChange={(checked) => {
                    setRequestMode(checked);
                    if (checked) {
                      setShowRequestModeInterface(true);
                    }
                  }}
                  className="data-[state=checked]:bg-blue-300"
                />
              </div>
            </div>
          </div>
        </div>
        
        {requestMode && (
          <div className="mt-2 p-2 bg-blue-800/50 rounded text-xs md:text-sm">
            <strong>Request Mode Active:</strong> All messages will be interpreted as tasks and sent to the automation system.
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4">
        {messages.map(renderMessage)}
        {isLoading && (
          <div className="flex justify-start mb-4 md:mb-6">
            <div className="flex items-start space-x-2 md:space-x-3 max-w-full">
              <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full executive-gradient text-white flex items-center justify-center">
                <Bot size={16} className="md:w-5 md:h-5" />
              </div>
                              <div className="executive-card mr-2 md:mr-4 px-3 md:px-4 py-2 md:py-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600 text-sm md:text-base">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span>Bukola is thinking...</span>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Email Prompt */}
        {pendingEmailRequest && (
          <EmailPrompt
            assignee={pendingEmailRequest.assignee}
            taskDescription={pendingEmailRequest.taskDescription}
            onEmailSubmit={handleEmailSubmit}
            onCancel={handleEmailCancel}
            isLoading={isLoading}
          />
        )}

        {/* Request Mode Interface */}
        {showRequestModeInterface && (
          <RequestModeInterface
            onSendRequest={handleRequestModeSubmit}
            onCancel={handleRequestModeCancel}
            isLoading={isLoading}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <DocumentUpload
          currentUser={currentUser}
          onUploadSuccess={() => {
            // Optionally refresh the chat or show a success message
            console.log('Document uploaded successfully');
          }}
          onClose={() => setShowDocumentUpload(false)}
        />
      )}

      {/* Conversation History Modal */}
      {showConversationHistory && (
        <ConversationHistory
          currentUser={currentUser}
          onClose={() => setShowConversationHistory(false)}
        />
      )}

      {/* Input Area */}
      <div className="border-t bg-white p-3 md:p-4">
        <div className="flex gap-2 md:gap-3">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to Bukola..."
            className="flex-1 min-h-[50px] md:min-h-[60px] max-h-32 resize-none text-sm md:text-base"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            variant="executive"
            size="lg"
            className="px-4 md:px-6 shrink-0"
          >
            <Send size={16} className="md:w-5 md:h-5" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}