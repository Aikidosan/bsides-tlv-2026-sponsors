import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function AIResearch() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'sponsor_researcher',
      metadata: {
        name: 'Sponsor Research Session',
        description: 'AI-assisted research for BSides TLV sponsors'
      }
    });
    setConversationId(conv.id);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!conversationId) {
      await startConversation();
      return;
    }

    setIsLoading(true);
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const conv = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conv, { role: 'user', content: input });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const whatsappURL = base44.agents.getWhatsAppConnectURL('sponsor_researcher');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                AI Sponsor Research
              </h1>
              <p className="text-gray-600">Get AI-powered insights on Israeli cybersecurity companies</p>
            </div>
          </div>
          <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-green-500 text-green-700 hover:bg-green-50">
              💬 WhatsApp
            </Button>
          </a>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">What I Can Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• Research Israeli cybersecurity companies</li>
                <li>• Find decision-maker contacts</li>
                <li>• Suggest outreach strategies</li>
                <li>• Recommend sponsorship tiers</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Example Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• "Find Israeli cloud security companies"</li>
                <li>• "Who's the CFO at [Company]?"</li>
                <li>• "Suggest outreach for enterprise firms"</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Target Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700">$350,000</p>
              <p className="text-xs text-gray-600 mt-1">Total fundraising target</p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="min-h-[500px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Research Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {!conversationId ? (
              <div className="text-center text-gray-500 mt-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <p className="mb-4">Start a conversation to begin AI-powered research</p>
                <Button onClick={startConversation} className="bg-purple-600 hover:bg-purple-700">
                  Start Research Session
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                <p>Ask me anything about Israeli cybersecurity companies...</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Researching...</p>
                </div>
              </div>
            )}
          </CardContent>

          {conversationId && (
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about companies, contacts, strategies..."
                  className="resize-none"
                  rows={2}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}