/**
 * Message Templates for Chat & Messaging
 */

export const messageTemplates = [
  {
    id: 1,
    name: 'Welcome Message',
    category: 'Greeting',
    channel: 'all',
    text: 'Hi {{customer_name}}! 👋 Welcome to {{company_name}}. How can I help you today?',
    variables: ['customer_name', 'company_name'],
  },
  {
    id: 2,
    name: 'Thank You',
    category: 'Closing',
    channel: 'all',
    text: 'Thank you for contacting {{company_name}}, {{customer_name}}! Is there anything else I can help you with? 😊',
    variables: ['customer_name', 'company_name'],
  },
  {
    id: 3,
    name: 'Hold Please',
    category: 'Support',
    channel: 'all',
    text: 'Please bear with me for a moment while I look into this for you. ⏳',
    variables: [],
  },
  {
    id: 4,
    name: 'Ticket Created',
    category: 'Support',
    channel: 'all',
    text: 'I\'ve created a support ticket #{{ticket_id}} for your issue. Our team will follow up within {{response_time}}.',
    variables: ['ticket_id', 'response_time'],
  },
  {
    id: 5,
    name: 'Appointment Scheduled',
    category: 'Scheduling',
    channel: 'all',
    text: 'Great! I\'ve scheduled your appointment for {{date}} at {{time}}. You\'ll receive a confirmation shortly. 📅',
    variables: ['date', 'time'],
  },
  {
    id: 6,
    name: 'Payment Received',
    category: 'Billing',
    channel: 'all',
    text: 'Your payment of {{amount}} has been received successfully. Thank you! 💳✅',
    variables: ['amount'],
  },
  {
    id: 7,
    name: 'Out of Office',
    category: 'Auto-Reply',
    channel: 'all',
    text: 'Thanks for your message! Our support team is currently offline. We\'ll respond within {{response_time}}. ⏰',
    variables: ['response_time'],
  },
  {
    id: 8,
    name: 'Transfer Notice',
    category: 'Support',
    channel: 'chat',
    text: 'I\'m transferring you to our {{department}} specialist who can better assist you. Please hold. 🔄',
    variables: ['department'],
  },
  {
    id: 9,
    name: 'SMS Confirmation',
    category: 'Confirmation',
    channel: 'sms',
    text: '{{company_name}}: Your request has been confirmed. Reference: {{reference_id}}',
    variables: ['company_name', 'reference_id'],
  },
  {
    id: 10,
    name: 'WhatsApp Welcome',
    category: 'Greeting',
    channel: 'whatsapp',
    text: '👋 Hi {{customer_name}}! This is {{agent_name}} from {{company_name}}. How may I assist you today?',
    variables: ['customer_name', 'agent_name', 'company_name'],
  },
];

export const quickReplies = [
  { id: 1, text: 'Yes, please', emoji: '👍' },
  { id: 2, text: 'No, thank you', emoji: '🙏' },
  { id: 3, text: 'Let me think about it', emoji: '🤔' },
  { id: 4, text: 'I need more information', emoji: '📋' },
  { id: 5, text: 'Can you call me?', emoji: '📞' },
  { id: 6, text: 'Send me an email', emoji: '📧' },
];

export const commonEmojis = [
  '😊', '👍', '❤️', '😃', '🙏', '👋', '✅', '⭐', '🎉', '💯',
  '🔥', '💪', '🤝', '📧', '📞', '⏰', '📅', '💳', '🛒', '📦',
  '⚡', '🚀', '✨', '💡', '🎯', '📊', '📈', '🔔', '⚠️', '❌'
];

export default messageTemplates;
