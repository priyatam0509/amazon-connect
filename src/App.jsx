import React, { useState, useEffect, useRef } from 'react';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { AmazonConnectApp } from '@amazon-connect/app';
import { VoiceClient } from '@amazon-connect/voice';
import { AgentClient } from '@amazon-connect/contact';
import './App.css';

// Global singleton to prevent multiple initializations
let globalDialManager = null;
let isInitializing = false;

// ClickToDialManager Class
class ClickToDialManager {
  constructor(setStatus, setIsReady, setAgentState) {
    this.voiceClient = null;
    this.agentClient = null;
    this.isInitialized = false;
    this.appProvider = null;
    this.setStatus = setStatus;
    this.setIsReady = setIsReady;
    this.setAgentState = setAgentState;
  }

  async init() {
    // Prevent multiple initializations
    if (this.isInitialized) {this.setStatus('Ready - Click a number to dial');
      this.setIsReady(true);
      return;
    }

    if (isInitializing) {return;
    }

    isInitializing = true;

    try {
      const { provider } = AmazonConnectApp.init({
        onCreate: (event) => {
          const { appInstanceId } = event.context;this.appProvider = provider;
          this.setupClients();
          
          // Only mark as initialized when connection is established
          this.isInitialized = true;
          this.setStatus('Ready - Click a number to dial');
          this.setIsReady(true);},
        onDestroy: (event) => {this.cleanup();
        }
      });

      // Handle connection errors (like timeout)
      provider.onError((error) => {if (error.key === 'workspaceConnectTimeout') {
          this.setStatus('Not connected - Must run inside Agent Workspace');
          this.setIsReady(false);} else {
          this.setStatus('Connection error: ' + error.key);
          this.setIsReady(false);
        }
      });this.setStatus('Connecting to Amazon Connect...');
    } catch (error) {this.setStatus('Error: ' + error.message);
      this.setIsReady(false);
      throw error;
    } finally {
      isInitializing = false;
    }
  }

  setupClients() {
    try {
      this.voiceClient = new VoiceClient();
      this.agentClient = new AgentClient();
      
      this.agentClient.onStateChanged((data) => {this.setAgentState(data);
      });} catch (error) {}
  }

  async canMakeOutboundCall() {
    if (!this.voiceClient || !this.agentClient) {return { canCall: false, reason: 'Clients not initialized' };
    }

    try {
      const permission = await this.voiceClient.getOutboundCallPermission();const agentState = await this.agentClient.getState();const availableStates = ['Available', 'AfterContactWork'];
      
      if (!permission) {
        return { canCall: false, reason: 'Agent does not have outbound call permission' };
      }
      
      if (!availableStates.includes(agentState.name)) {
        return { 
          canCall: false, 
          reason: `Agent state is "${agentState.name}". Must be Available or AfterContactWork to make calls` 
        };
      }
      
      return { canCall: true, reason: null };
    } catch (error) {return { canCall: false, reason: `Permission check failed: ${error.message}` };
    }
  }

  async initiateCall(phoneNumber, options = {}) {
    if (!this.isInitialized || !this.voiceClient) {
      throw new Error('ClickToDialManager not initialized');
    }

    const cleanNumber = this.formatPhoneNumber(phoneNumber);
    if (!this.isValidPhoneNumber(cleanNumber)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    const { canCall, reason } = await this.canMakeOutboundCall();
    if (!canCall) {
      throw new Error(reason || 'Agent is not available to make outbound calls');
    }

    try {this.setStatus(`Dialing ${cleanNumber}...`);

      const result = await this.voiceClient.createOutboundCall(cleanNumber, {
        queueARN: options.queueARN,
        relatedContactId: options.relatedContactId
      });this.setStatus(`Call initiated to ${cleanNumber}`);
      
      setTimeout(() => {
        this.setStatus('Ready - Click a number to dial');
      }, 3000);
      
      return result;
    } catch (error) {this.setStatus(`Error: ${error.message}`);
      
      setTimeout(() => {
        this.setStatus('Ready - Click a number to dial');
      }, 5000);
      
      throw error;
    }
  }

  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  isValidPhoneNumber(phoneNumber) {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  cleanup() {
    this.voiceClient = null;
    this.agentClient = null;
    this.appProvider = null;
    this.isInitialized = false;
  }
}

function App() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agentState, setAgentState] = useState(null);
  const dialManagerRef = useRef(null);

