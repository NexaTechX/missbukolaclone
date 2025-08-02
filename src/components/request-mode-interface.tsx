'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, X, Paperclip, User, Calendar, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface RequestModeInterfaceProps {
  onSendRequest: (request: {
    subject: string;
    to: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RequestModeInterface({ 
  onSendRequest, 
  onCancel, 
  isLoading = false 
}: RequestModeInterfaceProps) {
  const [subject, setSubject] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [topic, setTopic] = useState('');

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!to.trim()) {
      newErrors.to = 'Recipient email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      newErrors.to = 'Please enter a valid email address';
    }
    
    if (!message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSendRequest({
      subject: subject.trim(),
      to: to.trim(),
      message: message.trim(),
      priority,
      dueDate: dueDate || undefined
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const generateMessageWithAI = async () => {
    if (!topic.trim() || isGeneratingMessage) return;

    setIsGeneratingMessage(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Generate a professional email message for the following topic: ${topic}. Make it concise, clear, and actionable.`,
          userId: 'request-mode-user',
          requestMode: false,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        // Also generate a subject if we don't have one
        if (!subject.trim()) {
          const subjectResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Generate a short, professional email subject line for: ${topic}`,
              userId: 'request-mode-user',
              requestMode: false,
            }),
          });

          const subjectData = await subjectResponse.json();
          if (subjectData.success) {
            setSubject(subjectData.message.replace(/^["']|["']$/g, '')); // Remove quotes if present
          }
        }
      }
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  return (
    <Card className="mx-2 md:mx-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 max-w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail size={20} className="text-blue-600" />
            <CardTitle className="text-blue-900 text-lg md:text-xl">
              📧 Request Mode
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-blue-600 hover:text-blue-800 p-1"
            disabled={isLoading}
          >
            <X size={16} />
          </Button>
        </div>
        <p className="text-blue-700 text-sm">
          Send a structured request to any team member
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Topic Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-800">
            💡 AI Topic (Optional)
          </label>
          <div className="flex space-x-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe what you want to write about..."
              className="border-blue-300 focus:border-blue-500 flex-1"
              disabled={isLoading || isGeneratingMessage}
            />
            <Button
              onClick={generateMessageWithAI}
              disabled={!topic.trim() || isGeneratingMessage || isLoading}
              className="bg-purple-600 hover:bg-purple-700 px-3"
              size="sm"
            >
              {isGeneratingMessage ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
            </Button>
          </div>
          <p className="text-xs text-blue-600">
            Describe your topic and let AI help write your message
          </p>
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-800">
            Subject *
          </label>
          <Input
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors({...errors, subject: ''});
            }}
            placeholder="Enter request subject..."
            className={`${errors.subject ? 'border-red-500' : 'border-blue-300'} focus:border-blue-500`}
            disabled={isLoading}
          />
          {errors.subject && (
            <p className="text-red-600 text-xs flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.subject}
            </p>
          )}
        </div>

        {/* Recipient Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-800">
            To *
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                if (errors.to) setErrors({...errors, to: ''});
              }}
              placeholder="recipient@company.com"
              className={`${errors.to ? 'border-red-500' : 'border-blue-300'} focus:border-blue-500 pl-10`}
              disabled={isLoading}
            />
          </div>
          {errors.to && (
            <p className="text-red-600 text-xs flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.to}
            </p>
          )}
        </div>

        {/* Priority and Due Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-800">
              Priority
            </label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={isLoading}>
              <SelectTrigger className="border-blue-300 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-800">
              Due Date (Optional)
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-blue-300 focus:border-blue-500 pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-800">
            Message *
          </label>
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors({...errors, message: ''});
            }}
            onKeyPress={handleKeyPress}
            placeholder={isGeneratingMessage ? "AI is generating your message..." : "Describe the task or request in detail..."}
            className={`${errors.message ? 'border-red-500' : 'border-blue-300'} focus:border-blue-500 min-h-[120px]`}
            disabled={isLoading || isGeneratingMessage}
          />
          {isGeneratingMessage && (
            <p className="text-purple-600 text-xs flex items-center">
              <Loader2 size={12} className="mr-1 animate-spin" />
              AI is writing your message...
            </p>
          )}
          {errors.message && (
            <p className="text-red-600 text-xs flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-xs text-blue-600">
            <Paperclip size={14} />
            <span>Attachments coming soon</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !subject.trim() || !to.trim() || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send size={16} />
                  <span>Send Request</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="text-xs text-blue-500 text-center">
          💡 Press Ctrl+Enter to send quickly
        </div>
      </CardContent>
    </Card>
  );
} 