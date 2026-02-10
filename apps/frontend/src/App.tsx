import { useState } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { ConversationList } from './components/ConversationList';
import { AgentPanel } from './components/AgentPanel';
import { chatClient, type Conversation } from './client';

const DEMO_USERS = [
  { id: 'user_alice', name: 'Alice Johnson' },
  { id: 'user_bob', name: 'Bob Smith' },
  { id: 'user_carol', name: 'Carol Davis' },
];

function App() {
  const [selectedUserId, setSelectedUserId] = useState('user_alice');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectConversation = async (id: string | null) => {
    setSelectedConversationId(id);
    if (!id) {
      setSelectedConversation(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await chatClient.conversations[':id'].get({
        param: { id },
        query: { userId: selectedUserId },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setSelectedConversation(data.data);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshConversations = async () => {
    if (selectedConversationId) {
      const response = await chatClient.conversations[':id'].get({
        param: { id: selectedConversationId },
        query: { userId: selectedUserId },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setSelectedConversation(data.data);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200">
        <ConversationList
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          onRefresh={handleRefreshConversations}
          userId={selectedUserId}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex-none flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* User Selector */}
            <div className="relative">
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setSelectedConversationId(null);
                  setSelectedConversation(null);
                }}
                className="appearance-none bg-gray-100 border border-gray-200 text-gray-900 text-sm font-medium px-3 py-1.5 pr-8 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:border-gray-400"
              >
                {DEMO_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Chat</span>
              {selectedConversationId && (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-900 font-medium truncate max-w-xs">
                    {selectedConversation?.title || 'Conversation'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => setShowAgentPanel(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Agents</span>
          </button>
        </div>

        {/* Chat Area */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">Loading conversation...</p>
            </div>
          </div>
        ) : (
          <ChatWindow
            conversation={selectedConversation}
            onNewConversation={handleRefreshConversations}
            userId={selectedUserId}
          />
        )}
      </div>

      {/* Agent Panel */}
      <AgentPanel isOpen={showAgentPanel} onClose={() => setShowAgentPanel(false)} />
    </div>
  );
}

export default App;
