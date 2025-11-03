import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneOff, Mic, MicOff, Pause, Play, Square, Circle,
  UserPlus, Users, Send, Search, X, Clock, CheckCircle,
  AlertCircle, FileText, Save, Edit3, Calendar, PhoneForwarded,
  PhoneCall, MessageSquare, Mail, Video, MapPin, Tag, History
} from 'lucide-react';

/**
 * AdvancedContactPanel - Comprehensive contact management with recording, notes, 
 * transfer, and conference capabilities - Styled with Tailwind CSS
 */
function AdvancedContactPanel({ sdkManager, customerProfile }) {
  // State management
  const [activeTab, setActiveTab] = useState('recording');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPaused, setRecordingPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Notes state
  const [notes, setNotes] = useState('');
  const [disposition, setDisposition] = useState('');
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Transfer state
  const [transferType, setTransferType] = useState('warm');
  const [transferSearch, setTransferSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Conference state
  const [conferenceParticipants, setConferenceParticipants] = useState([]);
  const [addParticipantPhone, setAddParticipantPhone] = useState('');
  
  // Mock data
  const [availableAgents] = useState([
    { id: 1, name: 'Sarah Johnson', status: 'Available', extension: '2001', queue: 'Sales', skills: ['Sales', 'Billing'] },
    { id: 2, name: 'Mike Chen', status: 'Available', extension: '2002', queue: 'Support', skills: ['Technical'] },
    { id: 3, name: 'Emily Davis', status: 'Busy', extension: '2003', queue: 'Sales', skills: ['Sales', 'Premium'] },
    { id: 4, name: 'John Smith', status: 'Available', extension: '2004', queue: 'Support', skills: ['Billing'] },
  ]);

  const [contactHistory] = useState([
    { id: 1, date: '2024-01-20 14:30', type: 'phone', duration: '5m 30s', agent: 'Sarah Johnson', status: 'Completed', notes: 'Premium package inquiry' },
    { id: 2, date: '2024-01-15 09:15', type: 'email', agent: 'Mike Chen', status: 'Resolved', notes: 'Billing question resolved' },
    { id: 3, date: '2024-01-10 16:45', type: 'chat', duration: '12m 15s', agent: 'John Smith', status: 'Completed', notes: 'Technical support' },
  ]);

  const dispositionOptions = ['Issue Resolved', 'Follow-up Required', 'Transferred to Specialist', 'Left Voicemail', 'Customer Callback Requested', 'Escalated', 'Information Provided', 'No Answer'];

  // Auto-save notes
  const autoSaveTimerRef = useRef(null);
  
  useEffect(() => {
    if (notes || disposition) {
      setAutoSaving(true);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        const savedData = { notes, disposition, timestamp: new Date().toISOString(), contactId: customerProfile?.phone || 'unknown' };
        localStorage.setItem('contact-notes', JSON.stringify(savedData));
        setLastSaved(new Date());
        setAutoSaving(false);}, 2000);
    }
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [notes, disposition]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording && !recordingPaused) {
      interval = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingPaused]);

  // Handlers
  const handleStartRecording = async () => {
    setIsRecording(true);
    setRecordingDuration(0);};

  const handleStopRecording = async () => {
    setIsRecording(false);
    setRecordingPaused(false);
    setRecordingDuration(0);};

  const handlePauseRecording = async () => {
    setRecordingPaused(!recordingPaused);};

  const handleTransfer = async () => {
    if (!selectedAgent) { alert('Please select an agent to transfer to'); return; }alert(`Transfer initiated to ${selectedAgent.name} (${transferType})`);
  };

  const handleAddParticipant = async () => {
    if (!addParticipantPhone) { alert('Please enter a phone number'); return; }setConferenceParticipants([...conferenceParticipants, { id: Date.now(), phone: addParticipantPhone, status: 'Connecting', joinedAt: new Date() }]);
    setAddParticipantPhone('');
    setTimeout(() => {
      setConferenceParticipants(prev => prev.map(p => p.phone === addParticipantPhone ? { ...p, status: 'Connected' } : p));
    }, 2000);
  };

  const handleRemoveParticipant = (participantId) => {
    setConferenceParticipants(prev => prev.filter(p => p.id !== participantId));};

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredAgents = availableAgents.filter(agent =>
    agent.name.toLowerCase().includes(transferSearch.toLowerCase()) ||
    agent.queue.toLowerCase().includes(transferSearch.toLowerCase()) ||
    agent.skills.some(skill => skill.toLowerCase().includes(transferSearch.toLowerCase()))
  );

  const getTypeIcon = (type) => {
    const icons = { phone: Phone, email: Mail, chat: MessageSquare, video: Video };
    const Icon = icons[type] || Phone;
    return <Icon className="w-4 h-4" />;
  };

  if (!sdkManager || !sdkManager.isInitialized) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Advanced Contact Management</h3>
        </div>
        <p className="text-gray-500">Connecting to workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Info Card */}
      {customerProfile && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {customerProfile.initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customerProfile.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-white/90">
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{customerProfile.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{customerProfile.email}</span>
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-400/30 rounded-full text-sm font-medium backdrop-blur-sm">Active Contact</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'recording', label: 'Recording', icon: Circle },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'transfer', label: 'Transfer', icon: PhoneForwarded },
            { id: 'conference', label: 'Conference', icon: Users },
            { id: 'history', label: 'History', icon: History },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Recording Tab */}
          {activeTab === 'recording' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-4 shadow-lg">
                  {isRecording && !recordingPaused && <Circle className="w-16 h-16 text-white animate-pulse-slow fill-current" />}
                  {isRecording && recordingPaused && <Pause className="w-16 h-16 text-white" />}
                  {!isRecording && <Square className="w-16 h-16 text-white" />}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{formatDuration(recordingDuration)}</div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  {isRecording ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-current animate-pulse" />
                      {recordingPaused ? 'Paused' : 'Recording'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Not Recording</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <button onClick={handleStartRecording} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg">
                    <Circle className="w-5 h-5" />Start Recording
                  </button>
                ) : (
                  <>
                    <button onClick={handlePauseRecording} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg">
                      {recordingPaused ? <><Play className="w-5 h-5" />Resume</> : <><Pause className="w-5 h-5" />Pause</>}
                    </button>
                    <button onClick={handleStopRecording} className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg">
                      <Square className="w-5 h-5" />Stop
                    </button>
                  </>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Recording Information</p>
                    <p className="text-blue-700">Call recordings are stored securely and accessible from the recordings dashboard.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ label: 'Recording Quality', value: 'HD Audio' }, { label: 'Storage', value: 'Cloud' }, { label: 'Retention', value: '90 Days' }].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                    <div className="text-lg font-semibold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Disposition Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Call Notes & Disposition</h3>
                <div className="flex items-center gap-2 text-sm">
                  {autoSaving && <span className="text-blue-600 flex items-center gap-1"><div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>Saving...</span>}
                  {lastSaved && !autoSaving && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />Saved {lastSaved.toLocaleTimeString()}</span>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter detailed notes about the call..."
                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{notes.length} characters</span>
                    <span>Auto-saves after 2 seconds</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call Disposition</label>
                  <select value={disposition} onChange={(e) => setDisposition(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select disposition...</option>
                    {dispositionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                    <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Normal</option><option>High</option><option>Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Billing', 'Technical', 'Sales', 'Complaint', 'Feedback'].map((tag) => (
                      <button key={tag} className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors">
                        <Tag className="w-3 h-3 inline mr-1" />{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-lg">
                  <Save className="w-5 h-5" />Save Notes Manually
                </button>
              </div>
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Call</h3>
              
              <div className="flex gap-4 mb-6">
                {[{ type: 'warm', icon: PhoneCall, label: 'Warm Transfer', desc: 'Speak with agent first' }, 
                  { type: 'cold', icon: PhoneForwarded, label: 'Cold Transfer', desc: 'Transfer directly' }].map((t) => (
                  <button key={t.type} onClick={() => setTransferType(t.type)}
                    className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                      transferType === t.type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <t.icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search agents by name, queue, or skills..." value={transferSearch} onChange={(e) => setTransferSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <button key={agent.id} onClick={() => setSelectedAgent(agent)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedAgent?.id === agent.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-600">Ext: {agent.extension} • {agent.queue}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.status === 'Available' ? 'bg-green-100 text-green-700' : agent.status === 'Busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>{agent.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {agent.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {selectedAgent && (
                <button onClick={handleTransfer} disabled={selectedAgent.status !== 'Available'}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-lg">
                  <PhoneForwarded className="w-5 h-5" />Transfer to {selectedAgent.name}
                </button>
              )}
            </div>
          )}

          {/* Conference Tab */}
          {activeTab === 'conference' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conference Call</h3>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{conferenceParticipants.length} Participant{conferenceParticipants.length !== 1 ? 's' : ''}</div>
                    <div className="text-sm text-gray-600">Add participants to create a conference call</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <input type="tel" placeholder="Enter phone number (+1234567890)" value={addParticipantPhone} onChange={(e) => setAddParticipantPhone(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button onClick={handleAddParticipant} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg">
                  <UserPlus className="w-5 h-5" />Add
                </button>
              </div>

              {conferenceParticipants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No participants yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add participants to start a conference call</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conferenceParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{participant.phone}</div>
                          <div className="text-sm text-gray-600">Added {participant.joinedAt.toLocaleTimeString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{participant.status}</span>
                        <button onClick={() => handleRemoveParticipant(participant.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact History</h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {contactHistory.map((interaction, index) => (
                    <div key={interaction.id} className="relative pl-14">
                      {/* Timeline dot */}
                      <div className={`absolute left-4 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        interaction.type === 'phone' ? 'bg-blue-500' : interaction.type === 'email' ? 'bg-purple-500' : 'bg-green-500'
                      }`}></div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(interaction.type)}
                            <span className="font-semibold text-gray-900 capitalize">{interaction.type} Contact</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            interaction.status === 'Completed' || interaction.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>{interaction.status}</span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{interaction.date}</span>
                            {interaction.duration && <span className="text-gray-400">• {interaction.duration}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Agent: {interaction.agent}</span>
                          </div>
                          {interaction.notes && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md text-gray-700">
                              {interaction.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4">
                <button className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                  Load More History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedContactPanel;
