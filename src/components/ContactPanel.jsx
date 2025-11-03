import React, { useState, useEffect } from 'react';
import { PhoneCall, Mail, MessageSquare, Clock, Tag } from 'lucide-react';

/**
 * Contact Panel - Displays and manages active contact information
 */
function ContactPanel({ sdkManager }) {
  const [contactInfo, setContactInfo] = useState(null);
  const [contactAttributes, setContactAttributes] = useState({});
  const [channelType, setChannelType] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sdkManager && sdkManager.isInitialized) {
      loadContactData();
      
      // Set up contact event listeners
      const handleContactEvent = () => {setTimeout(() => loadContactData(), 500);
      };
      
      // Listen for contact events by adding callbacks
      const originalCallbacks = sdkManager.callbacks;
      sdkManager.callbacks = {
        ...originalCallbacks,
        onContactIncoming: handleContactEvent,
        onContactConnecting: handleContactEvent,
        onContactAccepted: handleContactEvent,
        onContactConnected: handleContactEvent,
        onContactCleared: () => {setContactInfo(null);
          setContactAttributes({});
          setChannelType(null);
          setQueueInfo(null);
        }
      };
      
      // Cleanup
      return () => {
        sdkManager.callbacks = originalCallbacks;
      };
    }
  }, [sdkManager?.isInitialized]);

  const loadContactData = async () => {
    setLoading(true);
    try {
      // Check if there's an active contact first
      const hasContact = sdkManager.hasActiveContact?.() || false;if (!hasContact) {setContactInfo(null);
        setContactAttributes({});
        setChannelType(null);
        setQueueInfo(null);
        setLoading(false);
        return;
      }
      
      // Try to get contact information
      const [attributes, channel, queue, contactId] = await Promise.all([
        sdkManager.getContactAttributes().catch(() => ({})),
        sdkManager.getChannelType().catch(() => null),
        sdkManager.getQueue().catch(() => null),
        sdkManager.getInitialContactId().catch(() => null)
      ]);setContactInfo({ contactId });
      setContactAttributes(attributes);
      setChannelType(channel);
      setQueueInfo(queue);
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const handleAcceptContact = async () => {
    try {
      await sdkManager.acceptContact();loadContactData();
    } catch (error) {alert('Failed to accept contact: ' + error.message);
    }
  };

  const handleClearContact = async () => {
    try {
      await sdkManager.clearContact();setContactInfo(null);
      setContactAttributes({});
    } catch (error) {alert('Failed to clear contact: ' + error.message);
    }
  };

  const getChannelIcon = () => {
    switch (channelType) {
      case 'VOICE':
        return <PhoneCall size={18} />;
      case 'CHAT':
        return <MessageSquare size={18} />;
      case 'TASK':
        return <Clock size={18} />;
      case 'EMAIL':
        return <Mail size={18} />;
      default:
        return <PhoneCall size={18} />;
    }
  };

  if (!sdkManager || !sdkManager.isInitialized) {
    return (
      <div className="panel contact-panel">
        <h3><PhoneCall size={18} /> Contact Information</h3>
        <p className="text-muted">Waiting for contact...</p>
      </div>
    );
  }

  return (
    // <div className="panel contact-panel">
    //   <div className="panel-header">
    //     <h3>{getChannelIcon()} Contact Information</h3>
    //     {channelType && (
    //       <span className="channel-badge">{channelType}</span>
    //     )}
    //   </div>

    //   <div className="panel-content">
    //     {!channelType ? (
    //       <div className="info-message">
    //         <p><strong>ℹ️ No Active Contact</strong></p>
    //         <p className="text-muted">
    //           Contact features require an active contact in Amazon Connect.
    //         </p>
    //         <p className="text-muted">
    //           To test contact features:
    //         </p>
    //         <ul className="info-list">
    //           <li>Make an inbound or outbound call</li>
    //           <li>Accept a chat or email contact</li>
    //           <li>The contact information will appear here automatically</li>
    //         </ul>
    //         <p className="text-muted">
    //           <strong>For Demo:</strong> Contact methods return empty results when no contact is active.
    //         </p>
    //       </div>
    //     ) : (
    //       <>
    //         {/* Contact ID */}
    //         {contactInfo?.contactId && (
    //           <div className="info-section">
    //             <div className="info-row">
    //               <span className="info-label">Contact ID:</span>
    //               <span className="info-value" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
    //                 {contactInfo.contactId}
    //               </span>
    //             </div>
    //           </div>
    //         )}

    //         {/* Queue Information */}
    //         {queueInfo && (
    //           <div className="info-section">
    //             <div className="info-row">
    //               <span className="info-label">Queue:</span>
    //               <span className="info-value">{queueInfo.name || 'Unknown'}</span>
    //             </div>
    //           </div>
    //         )}

    //         {/* Contact Attributes */}
    //         {Object.keys(contactAttributes).length > 0 && (
    //           <div className="info-section">
    //             <h4><Tag size={16} /> Contact Attributes</h4>
    //             {Object.entries(contactAttributes).map(([key, value]) => (
    //               <div key={key} className="info-row">
    //                 <span className="info-label">{key}:</span>
    //                 <span className="info-value">{String(value)}</span>
    //               </div>
    //             ))}
    //           </div>
    //         )}

    //         {/* Contact Actions */}
    //         <div className="control-section">
    //           <button 
    //             onClick={handleAcceptContact}
    //             className="btn btn-primary"
    //             disabled={loading}
    //           >
    //             Accept Contact
    //           </button>
    //           <button 
    //             onClick={handleClearContact}
    //             className="btn btn-secondary"
    //             disabled={loading}
    //           >
    //             Clear Contact
    //           </button>
    //         </div>
    //       </>
    //     )}
    //   </div>
    // </div>
    <div></div>
  );
}

export default ContactPanel;
