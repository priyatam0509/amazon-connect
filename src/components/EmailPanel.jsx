import React, { useState, useEffect } from 'react';
import { Mail, Send, FileText, Plus, Trash2, Eye, Clock, User } from 'lucide-react';

/**
 * Email Panel - Handles email contact functionality
 * Supports draft creation, sending, viewing threads, and attachments
 */
function EmailPanel({ sdkManager }) {
  const [emailData, setEmailData] = useState(null);
  const [emailThread, setEmailThread] = useState([]);
  const [draftEmails, setDraftEmails] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Draft email form state
  const [showDraftForm, setShowDraftForm] = useState(false);
  const [draftForm, setDraftForm] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: []
  });

  useEffect(() => {
    if (sdkManager && sdkManager.isInitialized) {
      loadEmailData();
    }
  }, [sdkManager?.isInitialized]);

  const loadEmailData = async () => {
    setLoading(true);
    try {
      // Check if email features are enabled
      const enabled = await sdkManager.isEmailEnabled().catch(() => false);
      setIsEnabled(enabled);

      if (enabled) {
        // Try to get current email data
        const data = await sdkManager.getEmailData().catch(() => null);
        setEmailData(data);

        // Try to get email thread
        if (data?.contactId) {
          const thread = await sdkManager.getEmailThread({ 
            contactId: data.contactId 
          }).catch(() => []);
          setEmailThread(thread);
        }
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!draftForm.to || !draftForm.subject) {
      alert('Please enter recipient and subject');
      return;
    }

    setLoading(true);
    try {
      const draftDetails = {
        destinationAddress: draftForm.to,
        ccAddresses: draftForm.cc ? draftForm.cc.split(',').map(e => e.trim()) : [],
        bccAddresses: draftForm.bcc ? draftForm.bcc.split(',').map(e => e.trim()) : [],
        subject: draftForm.subject,
        body: draftForm.body,
        attachments: draftForm.attachments
      };

      const emailId = await sdkManager.createDraftEmail(draftDetails);// Add to drafts list
      setDraftEmails(prev => [...prev, {
        id: emailId,
        ...draftDetails,
        createdAt: new Date().toISOString()
      }]);

      // Reset form
      setDraftForm({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        attachments: []
      });
      setShowDraftForm(false);

      alert('Draft email created successfully!');
      loadEmailData();
    } catch (error) {alert('Failed to create draft: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (emailId) => {
    if (!confirm('Send this email?')) return;

    setLoading(true);
    try {
      await sdkManager.sendEmail(emailId);// Remove from drafts
      setDraftEmails(prev => prev.filter(d => d.id !== emailId));

      alert('Email sent successfully!');
      loadEmailData();
    } catch (error) {alert('Failed to send email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = (draftId) => {
    if (!confirm('Delete this draft?')) return;
    setDraftEmails(prev => prev.filter(d => d.id !== draftId));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (!sdkManager || !sdkManager.isInitialized) {
    return (
      <div className="panel email-panel">
        <h3><Mail size={18} /> Email Management</h3>
        <p className="text-muted">Connecting to workspace...</p>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="panel email-panel">
        <div className="panel-header">
          <h3><Mail size={18} /> Email Management</h3>
          <span className="feature-badge disabled">Not Available</span>
        </div>
        <div className="panel-content">
          <div className="info-message">
            <p>📧 Email features are not currently enabled.</p>
            <p className="text-muted">
              To enable email features, install the email package:
            </p>
            <pre className="code-block">npm install @amazon-connect/email</pre>
            <p className="text-muted">
              Then uncomment the EmailClient setup in ConnectSDKManager.js
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel email-panel">
      <div className="panel-header">
        <h3><Mail size={18} /> Email Management</h3>
        <div className="header-actions">
          <span className="feature-badge enabled">Enabled</span>
          <button 
            onClick={() => setShowDraftForm(!showDraftForm)}
            className="btn btn-primary btn-sm"
            disabled={loading}
          >
            <Plus size={16} />
            New Draft
          </button>
        </div>
      </div>

      <div className="panel-content">
        {/* Current Email Data */}
        {emailData && (
          <div className="email-section">
            <h4><Mail size={16} /> Current Email Contact</h4>
            <div className="email-info-card">
              <div className="info-row">
                <span className="info-label">From:</span>
                <span className="info-value">{emailData.fromAddress || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">To:</span>
                <span className="info-value">{emailData.toAddress || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Subject:</span>
                <span className="info-value">{emailData.subject || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className={`status-badge ${emailData.status?.toLowerCase()}`}>
                  {emailData.status || 'Unknown'}
                </span>
              </div>
              {emailData.receivedTime && (
                <div className="info-row">
                  <span className="info-label">Received:</span>
                  <span className="info-value">{formatDate(emailData.receivedTime)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Draft Email Form */}
        {showDraftForm && (
          <div className="email-section">
            <div className="draft-form-header">
              <h4><FileText size={16} /> Create Draft Email</h4>
              <button 
                onClick={() => setShowDraftForm(false)}
                className="icon-btn"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="draft-form">
              <div className="form-group">
                <label>To: <span className="required">*</span></label>
                <input
                  type="email"
                  value={draftForm.to}
                  onChange={(e) => setDraftForm({...draftForm, to: e.target.value})}
                  placeholder="recipient@example.com"
                  className="form-input"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>CC:</label>
                <input
                  type="text"
                  value={draftForm.cc}
                  onChange={(e) => setDraftForm({...draftForm, cc: e.target.value})}
                  placeholder="email1@example.com, email2@example.com"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>BCC:</label>
                <input
                  type="text"
                  value={draftForm.bcc}
                  onChange={(e) => setDraftForm({...draftForm, bcc: e.target.value})}
                  placeholder="email1@example.com, email2@example.com"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Subject: <span className="required">*</span></label>
                <input
                  type="text"
                  value={draftForm.subject}
                  onChange={(e) => setDraftForm({...draftForm, subject: e.target.value})}
                  placeholder="Email subject"
                  className="form-input"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={draftForm.body}
                  onChange={(e) => setDraftForm({...draftForm, body: e.target.value})}
                  placeholder="Email message body..."
                  className="form-textarea"
                  rows="8"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button
                  onClick={handleCreateDraft}
                  className="btn btn-primary"
                  disabled={loading || !draftForm.to || !draftForm.subject}
                >
                  <FileText size={16} />
                  Create Draft
                </button>
                <button
                  onClick={() => setShowDraftForm(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Draft Emails List */}
        {draftEmails.length > 0 && (
          <div className="email-section">
            <h4><FileText size={16} /> Draft Emails ({draftEmails.length})</h4>
            <div className="drafts-list">
              {draftEmails.map((draft) => (
                <div key={draft.id} className="draft-item">
                  <div className="draft-header">
                    <div className="draft-info">
                      <div className="draft-subject">{draft.subject}</div>
                      <div className="draft-meta">
                        <User size={14} />
                        <span>To: {draft.destinationAddress}</span>
                        <Clock size={14} />
                        <span>{formatDate(draft.createdAt)}</span>
                      </div>
                    </div>
                    <div className="draft-actions">
                      <button
                        onClick={() => handleSendEmail(draft.id)}
                        className="btn btn-sm btn-primary"
                        disabled={loading}
                        title="Send email"
                      >
                        <Send size={14} />
                        Send
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="icon-btn"
                        disabled={loading}
                        title="Delete draft"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {draft.body && (
                    <div className="draft-preview">
                      {draft.body.substring(0, 150)}
                      {draft.body.length > 150 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Thread */}
        {emailThread.length > 0 && (
          <div className="email-section">
            <h4><Mail size={16} /> Email Thread ({emailThread.length} messages)</h4>
            <div className="email-thread">
              {emailThread.map((message, index) => (
                <div key={index} className="thread-message">
                  <div className="message-header">
                    <div className="message-from">
                      <User size={14} />
                      <strong>{message.from || 'Unknown'}</strong>
                    </div>
                    <div className="message-time">
                      <Clock size={14} />
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-body">{message.body || 'No content'}</div>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="message-attachments">
                      <FileText size={14} />
                      <span>{message.attachments.length} attachment(s)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!emailData && draftEmails.length === 0 && emailThread.length === 0 && (
          <div className="empty-state">
            <Mail size={48} className="empty-icon" />
            <p>No email data available</p>
            <p className="text-muted">
              Create a draft email or wait for an incoming email contact
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailPanel;
