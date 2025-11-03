/**
 * Comprehensive Amazon Connect SDK Manager
 * Handles all Amazon Connect Agent Workspace client types and features
 */

import { AmazonConnectApp, AppContactScope } from '@amazon-connect/app';
import { VoiceClient } from '@amazon-connect/voice';
import { AgentClient, ContactClient } from '@amazon-connect/contact';
import { EmailClient } from '@amazon-connect/email';

// NOTE: Additional SDK clients (FileClient, MessageTemplateClient, etc.)
// may require specific Amazon Connect instance configuration to be enabled.
// The setup methods below will check availability at runtime.

// Global singleton to prevent multiple initializations
let globalSDKManager = null;
let isInitializing = false;

export class ConnectSDKManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.isInitialized = false;
    this.appProvider = null;
    
    // Client instances
    this.agentClient = null;
    this.contactClient = null;
    this.voiceClient = null;
    this.emailClient = null;
    this.fileClient = null;
    this.messageTemplateClient = null;
    this.quickResponsesClient = null;
    this.settingsClient = null;
    this.appControllerClient = null;
    
    // State management
    this.currentAgentState = null;
    this.currentContact = null;
    this.activeContacts = [];
    
    // Event listeners storage
    this.eventListeners = {
      agent: [],
      contact: [],
      voice: [],
      email: [],
    };
  }

  /**
   * Initialize the Amazon Connect SDK and all clients
   * For third-party apps embedded in Agent Workspace
   */
  async init() {
    if (this.isInitialized) {
      console.log('⚠️ SDK already initialized');
      this.callbacks.onStatusChange?.('Ready');
      this.callbacks.onReady?.(true);
      return;
    }

    if (isInitializing) {
      console.log('⚠️ SDK initialization in progress');
      return;
    }

    isInitializing = true;

    try {
      const { provider } = AmazonConnectApp.init({
        onCreate: (event) => {
          const { appInstanceId } = event.context;
          console.log('✅ Connected to Amazon Connect Workspace:', appInstanceId);
          this.appProvider = provider;
          this.setupAllClients();
          this.isInitialized = true;
          
          this.callbacks.onStatusChange?.('Ready - All features available');
          this.callbacks.onReady?.(true);
          console.log('✅ ConnectSDKManager fully initialized');
        },
        onDestroy: (event) => {
          console.log('🔄 App being destroyed');
          this.cleanup();
        }
      });

      provider.onError((error) => {
        console.error('❌ Workspace connection error:', error);
        
        if (error.key === 'workspaceConnectTimeout') {
          this.callbacks.onStatusChange?.('Not connected - Must run inside Agent Workspace');
          this.callbacks.onReady?.(false);
          console.info('ℹ️ This app must run inside Amazon Connect Agent Workspace');
        } else {
          this.callbacks.onStatusChange?.('Connection error: ' + error.key);
          this.callbacks.onReady?.(false);
        }
      });

      console.log('⏳ Connecting to Amazon Connect Workspace...');
      this.callbacks.onStatusChange?.('Connecting to Amazon Connect...');
    } catch (error) {
      console.error('❌ Failed to initialize SDK:', error);
      this.callbacks.onStatusChange?.('Error: ' + error.message);
      this.callbacks.onReady?.(false);
      throw error;
    } finally {
      isInitializing = false;
    }
  }

  /**
   * Setup all client instances
   */
  async setupAllClients() {
    try {
      // Core clients
      this.setupAgentClient();
      this.setupContactClient();
      this.setupVoiceClient();
      this.setupEmailClient();
      
      // Additional clients (async - check availability at runtime)
      await this.setupFileClient();
      await this.setupMessageTemplateClient();
      await this.setupQuickResponsesClient();
      await this.setupSettingsClient();
      
      console.log('✅ All available clients initialized');
    } catch (error) {
      console.error('❌ Error setting up clients:', error);
    }
  }

  /* ========================================
   * AGENT CLIENT METHODS
   * ======================================== */

  setupAgentClient() {
    try {
      this.agentClient = new AgentClient();
      
      // Subscribe to state changes
      this.agentClient.onStateChanged((data) => {
        console.log('👤 Agent state changed:', data);
        this.currentAgentState = data;
        this.callbacks.onAgentStateChange?.(data);
      });

      console.log('✅ AgentClient initialized');
    } catch (error) {
      console.error('❌ Failed to setup AgentClient:', error);
    }
  }

  async getAgentARN() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.getARN();
  }

  async getAgentName() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.getName();
  }

  async getAgentExtension() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.getExtension();
  }

  async getAgentState() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.getState();
  }

  async getChannelConcurrency() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.getChannelConcurrency();
  }

  async getRoutingProfile() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.getRoutingProfile();
  }

  async listAvailabilityStates() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    const states = await this.agentClient.listAvailabilityStates();
    
    // Log the states for debugging
    console.log('📋 Available states from SDK:', states);
    states.forEach(state => {
      console.log(`  - ${state.name} (${state.type}): ${state.arn || state.agentStateARN}`);
    });
    
    return states;
  }

  async listQuickConnects(queueArn) {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.listQuickConnects(queueArn);
  }

  async setAvailabilityState(stateArn) {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    
    console.log('🔧 SDK Manager: Setting availability state');
    console.log('📍 ARN:', stateArn);
    console.log('📍 Agent Client:', this.agentClient ? 'Initialized' : 'Not initialized');
    
    try {
      const result = await this.agentClient.setAvailabilityState(stateArn);
      console.log('✅ SDK Manager: State change successful', result);
      return result;
    } catch (error) {
      console.error('❌ SDK Manager: State change failed', error);
      
      if (error.message && error.message.includes('noResult')) {
        throw new Error('Not connected to Amazon Connect CCP. This app must be embedded in Amazon Connect Agent Workspace to change agent state.');
      }
      
      // Log full error details for debugging
      console.error('Full error details:', {
        message: error.message,
        key: error.key,
        name: error.name,
        stack: error.stack
      });
      
      throw error;
    }
  }

  async setAvailabilityStateByName(stateName) {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    return await this.agentClient.setAvailabilityStateByName(stateName);
  }

  async setOffline() {
    if (!this.agentClient) throw new Error('AgentClient not initialized');
    
    console.log('🔧 SDK Manager: Setting agent to offline');
    
    try {
      const result = await this.agentClient.setOffline();
      console.log('✅ SDK Manager: Set offline successful', result);
      return result;
    } catch (error) {
      console.error('❌ SDK Manager: Set offline failed', error);
      
      if (error.message && error.message.includes('noResult')) {
        throw new Error('Not connected to Amazon Connect CCP. This app must be embedded in Amazon Connect Agent Workspace to change agent state.');
      }
      
      throw error;
    }
  }

  /* ========================================
   * CONTACT CLIENT METHODS
   * ======================================== */

  setupContactClient() {
    try {
      console.log('🔧 Setting up ContactClient...');
      this.contactClient = new ContactClient();
      console.log('✅ ContactClient instance created');
      
      // Subscribe to contact lifecycle events (only the ones that exist in the SDK)
      // IMPORTANT: Events need AppContactScope.CurrentContactId as second parameter
      console.log('🔧 Subscribing to contact events with CurrentContactId scope...');
      
      // onConnected - fires when contact is connected
      this.contactClient.onConnected((data) => {
        console.log('📞 ✅ Contact CONNECTED event fired');
        console.log('📞 Contact data:', data);
        console.log('📞 Starting call tracking in MetricsTracker...');
        this.currentContact = data;
        this.callbacks.onContactConnected?.(data);
      }, AppContactScope.CurrentContactId);

      // onCleared - fires when contact is cleared/ended
      this.contactClient.onCleared((data) => {
        console.log('📞 ✅ Contact CLEARED event fired');
        console.log('📞 Contact data:', data);
        console.log('📞 Ending call tracking in MetricsTracker...');
        this.currentContact = null;
        this.callbacks.onContactCleared?.(data);
      }, AppContactScope.CurrentContactId);

      // onMissed - fires when contact is missed
      this.contactClient.onMissed((data) => {
        console.log('📞 ✅ Contact MISSED event fired');
        console.log('📞 Contact data:', data);
        console.log('📞 Recording missed call in MetricsTracker...');
        this.currentContact = null;
        this.callbacks.onContactMissed?.(data);
      }, AppContactScope.CurrentContactId);

      // onStartingAcw - fires when After Contact Work starts
      this.contactClient.onStartingAcw((data) => {
        console.log('📞 ✅ Starting ACW event fired');
        console.log('📞 ACW data:', data);
        this.callbacks.onStartingAcw?.(data);
      }, AppContactScope.CurrentContactId);

      console.log('✅ ContactClient initialized with 4 event listeners (with contact scope):');
      console.log('   - onConnected (for call start tracking)');
      console.log('   - onCleared (for call end tracking)');
      console.log('   - onMissed (for missed call tracking)');
      console.log('   - onStartingAcw (for ACW tracking)');
    } catch (error) {
      console.error('❌ Failed to setup ContactClient:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Stack:', error.stack);
    }
  }

  async acceptContact() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    return await this.contactClient.accept();
  }

  async clearContact() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    return await this.contactClient.clear();
  }

  async transferContact(transferDetails) {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    return await this.contactClient.transfer(transferDetails);
  }

  async addParticipant(participantDetails) {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    return await this.contactClient.addParticipant(participantDetails);
  }

  async getContactAttribute(attributeName) {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    try {
      return await this.contactClient.getAttribute(attributeName);
    } catch (error) {
      console.warn('⚠️ No active contact to get attribute from:', error.message);
      return null;
    }
  }

  async getContactAttributes() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    
    if (!this.currentContact) {
      console.warn('⚠️ No active contact tracked. Waiting for contact events...');
      return {};
    }
    
    try {
      const attributes = await this.contactClient.getAttributes();
      console.log('📋 Contact attributes retrieved:', attributes);
      return attributes;
    } catch (error) {
      console.warn('⚠️ Failed to get contact attributes:', error.message);
      return {};
    }
  }

  async getChannelType() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    
    if (!this.currentContact) {
      console.warn('⚠️ No active contact tracked');
      return null;
    }
    
    try {
      const channelType = await this.contactClient.getChannelType();
      console.log('📡 Channel type:', channelType);
      return channelType;
    } catch (error) {
      console.warn('⚠️ Failed to get channel type:', error.message);
      return null;
    }
  }

  async getInitialContactId() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    
    if (!this.currentContact) {
      console.warn('⚠️ No active contact tracked');
      return null;
    }
    
    try {
      const contactId = await this.contactClient.getInitialContactId();
      console.log('🆔 Contact ID:', contactId);
      return contactId;
    } catch (error) {
      console.warn('⚠️ Failed to get contact ID:', error.message);
      return null;
    }
  }

  async getQueue() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    
    if (!this.currentContact) {
      console.warn('⚠️ No active contact tracked');
      return null;
    }
    
    try {
      const queue = await this.contactClient.getQueue();
      console.log('📋 Queue info:', queue);
      return queue;
    } catch (error) {
      console.warn('⚠️ Failed to get queue info:', error.message);
      return null;
    }
  }

  async getQueueTimestamp() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    
    if (!this.currentContact) {
      console.warn('⚠️ No active contact tracked');
      return null;
    }
    
    try {
      return await this.contactClient.getQueueTimestamp();
    } catch (error) {
      console.warn('⚠️ Failed to get queue timestamp:', error.message);
      return null;
    }
  }

  // Helper method to check if there's an active contact
  hasActiveContact() {
    return this.currentContact !== null;
  }

  // Get current contact info
  getCurrentContact() {
    return this.currentContact;
  }

  async getStateDuration() {
    if (!this.contactClient) throw new Error('ContactClient not initialized');
    try {
      return await this.contactClient.getStateDuration();
    } catch (error) {
      console.warn('⚠️ No active contact to get state duration from:', error.message);
      return 0;
    }
  }

  /* ========================================
   * VOICE CLIENT METHODS
   * ======================================== */

  setupVoiceClient() {
    try {
      this.voiceClient = new VoiceClient();
      console.log('✅ VoiceClient initialized');
    } catch (error) {
      console.error('❌ Failed to setup VoiceClient:', error);
    }
  }

  async createOutboundCall(phoneNumber, options = {}) {
    if (!this.voiceClient) throw new Error('VoiceClient not initialized');
    
    const cleanNumber = this.formatPhoneNumber(phoneNumber);
    if (!this.isValidPhoneNumber(cleanNumber)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    const { canCall, reason } = await this.canMakeOutboundCall();
    if (!canCall) {
      throw new Error(reason || 'Agent is not available to make outbound calls');
    }

    console.log(`📞 Initiating outbound call to: ${cleanNumber}`);
    this.callbacks.onStatusChange?.(`Dialing ${cleanNumber}...`);

    const result = await this.voiceClient.createOutboundCall(cleanNumber, {
      queueARN: options.queueARN,
      relatedContactId: options.relatedContactId
    });

    console.log('✅ Outbound call created:', result);
    this.callbacks.onStatusChange?.(`Call initiated to ${cleanNumber}`);
    
    setTimeout(() => {
      this.callbacks.onStatusChange?.('Ready');
    }, 3000);
    
    return result;
  }

  async getOutboundCallPermission() {
    if (!this.voiceClient) throw new Error('VoiceClient not initialized');
    return await this.voiceClient.getOutboundCallPermission();
  }

  async getInitialCustomerPhoneNumber() {
    if (!this.voiceClient) throw new Error('VoiceClient not initialized');
    return await this.voiceClient.getInitialCustomerPhoneNumber();
  }

  async listDialableCountries() {
    if (!this.voiceClient) throw new Error('VoiceClient not initialized');
    return await this.voiceClient.listDialableCountries();
  }

  async canMakeOutboundCall() {
    if (!this.voiceClient || !this.agentClient) {
      return { canCall: false, reason: 'Clients not initialized' };
    }

    try {
      const permission = await this.voiceClient.getOutboundCallPermission();
      const agentState = await this.agentClient.getState();
      
      const availableStates = ['Available', 'AfterContactWork'];
      
      if (!permission) {
        return { canCall: false, reason: 'Agent does not have outbound call permission' };
      }
      
      if (!availableStates.includes(agentState.name)) {
        return { 
          canCall: false, 
          reason: `Agent state is "${agentState.name}". Must be Available or AfterContactWork` 
        };
      }
      
      return { canCall: true, reason: null };
    } catch (error) {
      console.error('❌ Error checking outbound call permission:', error);
      return { canCall: false, reason: `Permission check failed: ${error.message}` };
    }
  }

  /* ========================================
   * EMAIL CLIENT METHODS
   * Note: Requires @amazon-connect/email package
   * For demo purposes, includes mock implementation
   * ======================================== */

  setupEmailClient() {
    try {
      this.emailClient = new EmailClient();
      
      // Subscribe to email events
      this.emailClient.onAcceptedEmail((data) => {
        console.log('📧 Email accepted:', data);
        this.callbacks.onEmailAccepted?.(data);
      });
      
      this.emailClient.onDraftEmailCreated((data) => {
        console.log('📧 Draft email created:', data);
        this.callbacks.onDraftEmailCreated?.(data);
      });
      
      console.log('✅ EmailClient initialized from @amazon-connect/email');
    } catch (error) {
      console.error('❌ Failed to setup EmailClient:', error);
      this.emailClient = null;
    }
  }

  async isEmailEnabled() {
    // Email is enabled if we have an active EMAIL channel contact
    try {
      const channelType = await this.getChannelType();
      return channelType === 'EMAIL';
    } catch (error) {
      return false;
    }
  }

  async createDraftEmail(draftDetails) {
    if (!this.emailClient) {
      throw new Error('EmailClient not initialized');
    }
    
    try {
      // Create draft email contact using SDK
      // draftDetails should contain: to, emailContent, from (optional), cc (optional)
      const contactId = await this.emailClient.createDraftEmail(draftDetails);
      
      console.log('✅ Draft email created with contactId:', contactId);
      return contactId;
    } catch (error) {
      console.error('❌ Failed to create email draft:', error);
      throw error;
    }
  }

  async getEmailData() {
    // Get email data from contact attributes when channel type is EMAIL
    try {
      const channelType = await this.getChannelType();
      
      if (channelType !== 'EMAIL') {
        console.log('Current contact is not an EMAIL channel');
        return null;
      }
      
      const contactAttributes = await this.getContactAttributes();
      const contactId = await this.getInitialContactId();
      
      // Email data is stored in contact attributes
      return {
        contactId,
        fromAddress: contactAttributes.fromAddress || contactAttributes.customerEmail,
        toAddress: contactAttributes.toAddress || contactAttributes.agentEmail,
        subject: contactAttributes.subject || contactAttributes.emailSubject,
        body: contactAttributes.body || contactAttributes.emailBody,
        status: 'active',
        receivedTime: contactAttributes.receivedTime || new Date().toISOString(),
        inReplyTo: contactAttributes.inReplyTo,
        threadId: contactAttributes.threadId
      };
    } catch (error) {
      console.error('Error getting email data:', error);
      return null;
    }
  }

  async getEmailThread(threadOptions) {
    if (!this.emailClient) {
      throw new Error('EmailClient not initialized');
    }
    
    // Real implementation:
    // return await this.emailClient.getEmailThread(threadOptions);
    
    // Mock implementation - return sample thread
    const mockThread = [
      {
        id: 'msg_1',
        from: 'customer@example.com',
        to: 'support@company.com',
        subject: 'Product Inquiry',
        body: 'Hello, I have a question about your product...',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        attachments: []
      },
      {
        id: 'msg_2',
        from: 'support@company.com',
        to: 'customer@example.com',
        subject: 'Re: Product Inquiry',
        body: 'Thank you for reaching out! I would be happy to help...',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        attachments: []
      }
    ];
    
    // Store in mock storage
    if (threadOptions?.contactId) {
      this.emailClient._mockThreads.set(threadOptions.contactId, mockThread);
    }
    
    return mockThread;
  }

  async sendEmail(draftEmailContact) {
    if (!this.emailClient) {
      throw new Error('EmailClient not initialized');
    }
    
    try {
      // Send email using SDK
      // draftEmailContact must include contactId from createDraftEmail()
      await this.emailClient.sendEmail(draftEmailContact);
      
      console.log('✅ Email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  async getDraftEmails() {
    if (!this.emailClient) {
      throw new Error('EmailClient not initialized');
    }
    
    // Mock implementation
    return Array.from(this.emailClient._mockDrafts.values());
  }

  /* ========================================
   * FILE CLIENT METHODS (Placeholder)
   * Note: Requires @amazon-connect/file package
   * ======================================== */

  async setupFileClient() {
    try {
      try {
        const { FileClient } = await import('@amazon-connect/contact');
        if (FileClient) {
          this.fileClient = new FileClient();
          console.log('✅ FileClient initialized from SDK');
          return;
        }
      } catch (importError) {
        console.log('ℹ️ FileClient not exported from @amazon-connect/contact');
      }
      
      console.log('ℹ️ FileClient not available - file attachments require backend integration');
      this.fileClient = null;
    } catch (error) {
      console.warn('⚠️ FileClient setup error:', error.message);
      this.fileClient = null;
    }
  }

  async startAttachedFileUpload(uploadDetails) {
    if (!this.fileClient) {
      throw new Error('FileClient not initialized - requires @amazon-connect/file package');
    }
    return await this.fileClient.startAttachedFileUpload(uploadDetails);
  }

  async completeAttachedFileUpload(uploadId) {
    if (!this.fileClient) {
      throw new Error('FileClient not initialized');
    }
    return await this.fileClient.completeAttachedFileUpload(uploadId);
  }

  async getAttachedFileUrl(fileId) {
    if (!this.fileClient) {
      throw new Error('FileClient not initialized');
    }
    return await this.fileClient.getAttachedFileUrl(fileId);
  }

  async batchGetAttachedFileMetadata(fileIds) {
    if (!this.fileClient) {
      throw new Error('FileClient not initialized');
    }
    return await this.fileClient.batchGetAttachedFileMetadata(fileIds);
  }

  async deleteAttachedFile(fileId) {
    if (!this.fileClient) {
      throw new Error('FileClient not initialized');
    }
    return await this.fileClient.deleteAttachedFile(fileId);
  }

  /* ========================================
   * MESSAGE TEMPLATE CLIENT METHODS (Placeholder)
   * ======================================== */

  async setupMessageTemplateClient() {
    try {
      try {
        const { MessageTemplateClient } = await import('@amazon-connect/contact');
        if (MessageTemplateClient) {
          this.messageTemplateClient = new MessageTemplateClient();
          console.log('✅ MessageTemplateClient initialized from SDK');
          return;
        }
      } catch (importError) {
        console.log('ℹ️ MessageTemplateClient not exported from @amazon-connect/contact');
      }
      
      console.log('ℹ️ Using client-side template library instead');
      this.messageTemplateClient = null;
    } catch (error) {
      console.warn('⚠️ MessageTemplateClient setup error:', error.message);
      this.messageTemplateClient = null;
    }
  }

  async isMessageTemplateEnabled() {
    if (!this.messageTemplateClient) {
      throw new Error('MessageTemplateClient not initialized');
    }
    return await this.messageTemplateClient.isEnabled();
  }

  async searchMessageTemplates(searchCriteria) {
    if (!this.messageTemplateClient) {
      throw new Error('MessageTemplateClient not initialized');
    }
    return await this.messageTemplateClient.searchMessageTemplates(searchCriteria);
  }

  async getTemplateContent(templateDetails) {
    if (!this.messageTemplateClient) {
      throw new Error('MessageTemplateClient not initialized');
    }
    return await this.messageTemplateClient.getContent(templateDetails);
  }

  /* ========================================
   * QUICK RESPONSES CLIENT METHODS (Placeholder)
   * ======================================== */

  async setupQuickResponsesClient() {
    try {
      try {
        const { QuickResponsesClient } = await import('@amazon-connect/contact');
        if (QuickResponsesClient) {
          this.quickResponsesClient = new QuickResponsesClient();
          console.log('✅ QuickResponsesClient initialized from SDK');
          return;
        }
      } catch (importError) {
        console.log('ℹ️ QuickResponsesClient not exported from @amazon-connect/contact');
      }
      
      console.log('ℹ️ Using client-side quick replies instead');
      this.quickResponsesClient = null;
    } catch (error) {
      console.warn('⚠️ QuickResponsesClient setup error:', error.message);
      this.quickResponsesClient = null;
    }
  }

  async isQuickResponsesEnabled() {
    if (!this.quickResponsesClient) {
      throw new Error('QuickResponsesClient not initialized');
    }
    return await this.quickResponsesClient.isEnabled();
  }

  async searchQuickResponses(searchCriteria) {
    if (!this.quickResponsesClient) {
      throw new Error('QuickResponsesClient not initialized');
    }
    return await this.quickResponsesClient.searchQuickResponses(searchCriteria);
  }

  /* ========================================
   * SETTINGS CLIENT METHODS (Placeholder)
   * ======================================== */

  async setupSettingsClient() {
    try {
      try {
        const { SettingsClient } = await import('@amazon-connect/contact');
        if (SettingsClient) {
          this.settingsClient = new SettingsClient();
          
          // Subscribe to language changes
          if (this.settingsClient.onLanguageChanged) {
            this.settingsClient.onLanguageChanged((data) => {
              console.log('🌐 Language changed:', data);
              this.callbacks.onLanguageChanged?.(data);
            });
          }
          
          console.log('✅ SettingsClient initialized from SDK');
          return;
        }
      } catch (importError) {
        console.log('ℹ️ SettingsClient not exported from @amazon-connect/contact');
      }
      
      console.log('ℹ️ SettingsClient not available');
      this.settingsClient = null;
    } catch (error) {
      console.warn('⚠️ SettingsClient setup error:', error.message);
      this.settingsClient = null;
    }
  }

  async getLanguage() {
    if (!this.settingsClient) {
      throw new Error('SettingsClient not initialized');
    }
    return await this.settingsClient.getLanguage();
  }

  /* ========================================
   * UTILITY METHODS
   * ======================================== */

  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  isValidPhoneNumber(phoneNumber) {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Send error to Amazon Connect workspace
   */
  async sendError(error) {
    if (!this.isInitialized) {
      console.error('Cannot send error - SDK not initialized');
      return;
    }
    
    try {
      await AmazonConnectApp.sendError(error);
    } catch (err) {
      console.error('Failed to send error to workspace:', err);
    }
  }

  /**
   * Send fatal error to Amazon Connect workspace
   */
  async sendFatalError(error) {
    if (!this.isInitialized) {
      console.error('Cannot send fatal error - SDK not initialized');
      return;
    }
    
    try {
      await AmazonConnectApp.sendFatalError(error);
    } catch (err) {
      console.error('Failed to send fatal error to workspace:', err);
    }
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    // Cleanup event listeners
    Object.keys(this.eventListeners).forEach(category => {
      this.eventListeners[category] = [];
    });

    // Clear client references
    this.agentClient = null;
    this.contactClient = null;
    this.voiceClient = null;
    this.emailClient = null;
    this.fileClient = null;
    this.messageTemplateClient = null;
    this.quickResponsesClient = null;
    this.settingsClient = null;
    this.appControllerClient = null;
    
    this.appProvider = null;
    this.isInitialized = false;
    this.currentAgentState = null;
    this.currentContact = null;
    this.activeContacts = [];
  }
}

/**
 * Get or create the global SDK Manager instance
 */
export function getSDKManager(callbacks) {
  if (!globalSDKManager) {
    globalSDKManager = new ConnectSDKManager(callbacks);
  } else if (callbacks) {
    // Update callbacks if provided
    globalSDKManager.callbacks = { ...globalSDKManager.callbacks, ...callbacks };
  }
  return globalSDKManager;
}

export default ConnectSDKManager;
