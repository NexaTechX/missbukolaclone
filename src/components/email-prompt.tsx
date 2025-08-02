'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Send, X } from 'lucide-react';

interface EmailPromptProps {
  assignee: string;
  taskDescription: string;
  onEmailSubmit: (email: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmailPrompt({ 
  assignee, 
  taskDescription, 
  onEmailSubmit, 
  onCancel,
  isLoading = false 
}: EmailPromptProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    onEmailSubmit(email.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="mx-2 md:mx-4 bg-blue-50 border-blue-200 max-w-full">
      <CardContent className="p-3 md:p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm md:text-base">
                  Email Required for Task Assignment
                </h4>
                <p className="text-blue-700 text-xs md:text-sm mt-1">
                  Assigning <strong>"{taskDescription}"</strong> to <strong>{assignee}</strong>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-blue-600 hover:text-blue-800 p-1"
              disabled={isLoading}
            >
              <X size={14} />
            </Button>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="assignee-email" className="block text-sm font-medium text-blue-800">
              {assignee}'s Email Address
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="assignee-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={`Enter ${assignee}'s email address`}
                  className={`text-sm md:text-base ${error ? 'border-red-500' : 'border-blue-300'}`}
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                )}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!email.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-3 md:px-4"
              >
                <Send size={14} className="md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-xs text-blue-600">
            💡 This email will be used to notify {assignee} about the task assignment
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 