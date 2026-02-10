import type { Message } from '../client';
import { formatTime } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'USER';
  const isSystem = message.role === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-gray-500 font-medium">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
          isUser
            ? 'bg-gray-900 text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
        }`}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[11px] ${isUser ? 'text-gray-400' : 'text-gray-400'}`}>
            {formatTime(message.createdAt)}
          </span>
          {!isUser && message.agentType && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              {message.agentType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
