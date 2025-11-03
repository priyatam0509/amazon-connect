import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Phone, Facebook, Send, Smile, Paperclip, Image as ImageIcon,
  Check, CheckCheck, Clock, User, Search, X, FileText, Download, Mic, Video,
  MoreVertical, AlertCircle, Copy, Reply, Edit2
} from 'lucide-react';
import { messageTemplates, quickReplies, commonEmojis } from '../data/messageTemplates';

/**
 * ChatPanel - Multi-channel messaging with live chat, SMS, and social media
 */
function ChatPanel({ sdkManager, customerProfile }) {
  const [activeChannel, setActiveChannel] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mock conversations data
  useEffect(() => {
    const mockConversations = [
      { id: 1, channel: 'chat', name: 'John Doe', avatar: 'JD', status: 'online', lastMessage: 'Thanks for your help!', time: '2 min ago', unread: 0 },
      { id: 2, channel: 'sms', name: customerProfile?.name || 'Jane Smith', avatar: customerProfile?.initials || 'JS', status: 'offline', lastMessage: 'Can you send me the invoice?', time: '15 min ago', unread: 2 },
      { id: 3, channel: 'whatsapp', name: 'Mike Johnson', avatar: 'MJ', status: 'online', lastMessage: 'Perfect! 👍', time: '1 hour ago', unread: 0 },
      { id: 4, channel: 'facebook', name: 'Sarah Williams', avatar: 'SW', status: 'offline', lastMessage: 'Is this still available?', time: '3 hours ago', unread: 1 },
      { id: 5, channel: 'chat', name: 'Robert Brown', avatar: 'RB', status: 'online', lastMessage: 'I have a question about...', time: '5 hours ago', unread: 0 },
    ];
    setConversations(mockConversations);

    // Set first conversation as active
    if (mockConversations.length > 0) {
      setActiveConversation(mockConversations[0]);
      loadMessages(mockConversations[0].id);
    }
  }, [customerProfile]);

  const loadMessages = (conversationId) => {
    // Mock messages for demonstration
    const mockMessages = [
      { id: 1, sender: 'customer', text: 'Hi, I need help with my account', timestamp: '10:30 AM', status: 'delivered', type: 'text' },
      { id: 2, sender: 'agent', text: 'Hello! I\'d be happy to help you. What seems to be the issue?', timestamp: '10:31 AM', status: 'read', type: 'text' },
      { id: 3, sender: 'customer', text: 'I can\'t login to my account', timestamp: '10:32 AM', status: 'delivered', type: 'text' },
      { id: 4, sender: 'agent', text: 'Let me look into that for you. Can you provide your email address?', timestamp: '10:33 AM', status: 'read', type: 'text' },
      { id: 5, sender: 'customer', text: 'sure@example.com', timestamp: '10:34 AM', status: 'delivered', type: 'text' },
      { id: 6, sender: 'agent', text: 'Thanks! I\'ve sent you a password reset link. Please check your email. 📧', timestamp: '10:35 AM', status: 'read', type: 'text' },
    ];
    setMessages(mockMessages);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && !selectedFile) return;

    const newMessage = {
      id: Date.now(),
      sender: 'agent',
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: selectedFile ? 'file' : 'text',
      file: selectedFile,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    setSelectedFile(null);
    scrollToBottom();

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => msg.id === newMessage.id ? { ...msg, status: 'read' } : msg));
    }, 2000);

    // Simulate customer typing
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const customerReply = {
          id: Date.now() + 1,
          sender: 'customer',
          text: 'Thanks for your help! 😊',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          type: 'text',
        };
        setMessages(prev => [...prev, customerReply]);
        scrollToBottom();
      }, 2000);
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  };

  const applyTemplate = (template) => {
    const vars = {
      customer_name: activeConversation?.name || 'Customer',
      company_name: 'Amazon Connect',
      agent_name: 'Sarah Johnson',
      ticket_id: 'TKT-' + Math.floor(Math.random() * 10000),
      response_time: '24 hours',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      amount: '$99.99',
      department: 'Technical Support',
      reference_id: 'REF-' + Math.floor(Math.random() * 10000),
    };

    let text = template.text;
    Object.keys(vars).forEach(key => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), vars[key]);
    });

    setMessageInput(text);
    setShowTemplates(false);
  };

  const insertEmoji = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojis(false);
  };

  const getChannelIcon = (channel) => {
    const icons = {
      chat: MessageSquare,
      sms: Phone,
      whatsapp: MessageSquare,
      facebook: Facebook,
    };
    return icons[channel] || MessageSquare;
  };

  const getChannelColor = (channel) => {
    const colors = {
      chat: 'blue',
      sms: 'green',
      whatsapp: 'green',
      facebook: 'indigo',
    };
    return colors[channel] || 'gray';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-600" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredConversations = conversations.filter(conv =>
    (activeChannel === 'all' || conv.channel === activeChannel) &&
    (searchQuery === '' || conv.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!sdkManager?.isInitialized) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Chat & Messaging</h3>
        </div>
        <p className="text-gray-500">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Chat & Messaging</h2>
              <p className="text-white/80 text-sm">Multi-channel • Live Chat • SMS • Social Media</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              ['Chat', conversations.filter(c => c.channel === 'chat').length],
              ['SMS', conversations.filter(c => c.channel === 'sms').length],
              ['WhatsApp', conversations.filter(c => c.channel === 'whatsapp').length],
              ['Facebook', conversations.filter(c => c.channel === 'facebook').length],
            ].map(([label, count]) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <div className="text-xl font-bold">{count}</div>
                <div className="text-xs text-white/80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Channel Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-2 mb-3">
                {[
                  { id: 'all', label: 'All', icon: MessageSquare },
                  { id: 'chat', label: 'Chat', icon: MessageSquare },
                  { id: 'sms', label: 'SMS', icon: Phone },
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                  { id: 'facebook', label: 'FB', icon: Facebook },
                ].map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                        activeChannel === channel.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {channel.label}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => {
                const Icon = getChannelIcon(conv.channel);
                const color = getChannelColor(conv.channel);
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      loadMessages(conv.id);
                    }}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      activeConversation?.id === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center text-white font-semibold`}>
                        {conv.avatar}
                      </div>
                      {conv.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                      <Icon className={`absolute -bottom-1 -right-1 w-4 h-4 text-${color}-600 bg-white rounded-full p-0.5`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{conv.name}</span>
                        <span className="text-xs text-gray-500">{conv.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className={`ml-2 px-2 py-0.5 bg-${color}-600 text-white rounded-full text-xs font-medium`}>
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${getChannelColor(activeConversation.channel)}-400 to-${getChannelColor(activeConversation.channel)}-600 flex items-center justify-center text-white font-semibold`}>
                      {activeConversation.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{activeConversation.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        {activeConversation.status === 'online' ? (
                          <><div className="w-2 h-2 bg-green-500 rounded-full"></div>Online</>
                        ) : (
                          'Offline'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender === 'agent' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            msg.sender === 'agent'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none shadow'
                          }`}
                        >
                          {msg.type === 'text' && <p className="text-sm">{msg.text}</p>}
                          {msg.type === 'file' && msg.file && (
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">{msg.file.name}</div>
                                <div className="text-xs opacity-75">{formatFileSize(msg.file.size)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'agent' && getStatusIcon(msg.status)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white rounded-lg px-4 py-3 shadow">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex gap-2 overflow-x-auto">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => setMessageInput(reply.text)}
                        className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition-colors"
                      >
                        {reply.emoji} {reply.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Templates
                    </button>
                    <button
                      onClick={() => setShowEmojis(!showEmojis)}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Smile className="w-4 h-4" />
                      Emoji
                    </button>
                  </div>

                  {/* Template Selector */}
                  {showTemplates && (
                    <div className="mb-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {messageTemplates
                          .filter(t => t.channel === 'all' || t.channel === activeConversation.channel)
                          .map((template) => (
                            <button
                              key={template.id}
                              onClick={() => applyTemplate(template)}
                              className="text-left p-2 bg-white rounded border border-purple-200 hover:border-purple-500 transition-colors"
                            >
                              <div className="font-semibold text-sm text-gray-900">{template.name}</div>
                              <div className="text-xs text-gray-600 truncate">{template.text}</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmojis && (
                    <div className="mb-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <div className="grid grid-cols-10 gap-2">
                        {commonEmojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => insertEmoji(emoji)}
                            className="text-2xl hover:bg-yellow-100 rounded p-1 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{selectedFile.name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() && !selectedFile}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
