import React, { useState, useEffect } from 'react';
import { User, RefreshCw, CheckCircle, AlertCircle, Phone, MessageSquare, Briefcase, Users, Clock, Activity } from 'lucide-react';

function AgentDetailsPanel({ sdkManager, customerProfile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agentData, setAgentData] = useState(null);

  // Default configuration
  const [config] = useState({
    instanceId: 'c6338b37-410e-46b2-90e1-6471228865fd',
    userId: '57cbd439-a3ff-48d4-9292-d91af22335a9',
    includeMetrics: true
  });

  useEffect(() => {
    // Initial fetch
    fetchAgentDetails();

    // Set up auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      fetchAgentDetails(true); // Pass true to indicate silent refresh
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchAgentDetails = async (silentRefresh = false) => {
    // Only show loading state if it's not a silent refresh
    if (!silentRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const API_URL = 'https://5uqastf4d1.execute-api.us-east-1.amazonaws.com/prod/agents/my-queues';

      const requestBody = {
        instanceId: config.instanceId,
        userId: config.userId,
        includeMetrics: config.includeMetrics
      };

      console.log('📊 Fetching agent details:', requestBody);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch agent details');
      }

      console.log('✅ Agent details fetched:', data);
      setAgentData(data);

    } catch (err) {
      console.error('❌ Failed to fetch agent details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'VOICE': return <Phone className="w-4 h-4" />;
      case 'CHAT': return <MessageSquare className="w-4 h-4" />;
      case 'TASK': return <Briefcase className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel) => {
    switch (channel) {
      case 'VOICE': return 'blue';
      case 'CHAT': return 'green';
      case 'TASK': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Agent Details</h2>
              <p className="text-white/90 text-sm">
                Routing Profile • Queues • Real-time Metrics
              </p>
            </div>
          </div>
          <button
            onClick={fetchAgentDetails}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && !agentData && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading agent details...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Error Loading Agent Details</h4>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchAgentDetails}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Data */}
      {agentData && (
        <>
          {/* Agent Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Agent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium mb-1">Full Name</div>
                <div className="text-lg font-bold text-gray-900">{agentData.agent.fullName}</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <div className="text-sm text-indigo-600 font-medium mb-1">Username</div>
                <div className="text-lg font-bold text-gray-900">{agentData.agent.username}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-1">User ID</div>
                <div className="text-sm font-mono text-gray-700">{agentData.agent.userId.slice(0, 18)}...</div>
              </div>
            </div>
          </div>

          {/* Routing Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Routing Profile
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Profile Name</div>
                <div className="text-xl font-bold text-gray-900">{agentData.routingProfile.name}</div>
                {agentData.routingProfile.description && (
                  <div className="text-sm text-gray-600 mt-1">{agentData.routingProfile.description}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">Media Concurrencies</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {agentData.routingProfile.mediaConcurrencies.map((media, idx) => {
                    const color = getChannelColor(media.Channel);
                    return (
                      <div key={idx} className={`bg-${color}-50 border-2 border-${color}-200 rounded-lg p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          {getChannelIcon(media.Channel)}
                          <span className="font-semibold text-gray-900">{media.Channel}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{media.Concurrency}</div>
                        <div className="text-xs text-gray-600">Max Concurrent</div>
                        <div className="text-xs text-gray-500 mt-2">
                          {media.CrossChannelBehavior.BehaviorType === 'ROUTE_CURRENT_CHANNEL_ONLY' 
                            ? 'Current Channel Only' 
                            : media.CrossChannelBehavior.BehaviorType}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Queue Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium mb-1">Total Queues</div>
                <div className="text-3xl font-bold text-gray-900">{agentData.summary.totalQueues}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-orange-600 font-medium mb-1">Contacts Waiting</div>
                <div className="text-3xl font-bold text-gray-900">{agentData.summary.totalContactsWaiting}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-1">Voice Queues</div>
                <div className="text-3xl font-bold text-gray-900">{agentData.summary.channelBreakdown.VOICE || 0}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium mb-1">Chat Queues</div>
                <div className="text-3xl font-bold text-gray-900">{agentData.summary.channelBreakdown.CHAT || 0}</div>
              </div>
            </div>
          </div>

          {/* Queues List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Queue Details ({agentData.queues.length})
            </h3>
            <div className="space-y-3">
              {agentData.queues.map((queue, idx) => {
                const color = getChannelColor(queue.channel);
                return (
                  <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 text-lg">{queue.queueName}</span>
                          <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 rounded text-xs font-medium flex items-center gap-1`}>
                            {getChannelIcon(queue.channel)}
                            {queue.channel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Priority: <strong>{queue.priority}</strong></span>
                          <span>Delay: <strong>{queue.delay}s</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Queue Metrics */}
                    {queue.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">In Queue</div>
                          <div className="text-lg font-bold text-gray-900">{queue.metrics.contactsInQueue}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Oldest Age</div>
                          <div className="text-lg font-bold text-gray-900">{queue.metrics.oldestContactAge}s</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Online</div>
                          <div className="text-lg font-bold text-green-600">{queue.metrics.agentsOnline}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Available</div>
                          <div className="text-lg font-bold text-blue-600">{queue.metrics.agentsAvailable}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">On Contact</div>
                          <div className="text-lg font-bold text-orange-600">{queue.metrics.agentsOnContact}</div>
                        </div>
                      </div>
                    )}

                    {/* Waiting Contacts */}
                    {queue.waitingContacts && queue.waitingContacts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Waiting Contacts ({queue.waitingContacts.length})
                        </div>
                        <div className="space-y-1">
                          {queue.waitingContacts.map((contact, cIdx) => (
                            <div key={cIdx} className="text-xs text-gray-600 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Contact {cIdx + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                <strong>{agentData.message}</strong>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AgentDetailsPanel;
