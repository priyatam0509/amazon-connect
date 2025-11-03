import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import { getSDKManager } from './managers/ConnectSDKManager';
import { getMetricsTracker } from './services/MetricsTracker';
import AgentPanel from './components/AgentPanel';
import ContactPanel from './components/ContactPanel';
import VoicePanel from './components/VoicePanel';
import AdvancedEmailPanel from './components/AdvancedEmailPanel';
import FeatureExplorer from './components/FeatureExplorer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AdvancedContactPanel from './components/AdvancedContactPanel';
import CRMPanel from './components/CRMPanel';
import ChatPanel from './components/ChatPanel';
import AgentsListPanel from './components/AgentsListPanel';
import SMSPanel from './components/SMSPanel';
import AgentDetailsPanel from './components/AgentDetailsPanel';
import './AppComprehensive.css';
import './components/AnalyticsDashboard.css';

/**
 * Comprehensive Amazon Connect Agent Workspace Application
 * Demonstrates all available SDK features and capabilities
 */
function AppComprehensive() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [agentState, setAgentState] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedPanel, setExpandedPanel] = useState(null);
  const sdkManagerRef = useRef(null);
  const metricsTrackerRef = useRef(null);

  // Sample customer profile data
  const [customerProfile] = useState({
    name: 'Abhijit Daga',
    initials: 'AD',
    email: 'Abhijit.Daga@email.com',
    phone: '+14044249959',
    address: '123 Main St, New York, NY 10001',
    joinDate: '2023-05-15',
    lastContact: '2024-01-20',
    totalValue: '$12,500',
    status: 'Active',
    preferredTime: '9 AM - 5 PM EST',
    engagementLevel: 'High',
    nextAction: 'Upsell opportunity'
  });

  const [callHistory] = useState([
    { date: '2024-01-20', note: 'Follow-up scheduled', duration: '5 min', type: 'Outbound' },
    { date: '2024-01-15', note: 'Interest shown in premium package', duration: '12 min', type: 'Inbound' },
    { date: '2024-01-10', note: 'Product inquiry', duration: '8 min', type: 'Inbound' }
  ]);

  useEffect(() => {
    initializeSDK();
    
    // Initialize metrics tracker
    metricsTrackerRef.current = getMetricsTracker();
    
    return () => {
      // Cleanup is handled by the singleton manager
    };
  }, []);

  const initializeSDK = async () => {
    try {
      console.log('🚀 Initializing Comprehensive Amazon Connect SDK...');
      
      // Get or create SDK Manager with callbacks
      const manager = getSDKManager({
        onStatusChange: setStatus,
        onReady: setIsReady,
        onAgentStateChange: setAgentState,
        onContactConnected: (data) => {
          console.log('📞 Contact connected event:', data);
          metricsTrackerRef.current?.startCall(data);
        },
        onContactCleared: (data) => {
          console.log('📞 Contact cleared event:', data);
          metricsTrackerRef.current?.endCall(data, 'Completed');
        },
        onContactMissed: (data) => {
          console.log('📞 Contact missed event:', data);
          metricsTrackerRef.current?.endCall(data, 'Missed');
        },
        onStartingAcw: (data) => {
          console.log('📞 Starting ACW event:', data);
        }
      });

      await manager.init();
      sdkManagerRef.current = manager;
      
      console.log('✅ Comprehensive SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SDK:', error);
      setStatus('Error: ' + error.message);
      setIsReady(false);
    }
  };

  const togglePanel = (panelName) => {
    setExpandedPanel(expandedPanel === panelName ? null : panelName);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'team', label: 'Team', icon: '👥' },
    // { id: 'crm', label: 'CRM', icon: '💼' },
    // { id: 'chat', label: 'Chat', icon: '💬' },
    // { id: 'advanced', label: 'Advanced Contact', icon: '⚡' },
    { id: 'agent', label: 'Agent', icon: '👤' },
    { id: 'agentDetails', label: 'Agent Details', icon: '📋' },
    // { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'voice', label: 'Voice', icon: '🎙️' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'sms', label: 'SMS', icon: '💬' },
    // { id: 'explorer', label: 'Feature Explorer', icon: '🔍' }
  ];

  return (
    <div className="app-comprehensive">
      {/* Header */}
      <div className="app-header">
        <div className="app-title">
          <BookOpen size={24} />
          <div>
            <h1>Amazon Connect Workspace</h1>
          </div>
        </div>
        <div className="connection-status">
          <div className={`status-indicator ${isReady ? 'ready' : 'not-ready'}`}>
            {isReady ? (
              <CheckCircle size={18} className="status-icon" />
            ) : (
              <AlertCircle size={18} className="status-icon" />
            )}
            <span>{status}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="app-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="app-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-layout">
            {/* Left Sidebar - Customer Profile */}
            <div className="sidebar-profile">
              <div className="profile-header">
                <div className="avatar-large">{customerProfile.initials}</div>
                <h2 className="customer-name">{customerProfile.name}</h2>
                <span className="status-badge">{customerProfile.status}</span>
              </div>

              <div className="contact-details">
                <div className="detail-item">
                  <span className="detail-icon">✉️</span>
                  <span className="detail-text">{customerProfile.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📱</span>
                  <span className="detail-text">{customerProfile.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{customerProfile.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">Joined: {customerProfile.joinDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span className="detail-text">Last: {customerProfile.lastContact}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span className="detail-text">Value: {customerProfile.totalValue}</span>
                </div>
              </div>

              {agentState && (
                <div className="agent-state-display">
                  <div className="state-label">Agent Status</div>
                  <div className={`state-value ${agentState.name?.toLowerCase()}`}>
                    {agentState.name || 'Unknown'}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="main-content">
              {/* Quick Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-label">Total Calls</div>
                    <div className="stat-value">{callHistory.length}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-info">
                    <div className="stat-label">Avg Duration</div>
                    <div className="stat-value">8.3 min</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-info">
                    <div className="stat-label">Engagement</div>
                    <div className="stat-value">{customerProfile.engagementLevel}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💡</div>
                  <div className="stat-info">
                    <div className="stat-label">Next Action</div>
                    <div className="stat-value-small">{customerProfile.nextAction}</div>
                </div>
              </div>
            </div>

              {/* Voice Panel (Compact) */}
              <VoicePanel 
                sdkManager={sdkManagerRef.current} 
                customerProfile={customerProfile}
              />

              {/* Call History */}
              <div className="panel">
                <h3>📞 Call History</h3>
                <div className="call-history-list">
                  {callHistory.map((call, idx) => (
                    <div key={idx} className="history-item-compact">
                      <div className="history-left">
                        <span className={`call-type-badge ${call.type.toLowerCase()}`}>
                          {call.type}
                        </span>
                        <div className="history-date">{call.date}</div>
                      </div>
                      <div className="history-note">{call.note}</div>
                      <div className="history-duration">{call.duration}</div>
                    </div>
                  ))}
                </div>
              </div>

             
            </div>
          </div>
        )}

        {/* Agent Tab */}
        {activeTab === 'agent' && (
          <div className="single-panel-view">
            <AgentPanel sdkManager={sdkManagerRef.current} />
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="single-panel-view">
            <ContactPanel sdkManager={sdkManagerRef.current} />
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="single-panel-view">
            <VoicePanel 
              sdkManager={sdkManagerRef.current} 
              customerProfile={customerProfile}
            />
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="single-panel-view advanced-contact-view">
            <AdvancedEmailPanel 
              sdkManager={sdkManagerRef.current}
              customerProfile={customerProfile}
            />
          </div>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="single-panel-view advanced-contact-view">
            <SMSPanel 
              sdkManager={sdkManagerRef.current}
              customerProfile={customerProfile}
            />
          </div>
        )}

        {/* Agent Details Tab */}
        {activeTab === 'agentDetails' && (
          <div className="single-panel-view advanced-contact-view">
            <AgentDetailsPanel 
              sdkManager={sdkManagerRef.current}
              customerProfile={customerProfile}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-view">
            <AnalyticsDashboard sdkManager={sdkManagerRef.current} />
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="single-panel-view advanced-contact-view">
            <AgentsListPanel sdkManager={sdkManagerRef.current} />
          </div>
        )}

        {/* CRM Tab */}
        {activeTab === 'crm' && (
          <div className="single-panel-view advanced-contact-view">
            <CRMPanel 
              sdkManager={sdkManagerRef.current}
              customerProfile={customerProfile}
            />
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="single-panel-view advanced-contact-view">
            <ChatPanel 
              sdkManager={sdkManagerRef.current}
              customerProfile={customerProfile}
            />
          </div>
        )}

        {/* Advanced Contact Tab */}
        {activeTab === 'advanced' && (
          <div className="single-panel-view advanced-contact-view">
            <AdvancedContactPanel 
              sdkManager={sdkManagerRef.current}
              customerProfile={customerProfile}
            />
          </div>
        )}

        {/* Feature Explorer Tab */}
        {activeTab === 'explorer' && (
          <div className="single-panel-view">
            <FeatureExplorer sdkManager={sdkManagerRef.current} />
          </div>
        )}
      </div>

    </div>
  );
}

export default AppComprehensive;
