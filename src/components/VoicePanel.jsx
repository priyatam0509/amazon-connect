import React, { useState, useEffect } from 'react';
import { Phone, PhoneOutgoing, Globe } from 'lucide-react';

/**
 * Voice Panel - Handles voice calling functionality
 */
function VoicePanel({ sdkManager, customerProfile }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dialableCountries, setDialableCountries] = useState([]);
  const [outboundPermission, setOutboundPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sdkManager && sdkManager.isInitialized) {
      loadVoiceData();
    }
  }, [sdkManager?.isInitialized]);

  const loadVoiceData = async () => {
    try {
      const [permission, countries] = await Promise.all([
        sdkManager.getOutboundCallPermission().catch(() => false),
        sdkManager.listDialableCountries().catch(() => [])
      ]);

      setOutboundPermission(permission);
      setDialableCountries(countries);
    } catch (error) {}
  };

  const handleMakeCall = async (number) => {
    setLoading(true);
    try {
      await sdkManager.createOutboundCall(number || phoneNumber);
      setPhoneNumber('');
    } catch (error) {alert('Call failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && phoneNumber.trim()) {
      handleMakeCall();
    }
  };

  if (!sdkManager || !sdkManager.isInitialized) {
    return (
      <div className="panel voice-panel">
        <h3><Phone size={18} /> Voice Calling</h3>
        <p className="text-muted">Initializing voice client...</p>
      </div>
    );
  }

  return (
    <div className="panel voice-panel">
      <div className="panel-header">
        <h3><Phone size={18} /> Voice Calling</h3>
        {outboundPermission ? (
          <span className="permission-badge enabled">Outbound Enabled</span>
        ) : (
          <span className="permission-badge disabled">Outbound Disabled</span>
        )}
      </div>

      <div className="panel-content">
        {/* Quick Dial - Customer Profile */}
        {customerProfile && (
          <div className="quick-dial-section">
            <h4>Quick Dial - {customerProfile.name}</h4>
            <button
              onClick={() => handleMakeCall(customerProfile.phone)}
              className="btn btn-primary btn-call"
              disabled={loading || !outboundPermission}
            >
              <PhoneOutgoing size={18} />
              Call {customerProfile.phone}
            </button>
          </div>
        )}

        {/* Manual Dial */}
        <div className="manual-dial-section">
          <h4>Manual Dial</h4>
          <div className="dial-input-group">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="+1234567890"
              className="dial-input"
              disabled={loading || !outboundPermission}
            />
            <button
              onClick={() => handleMakeCall()}
              className="btn btn-primary"
              disabled={loading || !outboundPermission || !phoneNumber.trim()}
            >
              <Phone size={18} />
              Dial
            </button>
          </div>
        </div>

        {/* Dialable Countries */}
        {dialableCountries.length > 0 && (
          <div className="info-section">
            <h4><Globe size={16} /> Dialable Countries ({dialableCountries.length})</h4>
            <div className="countries-list">
              {dialableCountries.slice(0, 10).map((country, idx) => (
                <span key={idx} className="country-tag">
                  {country.countryCode || country}
                </span>
              ))}
              {dialableCountries.length > 10 && (
                <span className="country-tag more">
                  +{dialableCountries.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {!outboundPermission && (
          <div className="warning-message">
            ⚠️ Outbound calling is not enabled for this agent
          </div>
        )}
      </div>
    </div>
  );
}

export default VoicePanel;
