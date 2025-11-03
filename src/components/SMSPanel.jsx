import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, AlertCircle, RefreshCw, Clock, Phone } from 'lucide-react';

function SMSPanel({ sdkManager, customerProfile }) {
  const [activeTab, setActiveTab] = useState('compose');
  const [smsHistory, setSmsHistory] = useState([]);
  const [smsData, setSmsData] = useState({
    destination_number: customerProfile?.phone || '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  useEffect(() => {
    // Load SMS history from localStorage
    const saved = localStorage.getItem('sms-history');
    if (saved) {
      setSmsHistory(JSON.parse(saved));
    } else {
      setSmsHistory([
        { 
          id: 'sms-1', 
          destination_number: '+916201087076', 
          message: 'Your appointment is confirmed for tomorrow at 10 AM.', 
          sentAt: '2024-01-20 14:25', 
          status: 'delivered',
          messageId: 'abc123xyz'
        },
        { 
          id: 'sms-2', 
          destination_number: '+14044249959', 
          message: 'Thank you for contacting us. We will get back to you soon.', 
          sentAt: '2024-01-19 10:10', 
          status: 'delivered',
          messageId: 'def456uvw'
        }
      ]);
    }
  }, []);

  const handleSendSMS = async () => {
    // Validation
    if (!smsData.destination_number || !smsData.message) {
      setSendStatus({ type: 'error', message: 'Please fill in destination number and message' });
      return;
    }

    // Validate phone number format (basic validation)
    if (!smsData.destination_number.match(/^\+?[1-9]\d{1,14}$/)) {
      setSendStatus({ type: 'error', message: 'Please enter a valid phone number with country code (e.g., +916201087076)' });
      return;
    }

    setSending(true);
    setSendStatus(null);

    try {
      const API_URL = 'https://kim9ffn1wi.execute-api.us-east-1.amazonaws.com/prod/send-sms';

      const requestBody = {
        destination_number: smsData.destination_number,
        message: smsData.message
      };

      console.log('📱 Sending SMS:', requestBody);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle failure response
        throw new Error(data.error || data.statusMessage || 'Failed to send SMS');
      }

      console.log('✅ SMS sent successfully:', data);

      // Success - save to SMS history
      const newSMS = {
        id: `sms-${Date.now()}`,
        destination_number: smsData.destination_number,
        message: smsData.message,
        sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'delivered',
        messageId: data.messageId
      };

      const updatedHistory = [newSMS, ...smsHistory];
      setSmsHistory(updatedHistory);
      localStorage.setItem('sms-history', JSON.stringify(updatedHistory));

      // Show success message
      setSendStatus({ 
        type: 'success', 
        message: `SMS sent successfully! Message ID: ${data.messageId}` 
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setSmsData({ 
          destination_number: customerProfile?.phone || '', 
          message: '' 
        });
        setSendStatus(null);
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      setSendStatus({ 
        type: 'error', 
        message: `Failed to send SMS: ${error.message}` 
      });
    } finally {
      setSending(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    // Simple phone number formatting
    if (phone.startsWith('+91')) {
      return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
    } else if (phone.startsWith('+1')) {
      return `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  const getCharacterCount = () => {
    const length = smsData.message.length;
    const maxLength = 160;
    const segments = Math.ceil(length / maxLength);
    return { length, maxLength, segments };
  };

  const charCount = getCharacterCount();

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">SMS Messaging System</h2>
              
            </div>
          </div>
          {/* <div className="grid grid-cols-3 gap-4 text-center">
            {[
              ['Sent', smsHistory.length], 
              ['Delivered', smsHistory.filter(s => s.status === 'delivered').length], 
              ['Today', smsHistory.filter(s => s.sentAt.startsWith(new Date().toISOString().slice(0, 10))).length]
            ].map(([label, count]) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-white/80">{label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Info Banner */}
      

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'compose', label: 'Compose', icon: Send }, 
            // { id: 'history', label: 'History', icon: Clock }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'compose' && (
            <div className="space-y-4">
              {/* Status Message */}
              {sendStatus && (
                <div className={`p-4 rounded-lg border-2 ${
                  sendStatus.type === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {sendStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`text-sm font-medium ${
                      sendStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {sendStatus.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Destination Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={smsData.destination_number}
                      onChange={(e) => setSmsData({ ...smsData, destination_number: e.target.value })}
                      placeholder="+916201087076"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +91 for India, +1 for US)
                  </p>
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-xs ${
                      charCount.length > charCount.maxLength ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {charCount.length} / {charCount.maxLength} characters
                      {charCount.segments > 1 && ` (${charCount.segments} segments)`}
                    </span>
                  </div>
                  <textarea
                    value={smsData.message}
                    onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                    placeholder="Type your message here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard SMS: 160 characters per segment. Longer messages will be split.
                  </p>
                </div>

                {/* Quick Templates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Templates
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Your appointment is confirmed.',
                      'Thank you for contacting us.',
                      'Your order has been shipped.',
                      'Payment received successfully.'
                    ].map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSmsData({ ...smsData, message: template })}
                        className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendSMS}
                  disabled={!smsData.destination_number || !smsData.message || sending}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Sending SMS...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send SMS 
                    </>
                  )}
                </button>

                
              </div>
            </div>
          )}

          {/* {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">SMS History</h3>
                <span className="text-sm text-gray-600">{smsHistory.length} total</span>
              </div>

              {smsHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No SMS messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {smsHistory.map((sms) => (
                    <div 
                      key={sms.id} 
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">
                              {formatPhoneNumber(sms.destination_number)}
                            </span>
                            {sms.status === 'delivered' && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{sms.message}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{sms.sentAt}</div>
                          {sms.messageId && (
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {sms.messageId.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          sms.status === 'delivered' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sms.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {sms.message.length} characters
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default SMSPanel;
