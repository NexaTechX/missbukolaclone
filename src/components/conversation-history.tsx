'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Filter, Calendar, User, MessageSquare, X, RefreshCw } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

interface ConversationHistoryProps {
  currentUser: {
    id: string;
    name: string;
    department: string;
    role: string;
  };
  onClose?: () => void;
}

interface ConversationLog {
  id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  request_mode_enabled: boolean;
  task_generated?: any;
  webhook_sent: boolean;
  webhook_response?: any;
  created_at: string;
  updated_at: string;
}

export function ConversationHistory({ currentUser, onClose }: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<ConversationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'request_mode' | 'regular'>('all');
  const [selectedConversation, setSelectedConversation] = useState<ConversationLog | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/chat/history?userId=${currentUser.id}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);
      } else {
        setError(data.error || 'Failed to fetch conversation history');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.ai_response.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterMode === 'all' ||
      (filterMode === 'request_mode' && conv.request_mode_enabled) ||
      (filterMode === 'regular' && !conv.request_mode_enabled);

    return matchesSearch && matchesFilter;
  });

  const handleRefresh = () => {
    fetchConversations();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const formatMessage = (message: string) => {
    if (message.length > 100) {
      return message.substring(0, 100) + '...';
    }
    return message;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5" />
            Conversation History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex h-[calc(90vh-120px)]">
            {/* Left Panel - Conversation List */}
            <div className="w-1/2 border-r overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterMode} onValueChange={(value) => setFilterMode(value as any)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conversations</SelectItem>
                        <SelectItem value="request_mode">Request Mode</SelectItem>
                        <SelectItem value="regular">Regular Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conversation List */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    <p>{error}</p>
                    <Button onClick={fetchConversations} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedConversation?.id === conv.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {formatMessage(conv.user_message)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(conv.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {conv.request_mode_enabled && (
                              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded">
                                Request
                              </span>
                            )}
                            {conv.webhook_sent && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                Sent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Conversation Detail */}
            <div className="w-1/2 overflow-y-auto">
              {selectedConversation ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Conversation Details</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatTimestamp(selectedConversation.created_at)}
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">Your Message</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedConversation.user_message}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">AI Response</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedConversation.ai_response}</p>
                    </div>
                  </div>

                  {/* Task Information */}
                  {selectedConversation.task_generated && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Task Generated</span>
                        {selectedConversation.webhook_sent ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Sent Successfully
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Failed to Send
                          </span>
                        )}
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-sm space-y-1">
                          <p><strong>To:</strong> {selectedConversation.task_generated.to_email}</p>
                          <p><strong>Subject:</strong> {selectedConversation.task_generated.subject}</p>
                          <p><strong>Message:</strong> {selectedConversation.task_generated.message}</p>
                          <p><strong>From:</strong> {selectedConversation.task_generated.from}</p>
                          <p><strong>Requested by:</strong> {selectedConversation.task_generated.requested_by}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhook Response */}
                  {selectedConversation.webhook_response && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Webhook Response</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(selectedConversation.webhook_response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Select a conversation to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 