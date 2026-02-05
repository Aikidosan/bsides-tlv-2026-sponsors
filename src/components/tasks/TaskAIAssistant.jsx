import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function TaskAIAssistant({ task, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, [task]);

  useEffect(() => {
    if (!conversation) return;
    
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages);
    });

    return () => unsubscribe();
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: "task_assistant",
      metadata: {
        name: `Help with: ${task.title}`,
        task_id: task.id
      }
    });
    setConversation(conv);
    
    // Send initial message about the task
    await base44.agents.addMessage(conv, {
      role: "user",
      content: `I need help completing this task: "${task.title}". ${task.description ? `Details: ${task.description}.` : ''} ${task.deadline ? `Deadline: ${task.deadline}.` : ''} Can you help me plan how to complete this?`
    });
  };

  const handleSend = async (customInput) => {
    const messageContent = customInput || input;
    if (!messageContent || typeof messageContent !== 'string' || !messageContent.trim() || !conversation) return;
    
    setIsLoading(true);
    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: messageContent
      });
      setInput('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={`${isFullScreen ? 'max-w-6xl h-[90vh]' : 'max-w-2xl h-[600px]'} flex flex-col`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Task Assistant
              </DialogTitle>
              <p className="text-sm text-gray-600">Getting help with: {task.title}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="shrink-0"
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <>
                    <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                    {msg.content?.includes('Can you confirm') && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          onClick={() => handleSend('Yes, please proceed with those searches')}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Yes, proceed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInput('No, let me provide different search terms')}
                        >
                          No, modify
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for help or guidance..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 shrink-0"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}