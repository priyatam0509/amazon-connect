import React, { useState, useEffect } from 'react';
import { User, Phone, Settings, RefreshCw } from 'lucide-react';
import AgentService from '../services/AgentService';

/**
 * Agent Panel - Displays and manages agent state and information
 */
function AgentPanel({ sdkManager }) {
  const [agentInfo, setAgentInfo] = useState(null);
  const [agentState, setAgentState] = useState(null);
  const [availabilityStates, setAvailabilityStates] = useState([]);
  const [routingProfile, setRoutingProfile] = useState(null);
  const [channelConcurrency, setChannelConcurrency] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sdkManager && sdkManager.isInitialized) {
      loadAgentData();
    }
  }, [sdkManager?.isInitialized]);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      const [name, extension, state, states, profile, concurrency] = await Promise.all([
        sdkManager.getAgentName().catch(() => 'Unknown'),
        sdkManager.getAgentExtension().catch(() => 'N/A'),
        sdkManager.getAgentState().catch(() => null),
        sdkManager.listAvailabilityStates().catch(() => []),
        sdkManager.getRoutingProfile().catch(() => null),
        sdkManager.getChannelConcurrency().catch(() => null)
      ]);

      setAgentInfo({ name, extension, state });
      setAgentState(state);
      setAvailabilityStates(states);
      setRoutingProfile(profile);
      setChannelConcurrency(concurrency);} catch (error) {} finally {
      setLoading(false);
    }
  };

  const handleStateChange = async (stateArn, stateName) => {
    if (!stateArn) return;
    
    setLoading(true);
    try {const result = await sdkManager.setAvailabilityState(stateArn);// Wait for state to update in CCP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload agent data to reflect new state
      await loadAgentData();} catch (error) {alert('Failed to change state to ' + stateName + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetOffline = async () => {
    setLoading(true);
    try {await sdkManager.setOffline();// Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload agent data
      await loadAgentData();
      
      alert(' Agent set to offline');
    } catch (error) {alert('Failed to set offline: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  if (!sdkManager || !sdkManager.isInitialized) {
    return (
      <div className="panel agent-panel">
        <h3><User size={18} /> Agent Information</h3>
        <p className="text-muted">Connecting to workspace...</p>
      </div>
    );
  }

  return (
    <div className="panel agent-panel">
      <div className="panel-header">
        <h3><User size={18} /> Agent Information</h3>
        <button 
          onClick={loadAgentData} 
          className="icon-btn"
          disabled={loading}
          title="Refresh agent data"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      <div className="panel-content">
        {/* Agent Basic Info */}
        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{agentInfo?.name || 'Loading...'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Extension:</span>
            <span className="info-value">{agentInfo?.extension || 'N/A'}</span>
          </div>
        </div>

        {/* Current State */}
        {agentState && (
          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Current State:</span>
              <span className={`state-badge ${agentState.name.toLowerCase()}`}>
                {agentState.name}
              </span>
            </div>
          </div>
        )}

        {/* Routing Profile */}
        {routingProfile && (
          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Routing Profile:</span>
              <span className="info-value">{routingProfile.name || 'Unknown'}</span>
            </div>
          </div>
        )}

        {/* Channel Concurrency */}
        {channelConcurrency && (
          <div className="info-section">
            <h4>Channel Concurrency</h4>
            {Object.entries(channelConcurrency).map(([channel, config]) => (
              <div key={channel} className="info-row">
                <span className="info-label">{channel}:</span>
                <span className="info-value">
                  {typeof config === 'object' ? config.maximumSlots || 'N/A' : config}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* State Change Controls */}
        {availabilityStates.length > 0 && (
          <div className="control-section">
            <h4>Change Availability State</h4>
            
            <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
              Current: <strong>{agentState?.name || 'Unknown'}</strong>
            </p>
            <div className="state-buttons">
              {availabilityStates.map((state) => {
                // Handle both 'arn' and 'agentStateARN' properties
                const stateArn = state.arn || state.agentStateARN;
                return (
                  <button
                    key={stateArn}
                    onClick={() => {handleStateChange(stateArn, state.name);
                    }}
                    className={`state-btn ${state.name === agentState?.name ? 'active' : ''}`}
                    disabled={loading}
                    title={`Change to ${state.name}`}
                  >
                    {state.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default AgentPanel;
