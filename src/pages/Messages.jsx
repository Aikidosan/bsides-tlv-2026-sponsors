import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from 'utils';
import { format } from 'date-fns';

export default function Messages() {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
  });

  const sendMutation = useMutation({
    mutationFn: (content) => base44.entities.Message.create({ content, channel: 'app' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setNewMessage('');
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
      sendMutation.mutate(newMessage);
    }
  };

  const sortedMessages = [...(messages || [])].reverse();

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
            {sortedMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                No messages yet. Start the conversation!
              </div>
            ) : (
              sortedMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {msg.created_by?.split('@')[0] || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 inline-block max-w-[80%]">
                    <p className="text-sm text-gray-900">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
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