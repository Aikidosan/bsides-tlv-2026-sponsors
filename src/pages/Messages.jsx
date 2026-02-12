import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { logActivity } from '../components/ActivityLogger';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, ArrowLeft, Reply } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function Messages() {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
  });

  const sendMutation = useMutation({
    mutationFn: ({ content, parent_message_id }) => 
      base44.entities.Message.create({ 
        content, 
        channel: 'app',
        ...(parent_message_id && { parent_message_id })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setNewMessage('');
      setReplyingTo(null);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMutation.mutate({
        content: newMessage,
        parent_message_id: replyingTo?.id
      });
    }
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
    document.querySelector('input[placeholder*="message"]')?.focus();
  };

  const sortedMessages = [...(messages || [])].reverse();

  // Group messages with their replies
  const messageThreads = sortedMessages.reduce((acc, msg) => {
    if (!msg.parent_message_id) {
      acc.push({ main: msg, replies: [] });
    }
    return acc;
  }, []);

  // Add replies to their parent messages
  sortedMessages.forEach(msg => {
    if (msg.parent_message_id) {
      const parentThread = messageThreads.find(t => t.main.id === msg.parent_message_id);
      if (parentThread) {
        parentThread.replies.push(msg);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Team Messages</h1>
            <p className="text-gray-600">Coordinate with the organizing team</p>
          </div>
        </div>

        {/* Messages Container */}
        <Card className="h-[600px] flex flex-col bg-white">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messageThreads.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messageThreads.map((thread) => (
                <div key={thread.main.id} className="space-y-2">
                  {/* Main Message */}
                  <div className="space-y-1 group">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {thread.main.created_by?.split('@')[0] || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(thread.main.created_date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-gray-900">{thread.main.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(thread.main)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8"
                      >
                        <Reply className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Replies */}
                  {thread.replies.length > 0 && (
                    <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                      {thread.replies.map((reply) => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-xs text-gray-700">
                              {reply.created_by?.split('@')[0] || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(reply.created_date), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 max-w-[80%]">
                            <p className="text-sm text-gray-900">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="border-t p-4">
            {replyingTo && (
              <div className="mb-2 flex items-center gap-2 bg-blue-50 rounded p-2">
                <Reply className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 flex-1">
                  Replying to <strong>{replyingTo.created_by?.split('@')[0]}</strong>: {replyingTo.content.substring(0, 50)}...
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sendMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Integration Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Coming soon:</strong> WhatsApp channel and email integration will be configured via app connectors
          </p>
        </div>
      </div>
    </div>
  );
}