import { useState, useEffect } from 'react';
import { agentClient, type Agent, type AgentCapabilities } from '../client';

interface AgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  support: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  order: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  billing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
};

export function AgentPanel({ isOpen, onClose }: AgentPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<Record<string, AgentCapabilities>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const response = await agentClient.index.get();
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCapabilities = async (type: string) => {
    if (capabilities[type]) return;
    try {
      const response = await agentClient[':type'].capabilities.get({
        param: { type },
      });
      const data = await response.json();
      if (data.success) {
        setCapabilities((prev) => ({ ...prev, [type]: data.data }));
      }
    } catch (error) {
      console.error('Failed to load capabilities:', error);
    }
  };

  const toggleAgent = (type: string) => {
    if (expandedAgent === type) {
      setExpandedAgent(null);
    } else {
      setExpandedAgent(type);
      loadCapabilities(type);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white z-50 shadow-2xl animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agents</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => {
                  const isExpanded = expandedAgent === agent.type;
                  const agentCapabilities = capabilities[agent.type];

                  return (
                    <div
                      key={agent.type}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      <button
                        onClick={() => toggleAgent(agent.type)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                          {AGENT_ICONS[agent.type] || AGENT_ICONS.support}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{agent.name}</p>
                          <p className="text-sm text-gray-500 truncate">{agent.description}</p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                          {agentCapabilities ? (
                            <div className="pt-4 space-y-3">
                              {agentCapabilities.capabilities.map((cap) => (
                                <div key={cap.name} className="bg-white rounded-lg p-3 border border-gray-100">
                                  <p className="font-medium text-sm text-gray-900">{cap.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{cap.description}</p>
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {cap.examples.map((ex) => (
                                      <span
                                        key={ex}
                                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                                      >
                                        "{ex}"
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="pt-4 flex items-center justify-center py-4">
                              <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-none px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Powered by AI. Responses may contain errors.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
