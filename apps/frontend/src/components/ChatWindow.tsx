import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { chatClient, type Conversation, type Message } from '../client';

interface ChatWindowProps {
  conversation: Conversation | null;
  onNewConversation: () => void;
  userId: string;
}

export function ChatWindow({ conversation, onNewConversation, userId }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [routingInfo, setRoutingInfo] = useState<{
    routedTo: string;
    reason: string;
    confidence: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update messages when conversation changes
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
      setRoutingInfo(null);
    } else {
      setMessages([]);
      setRoutingInfo(null);
    }
  }, [conversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversation?.id || '',
      role: 'USER',
      content: userMessage,
      agentType: null,
      toolCalls: null,
      toolResults: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatClient.messages.post({
        message: userMessage,
        conversationId: conversation?.id,
        userId,
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Remove temp message and add real messages
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => !m.id.startsWith('temp-'));
          return [
            ...withoutTemp,
            {
              id: `user-${Date.now()}`,
              conversationId: data.data!.conversationId,
              role: 'USER' as const,
              content: userMessage,
              agentType: null,
              toolCalls: null,
              toolResults: null,
              createdAt: new Date().toISOString(),
            },
            {
              id: `ai-${Date.now()}`,
              conversationId: data.data!.conversationId,
              role: 'ASSISTANT' as const,
              content: data.data!.response,
              agentType: data.data!.routedTo.toUpperCase(),
              toolCalls: null,
              toolResults: null,
              createdAt: data.data!.timestamp,
            },
          ];
        });

        setRoutingInfo({
          routedTo: data.data!.routedTo,
          reason: data.data!.routingReason,
          confidence: data.data!.routingConfidence,
        });

        // Notify parent to refresh conversations
        onNewConversation();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-none px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          {conversation?.title || 'New Conversation'}
        </h1>
        {routingInfo && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span className="capitalize">{routingInfo.routedTo}</span>
            <span className="text-gray-300">·</span>
            <span className="truncate max-w-xs">{routingInfo.reason}</span>
            <span className="text-gray-300">·</span>
            <span>{Math.round(routingInfo.confidence * 100)}%</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900">How can I help you?</h2>
            <p className="mt-1 text-sm text-gray-500">Ask about orders, billing, or general support</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-none px-6 py-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-gray-400 focus:bg-white transition-all text-[15px]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