  // Customer profile data
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
    { date: '2024-01-20', note: 'Follow-up scheduled', duration: '5 min' },
    { date: '2024-01-15', note: 'Interest shown in premium package', duration: '12 min' }
  ]);

  useEffect(() => {
    // Initialize Amazon Connect SDK
    const initializeManager = async () => {
      try {// Use global singleton or create new instance
        if (!globalDialManager) {
          globalDialManager = new ClickToDialManager(setStatus, setIsReady, setAgentState);
          await globalDialManager.init();
        } else {
          // Reuse existing instance but update callbacks
          globalDialManager.setStatus = setStatus;
          globalDialManager.setIsReady = setIsReady;
          globalDialManager.setAgentState = setAgentState;
          
          if (globalDialManager.isInitialized) {
            setStatus('Ready - Click a number to dial');
            setIsReady(true);
          }
        }
        
        dialManagerRef.current = globalDialManager;} catch (error) {setStatus('Error: ' + error.message);
        setIsReady(false);}
    };

    initializeManager();
    
    // Note: We don't cleanup on unmount to maintain the singleton
    // The SDK should only be initialized once per page load
  }, []);

  const makeOutboundCall = async (number) => {
    try {
      if (!dialManagerRef.current) {
        throw new Error('System not initialized. Please refresh the page.');
      }
      
      if (!dialManagerRef.current.isInitialized) {
        throw new Error('Not connected to Amazon Connect. This app must run inside Agent Workspace.');
      }
      
      await dialManagerRef.current.initiateCall(number);
    } catch (error) {setStatus(`Error: ${error.message}`);
      
      setTimeout(() => {
        if (dialManagerRef.current && dialManagerRef.current.isInitialized) {
          setStatus('Ready - Click a number to dial');
        } else {
          setStatus('Not connected - Must run inside Agent Workspace');
        }
      }, 5000);
    }
  };

  const handleManualDial = () => {
    if (phoneNumber.trim()) {
      makeOutboundCall(phoneNumber);
      setPhoneNumber('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualDial();
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar - Customer Profile */}
      <div className="sidebar">
        <div className="profile-section">
          <div className="avatar">{customerProfile.initials}</div>
          <h2 className="customer-name">{customerProfile.name}</h2>
          <span className="status-badge">{customerProfile.status}</span>
        </div>

        <div className="contact-details">
          <div className="detail-item">
            <span className="detail-icon">✉️</span>
            <span className="detail-text">{customerProfile.email}</span>
          </div>
          <div className="detail-item">
            <Phone size={14} className="detail-icon" />
            <a 
              href="#" 
              className="detail-link"
              onClick={(e) => {
                e.preventDefault();
                makeOutboundCall(customerProfile.phone);
              }}
            >
              {customerProfile.phone}
            </a>
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
            <span className="detail-text">Last Contact: {customerProfile.lastContact}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">💰</span>
            <span className="detail-text">Total Value: {customerProfile.totalValue}</span>
          </div>
        </div>

        <div className="notes-section">
          <h3>Notes</h3>
          <p>Preferred contact time: {customerProfile.preferredTime}</p>
        </div>

        {agentState && (
          <div className="agent-status-box">
            <div className="agent-status-label">Agent Status</div>
            <div className={`agent-status-value ${agentState.name === 'Available' ? 'available' : 'unavailable'}`}>
              {agentState.name}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-area">
        <div className="status-bar">
          {status}
          {isReady ? (
            <CheckCircle size={18} className="status-icon ready" />
          ) : (
            <AlertCircle size={18} className="status-icon not-ready" />
          )}
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-btn call-now"
              onClick={() => makeOutboundCall(customerProfile.phone)}
            >
              <Phone size={16} />
              Call Now
            </button>
            <button className="action-btn send-email">
              <span>📧</span>
              Send Email
            </button>
            <button className="action-btn schedule">
              <span>📅</span>
              Schedule
            </button>
            <button className="action-btn update-info">
              <span>🔄</span>
              Update Info
            </button>
          </div>
        </div>

        {/* Call History */}
        <div className="section">
          <h2 className="section-title">Call History</h2>
          <div className="call-history">
            {callHistory.map((call, index) => (
              <div key={index} className="history-item">
                <div className="history-left">
                  <div className="history-date">{call.date}</div>
                  <div className="history-note">{call.note}</div>
                </div>
                <div className="history-duration">{call.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="section">
          <h2 className="section-title">Customer Insights</h2>
          <div className="insights-grid">
            <div className="insight-card engagement">
              <div className="insight-label">Engagement Level</div>
              <div className="insight-value">{customerProfile.engagementLevel}</div>
            </div>
            <div className="insight-card next-action">
              <div className="insight-label">Next Best Action</div>
              <div className="insight-value">{customerProfile.nextAction}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
