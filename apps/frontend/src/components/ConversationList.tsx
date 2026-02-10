import { useState, useEffect } from 'react';
import { chatClient, type Conversation } from '../client';
import { formatDate } from '../types';

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => void;
  userId: string;
}

export function ConversationList({ selectedId, onSelect, onRefresh, userId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await chatClient.conversations.get({
        query: { userId },
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      const response = await chatClient.conversations[':id'].delete({
        param: { id },
        query: { userId },
      });
      const data = await response.json();
      if (data.success) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (selectedId === id) {
          onSelect(null);
        }
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Conversations</h2>
          <button
            onClick={() => {
              onSelect(null);
              onRefresh();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="New conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <div className="py-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group flex items-start gap-3 px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all ${
                  selectedId === conv.id
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedId === conv.id ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <svg className={`w-4 h-4 ${selectedId === conv.id ? 'text-gray-300' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedId === conv.id ? 'text-white' : 'text-gray-900'}`}>
                    {conv.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${selectedId === conv.id ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(conv.updatedAt)}
                    </span>
                    {conv.lastAgentType && (
                      <>
                        <span className={`text-xs ${selectedId === conv.id ? 'text-gray-500' : 'text-gray-400'}`}>·</span>
                        <span className={`text-xs capitalize ${selectedId === conv.id ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conv.lastAgentType.toLowerCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
                    selectedId === conv.id
                      ? 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'
                      : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
