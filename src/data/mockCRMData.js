/**
 * Mock CRM Data for Customer 360° View
 */

export const mockCRMData = {
  id: 'CUST-2024-001',
  tier: 'Gold',
  lifetimeValue: 12500,
  joinDate: '2023-05-15',
  lastContact: '2024-01-20',
  totalPurchases: 24,
  averageOrderValue: 520.83,
  preferredChannel: 'Phone',
  timezone: 'EST',
  language: 'English',
  tags: ['VIP', 'Premium', 'Loyal Customer'],
  
  purchaseHistory: [
    { id: 'PO-001', date: '2024-01-15', amount: 899.99, items: 'Premium Package - Annual', status: 'Completed', category: 'Subscription' },
    { id: 'PO-002', date: '2024-01-10', amount: 249.99, items: 'Add-on Services x3', status: 'Completed', category: 'Services' },
    { id: 'PO-003', date: '2023-12-20', amount: 1299.99, items: 'Enterprise Bundle', status: 'Completed', category: 'Products' },
    { id: 'PO-004', date: '2023-12-01', amount: 449.99, items: 'Professional Tools', status: 'Completed', category: 'Products' },
    { id: 'PO-005', date: '2023-11-15', amount: 199.99, items: 'Basic Package', status: 'Completed', category: 'Subscription' },
  ],

  tickets: [
    { id: 'TKT-456', date: '2024-01-18', subject: 'Feature request: API integration', status: 'In Progress', priority: 'high', agent: 'Sarah Johnson' },
    { id: 'TKT-445', date: '2024-01-10', subject: 'Billing inquiry - Invoice #8823', status: 'Resolved', priority: 'medium', agent: 'Mike Chen' },
    { id: 'TKT-432', date: '2023-12-28', subject: 'Login issues after update', status: 'Resolved', priority: 'high', agent: 'Emily Davis' },
    { id: 'TKT-421', date: '2023-12-15', subject: 'General support question', status: 'Resolved', priority: 'low', agent: 'John Smith' },
  ],

  interactions: [
    { 
      id: 1, 
      date: '2024-01-20 14:30', 
      channel: 'phone', 
      agent: 'Sarah Johnson', 
      duration: '12m 30s', 
      sentiment: 'positive', 
      summary: 'Customer inquired about upgrading to premium package. Showed interest in annual subscription with 20% discount.',
      tags: ['Sales', 'Upsell'],
      outcome: 'Follow-up scheduled'
    },
    { 
      id: 2, 
      date: '2024-01-18 10:15', 
      channel: 'email', 
      agent: 'System', 
      sentiment: 'neutral', 
      summary: 'Feature request submitted via customer portal requesting API documentation and integration guides.',
      tags: ['Product', 'Feature Request'],
      outcome: 'Ticket created'
    },
    { 
      id: 3, 
      date: '2024-01-15 16:45', 
      channel: 'chat', 
      agent: 'Mike Chen', 
      duration: '8m 15s', 
      sentiment: 'positive', 
      summary: 'Customer had questions about recent invoice. Billing discrepancy resolved by applying promotional code.',
      tags: ['Billing', 'Support'],
      outcome: 'Resolved'
    },
    { 
      id: 4, 
      date: '2024-01-10 09:20', 
      channel: 'phone', 
      agent: 'John Smith', 
      duration: '15m 45s', 
      sentiment: 'negative', 
      summary: 'Customer experienced login issues after system update. Technical team escalated. Password reset provided.',
      tags: ['Technical', 'Urgent'],
      outcome: 'Escalated to Tier 2'
    },
    { 
      id: 5, 
      date: '2024-01-05 11:30', 
      channel: 'video', 
      agent: 'Emily Davis', 
      duration: '25m 00s', 
      sentiment: 'positive', 
      summary: 'Conducted product demo and training session for new enterprise features. Customer very satisfied.',
      tags: ['Training', 'Product'],
      outcome: 'Training completed'
    },
    { 
      id: 6, 
      date: '2023-12-28 14:20', 
      channel: 'chat', 
      agent: 'Sarah Johnson', 
      duration: '6m 10s', 
      sentiment: 'neutral', 
      summary: 'General inquiry about holiday support hours and response times during break period.',
      tags: ['General', 'Info'],
      outcome: 'Answered'
    },
  ],

  sentiment_history: [
    { date: '2024-01-20', score: 85, trend: 'up' },
    { date: '2024-01-15', score: 78, trend: 'up' },
    { date: '2024-01-10', score: 65, trend: 'down' },
    { date: '2024-01-05', score: 82, trend: 'up' },
    { date: '2023-12-30', score: 80, trend: 'stable' },
    { date: '2023-12-25', score: 80, trend: 'stable' },
    { date: '2023-12-20', score: 75, trend: 'up' },
  ],
};

export default mockCRMData;
