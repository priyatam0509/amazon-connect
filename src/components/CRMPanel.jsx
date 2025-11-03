import React, { useState, useEffect } from 'react';
import { 
  User, ShoppingCart, Ticket, Activity, Users, Star, 
  DollarSign, Smile, Frown, Meh, CheckCircle, FileText,
  Package, Calendar, Tag
} from 'lucide-react';
import mockCRMData from '../data/mockCRMData';
import CustomerOverview from './crm/CustomerOverview';
import TasksManager from './crm/TasksManager';
import CaseManager from './crm/CaseManager';
import InteractionTimeline from './crm/InteractionTimeline';

/**
 * CRMPanel - Main CRM Integration Component
 * Orchestrates all CRM features: 360° view, tasks, cases, timeline, sentiment
 */
function CRMPanel({ sdkManager, customerProfile }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sentiment, setSentiment] = useState('positive');
  const [sentimentScore, setSentimentScore] = useState(85);
  const [customerData] = useState(mockCRMData);

  // Simulate real-time sentiment analysis updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newScore = Math.floor(Math.random() * 20) + 70; // 70-90
      setSentimentScore(newScore);
      if (newScore >= 80) setSentiment('positive');
      else if (newScore >= 60) setSentiment('neutral');
      else setSentiment('negative');
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getSentimentIcon = (sentimentType) => {
    switch (sentimentType) {
      case 'positive': return <Smile className="w-5 h-5 text-green-600" />;
      case 'negative': return <Frown className="w-5 h-5 text-red-600" />;
      default: return <Meh className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentimentType) => {
    switch (sentimentType) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-300';
      case 'negative': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'completed': 'bg-green-100 text-green-700',
      'resolved': 'bg-green-100 text-green-700',
      'in progress': 'bg-blue-100 text-blue-700',
      'pending': 'bg-yellow-100 text-yellow-700',
    };
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (!sdkManager || !sdkManager.isInitialized) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">CRM Integration</h3>
        </div>
        <p className="text-gray-500">Connecting to workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Header with Real-time Sentiment */}
      {customerProfile && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
                {customerProfile.initials}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{customerProfile.name}</h2>
                  <span className="px-3 py-1 bg-yellow-400/30 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {customerData.tier}
                  </span>
                </div>
                <p className="text-white/80 text-sm mt-1">Customer ID: {customerData.id}</p>
              </div>
            </div>
            
            {/* Real-time Sentiment Indicator */}
            <div className={`px-4 py-3 rounded-xl border-2 backdrop-blur-sm ${getSentimentColor(sentiment)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getSentimentIcon(sentiment)}
                <span className="font-semibold capitalize">{sentiment} Sentiment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-current transition-all duration-500"
                    style={{ width: `${sentimentScore}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{sentimentScore}%</span>
              </div>
              <p className="text-xs mt-1 opacity-80">Live Analysis</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: 'Lifetime Value', value: `$${customerData.lifetimeValue.toLocaleString()}` },
              { icon: ShoppingCart, label: 'Total Orders', value: customerData.totalPurchases },
              { icon: Ticket, label: 'Open Tickets', value: customerData.tickets.filter(t => t.status !== 'Resolved').length },
              { icon: Activity, label: 'Interactions', value: customerData.interactions.length },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-xs text-white/80">{stat.label}</span>
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
            { id: 'tickets', label: 'Tickets', icon: Ticket },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle },
            { id: 'cases', label: 'Cases', icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <CustomerOverview customerData={customerData} sentimentScore={sentimentScore} />
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
                <div className="text-sm text-gray-600">
                  Total: <span className="font-bold text-gray-900">
                    ${customerData.purchaseHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {customerData.purchaseHistory.map((purchase) => (
                  <div key={purchase.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-indigo-600" />
                          <span className="font-semibold text-gray-900">{purchase.items}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                            {purchase.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {purchase.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {purchase.category}
                          </span>
                          <span className="font-mono text-xs">{purchase.id}</span>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-green-700">${purchase.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <span className="text-xl">+</span>
                  New Ticket
                </button>
              </div>
              <div className="space-y-3">
                {customerData.tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Ticket className="w-5 h-5 text-indigo-600" />
                          <span className="font-semibold text-gray-900">{ticket.subject}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-mono text-xs">{ticket.id}</span>
                          <span>•</span>
                          <span>{ticket.date}</span>
                          <span>•</span>
                          <span>Agent: {ticket.agent}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-700' : 
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && <TasksManager />}

          {/* Cases Tab */}
          {activeTab === 'cases' && <CaseManager />}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && <InteractionTimeline interactions={customerData.interactions} />}
        </div>
      </div>
    </div>
  );
}

export default CRMPanel;
