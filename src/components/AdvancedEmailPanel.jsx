import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, Clock, Eye, MousePointer, Paperclip, Bold, Italic, Underline, AlignLeft, AlignCenter, Link2, Save, X, Edit, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { emailTemplates, emailSignatures } from '../data/emailTemplates';
import AgentService from '../services/AgentService';

function AdvancedEmailPanel({ sdkManager, customerProfile }) {
  const [activeTab, setActiveTab] = useState('compose');
  const [emails, setEmails] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSignatures, setShowSignatures] = useState(false);
  const [emailData, setEmailData] = useState({ from: '', to: customerProfile?.email || '', cc: '', bcc: '', subject: '', body: '', attachments: [], scheduledFor: null, isHtml: true, emailType: 'simple' });
  const [selectedSignature, setSelectedSignature] = useState(emailSignatures[0]);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [emailTracking] = useState({ 'email-1': { opens: 3, clicks: 5, lastOpened: '2024-01-20 14:30', status: 'read' }, 'email-2': { opens: 1, clicks: 0, lastOpened: '2024-01-19 10:15', status: 'read' }});
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sent-emails');
    if (saved) setEmails(JSON.parse(saved));
    else setEmails([
      { id: 'email-1', to: 'customer@example.com', subject: 'Follow-up on your inquiry', sentAt: '2024-01-20 14:25', status: 'read', hasAttachments: false },
      { id: 'email-2', to: 'client@company.com', subject: 'Invoice #12345', sentAt: '2024-01-19 10:10', status: 'read', hasAttachments: true },
      { id: 'email-3', to: 'support@example.com', subject: 'Product update information', sentAt: '2024-01-18 15:45', status: 'sent', scheduledFor: '2024-01-25 09:00' },
    ]);
  }, []);

  const applyTemplate = (template) => {
    const vars = { customer_name: 'John Doe', company_name: 'ACME Corp', agent_name: 'Sarah Johnson' };
    let subject = template.subject, body = template.body;
    Object.keys(vars).forEach(key => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
    });
    setEmailData(prev => ({ ...prev, subject, body }));
    if (editorRef.current) editorRef.current.innerHTML = body;
    setShowTemplates(false);
  };

  const handleFormatText = (cmd) => { document.execCommand(cmd, false, null); editorRef.current?.focus(); };
  const handleInsertLink = () => { const url = prompt('Enter URL:'); if (url) document.execCommand('createLink', false, url); };
  
  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({ id: Date.now() + Math.random(), name: file.name, size: file.size, type: file.type, file }));
    setEmailData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
  };

  const applySignature = () => {
    if (!selectedSignature) return;
    const vars = { agent_name: 'Sarah Johnson', agent_title: 'Customer Success Manager', company_name: 'Amazon Connect', agent_email: 'sarah@company.com', agent_phone: '+1 (555) 123-4567', company_website: 'www.company.com' };
    let sig = selectedSignature.content;
    Object.keys(vars).forEach(key => sig = sig.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]));
    const currentBody = editorRef.current?.innerHTML || emailData.body;
    const newBody = currentBody + sig;
    setEmailData(prev => ({ ...prev, body: newBody }));
    if (editorRef.current) editorRef.current.innerHTML = newBody;
    setShowSignatures(false);
  };

  const handleSendEmail = async () => {
    // Validation
    if (!emailData.from || !emailData.to || !emailData.subject) {
      setSendStatus({ type: 'error', message: 'Please fill in sender, recipient, and subject fields' });
      return;
    }

    setSending(true);
    setSendStatus(null);

    try {
      // Prepare email data for AWS SES API
      const emailPayload = {
        emailType: emailData.emailType || 'simple',
        sender: emailData.from,
        recipient: emailData.to,
        subject: emailData.subject,
        message: editorRef.current?.innerHTML || emailData.body || '',
        isHtml: emailData.isHtml !== false, // Default to true
      };

      // Add CC if provided
      if (emailData.cc && emailData.cc.trim()) {
        emailPayload.cc = emailData.cc.split(',').map(email => email.trim()).filter(e => e);
      }

      // Add BCC if provided
      if (emailData.bcc && emailData.bcc.trim()) {
        emailPayload.bcc = emailData.bcc.split(',').map(email => email.trim()).filter(e => e);
      }

      console.log('📧 Sending email via AWS SES:', emailPayload);

      // Send email via AWS SES API
      const result = await AgentService.sendEmail(emailPayload);

      console.log('✅ Email sent successfully:', result);

      // Success - save to sent emails
      const newEmail = {
        id: `email-${Date.now()}`,
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'sent',
        messageId: result.messageId,
        hasAttachments: emailData.attachments.length > 0
      };

      setEmails([newEmail, ...emails]);
      localStorage.setItem('sent-emails', JSON.stringify([newEmail, ...emails]));

      // Show success message
      setSendStatus({ type: 'success', message: `Email sent successfully! Message ID: ${result.messageId}` });

      // Reset form after 2 seconds
      setTimeout(() => {
        setEmailData({ 
          from: emailData.from, // Keep sender
          to: customerProfile?.email || '', 
          cc: '', 
          bcc: '', 
          subject: '', 
          body: '', 
          attachments: [], 
          scheduledFor: null, 
          isHtml: true, 
          emailType: 'simple' 
        });
        if (editorRef.current) editorRef.current.innerHTML = '';
        setSendStatus(null);
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      setSendStatus({ 
        type: 'error', 
        message: `Failed to send email: ${error.message}` 
      });
    } finally {
      setSending(false);
    }
  };

  const formatFileSize = (bytes) => bytes < 1024 ? bytes + ' B' : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB';

  // No SDK check needed - email works independently via AWS SES API
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Mail className="w-8 h-8" /></div>
            <div>
              <h2 className="text-2xl font-bold">Email System</h2>
              
            </div>
          </div>
          {/* <div className="grid grid-cols-3 gap-4 text-center">
            {[['Sent', emails.length], ['Read', emails.filter(e => e.status === 'read').length], ['Scheduled', emails.filter(e => e.scheduledFor).length]].map(([label, count]) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-3"><div className="text-2xl font-bold">{count}</div><div className="text-xs text-white/80">{label}</div></div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Info Banner */}
      

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[{ id: 'compose', label: 'Compose', icon: Edit }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'compose' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {[['Use Template', showTemplates, setShowTemplates, FileText, 'indigo'], ['Add Signature', showSignatures, setShowSignatures, Edit, 'purple'], ['Save Draft', false, () => { localStorage.setItem('email-draft', JSON.stringify({ ...emailData, body: editorRef.current?.innerHTML })); alert('Draft saved!'); }, Save, 'gray']].map(([label, show, handler, Icon, color]) => (
                  <button key={label} onClick={() => handler(!show)} className={`px-4 py-2 bg-${color}-600 hover:bg-${color}-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}><Icon className="w-4 h-4" />{label}</button>
                ))}
              </div>

              {showTemplates && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Select Template</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {emailTemplates.map((t) => (
                      <button key={t.id} onClick={() => applyTemplate(t)} className="text-left p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-colors">
                        <div className="flex items-start justify-between mb-2"><span className="font-semibold text-gray-900">{t.name}</span><span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">{t.category}</span></div>
                        <p className="text-sm text-gray-600 line-clamp-2">{t.subject}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showSignatures && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Select Signature</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {emailSignatures.map((sig) => (
                      <button key={sig.id} onClick={() => { setSelectedSignature(sig); applySignature(); }} className={`text-left p-4 bg-white rounded-lg border-2 transition-colors ${selectedSignature?.id === sig.id ? 'border-purple-500' : 'border-gray-200 hover:border-purple-300'}`}>
                        <span className="font-semibold text-gray-900">{sig.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Message */}
              {sendStatus && (
                <div className={`p-4 rounded-lg border-2 ${sendStatus.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm font-medium ${sendStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {sendStatus.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {[['From (Sender)', emailData.from, 'from', 'email'], ['To (Recipient)', emailData.to, 'to', 'email'], ['Subject', emailData.subject, 'subject', 'text']].map(([label, value, key, type]) => (
                  <div key={key}><label className="block text-sm font-medium text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label><input type={type} value={value} onChange={(e) => setEmailData({ ...emailData, [key]: e.target.value })} placeholder={key === 'from' ? 'verified-sender@example.com' : `${label}...`} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  {[['CC', 'cc'], ['BCC', 'bcc']].map(([label, key]) => (
                    <div key={key}><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input type="text" value={emailData[key]} onChange={(e) => setEmailData({ ...emailData, [key]: e.target.value })} placeholder={`${label.toLowerCase()}@example.com`} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
                      {[['bold', Bold], ['italic', Italic], ['underline', Underline], ['justifyLeft', AlignLeft], ['justifyCenter', AlignCenter]].map(([cmd, Icon]) => (
                        <button key={cmd} onClick={() => handleFormatText(cmd)} className="p-2 hover:bg-gray-200 rounded"><Icon className="w-4 h-4" /></button>
                      ))}
                      <div className="w-px bg-gray-300"></div>
                      <button onClick={handleInsertLink} className="p-2 hover:bg-gray-200 rounded"><Link2 className="w-4 h-4" /></button>
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-200 rounded"><Paperclip className="w-4 h-4" /></button>
                    </div>
                    <div ref={editorRef} contentEditable className="min-h-[300px] p-4 focus:outline-none" onInput={(e) => setEmailData({ ...emailData, body: e.currentTarget.innerHTML })} />
                  </div>
                </div>

                {emailData.attachments.length > 0 && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label><div className="space-y-2">
                    {emailData.attachments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3"><Paperclip className="w-4 h-4 text-gray-600" /><div><div className="text-sm font-medium text-gray-900">{a.name}</div><div className="text-xs text-gray-500">{formatFileSize(a.size)}</div></div></div>
                        <button onClick={() => setEmailData(prev => ({ ...prev, attachments: prev.attachments.filter(att => att.id !== a.id) }))} className="p-1 hover:bg-red-100 rounded"><X className="w-4 h-4 text-red-600" /></button>
                      </div>
                    ))}
                  </div></div>
                )}

                <input ref={fileInputRef} type="file" multiple onChange={handleFileAttach} className="hidden" />

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule Send (Optional)</label><input type="datetime-local" value={emailData.scheduledFor || ''} onChange={(e) => setEmailData({ ...emailData, scheduledFor: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>

                <button onClick={handleSendEmail} disabled={!emailData.from || !emailData.to || !emailData.subject || sending} className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  {sending ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" />Sending...</>
                  ) : emailData.scheduledFor ? (
                    <><Clock className="w-5 h-5" />Schedule Email</>
                  ) : (
                    <><Send className="w-5 h-5" />Send Email </>
                  )}
                </button>
                
                
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Templates Library</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailTemplates.map((t) => (
                  <div key={t.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between mb-3"><div><h4 className="font-semibold text-gray-900">{t.name}</h4><span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded inline-block mt-1">{t.category}</span></div>
                      <button onClick={() => { setActiveTab('compose'); applyTemplate(t); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">Use</button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2"><strong>Subject:</strong> {t.subject}</p>
                    <div className="text-xs text-gray-500"><strong>Variables:</strong> {t.variables.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-900">Sent Emails</h3><span className="text-sm text-gray-600">{emails.length} total</span></div>
              <div className="space-y-3">
                {emails.map((e) => (
                  <div key={e.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-gray-900">{e.subject}</span>
                        {e.status === 'read' && <Eye className="w-4 h-4 text-green-600" />}
                        {e.scheduledFor && <Clock className="w-4 h-4 text-orange-600" />}
                        {e.hasAttachments && <Paperclip className="w-4 h-4 text-gray-600" />}
                      </div><div className="text-sm text-gray-600">To: {e.to}</div></div>
                      <div className="text-sm text-gray-500">{e.sentAt}</div>
                    </div>
                    {e.scheduledFor && <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">Scheduled: {e.scheduledFor}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* {activeTab === 'tracking' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Tracking & Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[['Total Opens', Eye, 'green', Object.values(emailTracking).reduce((s, e) => s + e.opens, 0)], ['Total Clicks', MousePointer, 'blue', Object.values(emailTracking).reduce((s, e) => s + e.clicks, 0)], ['Read Rate', CheckCircle, 'purple', Math.round((emails.filter(e => e.status === 'read').length / emails.length) * 100) + '%']].map(([label, Icon, color, value]) => (
                  <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-lg p-4 border border-${color}-200`}>
                    <div className="flex items-center gap-2 mb-2"><Icon className={`w-5 h-5 text-${color}-600`} /><span className="font-semibold text-gray-900">{label}</span></div>
                    <div className={`text-3xl font-bold text-${color}-700`}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {emails.map((e) => {
                  const track = emailTracking[e.id] || { opens: 0, clicks: 0 };
                  return (
                    <div key={e.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2"><div><div className="font-semibold text-gray-900">{e.subject}</div><div className="text-sm text-gray-600">To: {e.to}</div></div>
                        <div className="text-sm text-gray-500">{e.sentAt}</div>
                      </div>
                      <div className="flex gap-4 text-sm"><span className="flex items-center gap-1 text-green-600"><Eye className="w-4 h-4" />{track.opens} opens</span><span className="flex items-center gap-1 text-blue-600"><MousePointer className="w-4 h-4" />{track.clicks} clicks</span>
                        {track.lastOpened && <span className="text-gray-600">Last opened: {track.lastOpened}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* {previewAttachment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPreviewAttachment(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-auto"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{previewAttachment.name}</h3><button onClick={() => setPreviewAttachment(null)}><X className="w-5 h-5" /></button></div>
            {previewAttachment.preview && <img src={previewAttachment.preview} alt={previewAttachment.name} className="max-w-full" />}
          </div>
        </div>
      )} */}
    </div>
  );
}

export default AdvancedEmailPanel;
