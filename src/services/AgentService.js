/**
 * AgentService - Service for managing agent-related API calls
 * Handles fetching and managing agent data from the API
 */

const API_BASE_URL = 'https://5uqastf4d1.execute-api.us-east-1.amazonaws.com/prod';
const INSTANCE_ID = 'c6338b37-410e-46b2-90e1-6471228865fd';

class AgentService {
  /**
   * Fetches all agents from the API
   * @returns {Promise<Array>} Array of agent objects
   */
  static async listAllAgents() {
    try {
      const response = await fetch(`${API_BASE_URL}/agents?instanceId=${INSTANCE_ID}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch agents');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  /**
   * Gets a single agent by ID
   * @param {string} agentId - The ID of the agent to fetch
   * @returns {Promise<Object>} Agent object
   */
  static async getAgentById(agentId) {
    try {
      const agents = await this.listAllAgents();
      const agent = agents.find(a => a.Id === agentId);
      
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      return agent;
    } catch (error) {
      console.error(`Error fetching agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Searches for agents by username
   * @param {string} searchTerm - The search term to match against usernames
   * @returns {Promise<Array>} Array of matching agent objects
   */
  static async searchAgents(searchTerm) {
    try {
      const agents = await this.listAllAgents();
      const searchLower = searchTerm.toLowerCase();
      
      return agents.filter(agent => 
        agent.Username.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching agents:', error);
      throw error;
    }
  }

  /**
   * Gets current agent metrics
   * @param {Array} metrics - Array of metric names to retrieve
   * @param {Array} channels - Array of channel types (e.g., ['VOICE', 'CHAT'])
   * @returns {Promise<Object>} Current metrics data
   */
  static async getCurrentAgentMetrics(
    metrics = ['AGENTS_AVAILABLE', 'AGENTS_ON_CALL', 'AGENTS_ONLINE', 'AGENTS_AFTER_CONTACT_WORK', 'AGENTS_NON_PRODUCTIVE'],
    channels = ['VOICE', 'CHAT']
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/metrics/current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId: INSTANCE_ID,
          metrics,
          channels
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agent metrics: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch agent metrics');
      }
      
      // Transform the response into a more usable format
      const metricsMap = {};
      if (data.data && data.data.length > 0 && data.data[0].Collections) {
        data.data[0].Collections.forEach(collection => {
          const metricName = collection.Metric.Name;
          metricsMap[metricName] = collection.Value;
        });
      }
      
      return {
        metrics: metricsMap,
        timestamp: data.dataSnapshotTime,
        raw: data.data
      };
    } catch (error) {
      console.error('Error fetching current agent metrics:', error);
      throw error;
    }
  }

  /**
   * Gets all routing profiles
   * @returns {Promise<Array>} Array of routing profile objects
   */
  static async getAllRoutingProfiles() {
    try {
      const response = await fetch(`${API_BASE_URL}/routing-profiles?instanceId=${INSTANCE_ID}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch routing profiles: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch routing profiles');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching routing profiles:', error);
      throw error;
    }
  }

  /**
   * Gets all security profiles
   * @returns {Promise<Array>} Array of security profile objects
   */
  static async getAllSecurityProfiles() {
    try {
      const response = await fetch(`${API_BASE_URL}/security-profiles?instanceId=${INSTANCE_ID}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch security profiles: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch security profiles');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching security profiles:', error);
      throw error;
    }
  }

  /**
   * Gets all queues
   * @returns {Promise<Array>} Array of queue objects
   */
  static async getAllQueues() {
    try {
      const response = await fetch(`${API_BASE_URL}/queues?instanceId=${INSTANCE_ID}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch queues: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch queues');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching queues:', error);
      throw error;
    }
  }

  /**
   * Gets historical agent metrics
   * @param {number} hoursBack - Number of hours to look back from now (default: 24)
   * @param {Array} metrics - Array of metric names to retrieve
   * @param {Array} channels - Array of channel types (e.g., ['VOICE', 'CHAT'])
   * @returns {Promise<Object>} Historical metrics data
   */
  static async getHistoricalAgentMetrics(
    hoursBack = 24,
    metrics = [
      'CONTACTS_HANDLED',
      'HANDLE_TIME',
      'AFTER_CONTACT_WORK_TIME',
      'CONTACTS_MISSED',
      'CONTACTS_QUEUED',
      'INTERACTION_TIME',
      'OCCUPANCY',
      'CONTACTS_ABANDONED',
      'CONTACTS_CONSULTED',
      'CONTACTS_TRANSFERRED_IN',
      'CONTACTS_TRANSFERRED_OUT'
    ],
    channels = ['VOICE']
  ) {
    try {
      // Calculate time range
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000);
      
      // Format dates to ISO string (UTC)
      const startTimeISO = startTime.toISOString().split('.')[0] + 'Z';
      const endTimeISO = endTime.toISOString().split('.')[0] + 'Z';
      
      console.log('📊 Fetching historical metrics:', {
        hoursBack,
        startTime: startTimeISO,
        endTime: endTimeISO
      });
      
      const response = await fetch(`${API_BASE_URL}/agents/metrics/historical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId: INSTANCE_ID,
          startTime: startTimeISO,
          endTime: endTimeISO,
          metrics,
          channels
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Historical metrics response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch historical metrics');
      }
      
      // Transform the response into a more usable format
      const metricsMap = {};
      
      // Aggregate metrics across all queues
      if (data.data && data.data.length > 0) {
        data.data.forEach(queueData => {
          if (queueData.Collections) {
            queueData.Collections.forEach(collection => {
              const metricName = collection.Metric.Name;
              const metricValue = collection.Value || 0;
              
              // For SUM metrics, add them up
              if (collection.Metric.Statistic === 'SUM') {
                metricsMap[metricName] = (metricsMap[metricName] || 0) + metricValue;
              } 
              // For AVG metrics, we'll calculate weighted average based on contacts handled
              else if (collection.Metric.Statistic === 'AVG') {
                if (!metricsMap[metricName]) {
                  metricsMap[metricName] = { total: 0, count: 0 };
                }
                metricsMap[metricName].total += metricValue;
                metricsMap[metricName].count += 1;
              }
            });
          }
        });
        
        // Convert AVG metrics to actual averages
        Object.keys(metricsMap).forEach(key => {
          if (typeof metricsMap[key] === 'object' && metricsMap[key].count) {
            metricsMap[key] = metricsMap[key].total / metricsMap[key].count;
          }
        });
      }
      
      return {
        metrics: metricsMap,
        timeRange: data.timeRangeUsed || { startTime: startTimeISO, endTime: endTimeISO },
        queuesIncluded: data.queuesIncluded || 0,
        groupedBy: data.groupedBy || [],
        raw: data.data,
        hoursBack
      };
    } catch (error) {
      console.error('Error fetching historical agent metrics:', error);
      throw error;
    }
  }

  /**
   * Send email via AWS SES API
   * @param {Object} emailData - Email configuration
   * @returns {Promise<Object>} Response from SES API
   */
  static async sendEmail(emailData) {
    try {
      const {
        emailType = 'simple',
        sender,
        recipient,
        cc = [],
        bcc = [],
        subject,
        message,
        isHtml = false,
        templateName,
        templateData
      } = emailData;

      const API_URL = 'https://uxwyqhmh6b.execute-api.us-east-1.amazonaws.com/prod/send-email';

      const requestBody = {
        email_type: emailType,
        sender: sender,
        recipient: recipient,
        subject: subject,
        message: message
      };

      // Add optional fields
      if (cc && cc.length > 0) {
        requestBody.cc = cc;
      }
      if (bcc && bcc.length > 0) {
        requestBody.bcc = bcc;
      }
      if (isHtml) {
        requestBody.is_html = true;
      }
      if (emailType === 'template') {
        requestBody.template_name = templateName;
        requestBody.template_data = templateData;
      }

      console.log('📧 Sending email via SES API:', requestBody);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SES API Error:', errorText);
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📧 Email sent successfully:', data);

      return {
        success: true,
        data: data,
        messageId: data.MessageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export default AgentService;
