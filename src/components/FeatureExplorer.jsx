import React, { useState } from 'react';
import { 
  User, PhoneCall, Mail, FileText, MessageSquare, 
  Settings, BookOpen, Zap, ChevronRight 
} from 'lucide-react';

/**
 * Feature Explorer - Shows all available SDK features and their documentation
 */
function FeatureExplorer({ sdkManager }) {
  const [selectedCategory, setSelectedCategory] = useState('Agent');
  const [testResults, setTestResults] = useState({});

  const featureCategories = {
    Agent: {
      icon: <User size={18} />,
      color: '#3b82f6',
      features: [
        { name: 'getAgentName', desc: 'Get agent full name', test: () => sdkManager.getAgentName() },
        { name: 'getAgentExtension', desc: 'Get agent phone extension', test: () => sdkManager.getAgentExtension() },
        { name: 'getAgentState', desc: 'Get current agent state', test: () => sdkManager.getAgentState() },
        { name: 'getRoutingProfile', desc: 'Get routing profile', test: () => sdkManager.getRoutingProfile() },
        { name: 'getChannelConcurrency', desc: 'Get channel concurrency config', test: () => sdkManager.getChannelConcurrency() },
        { name: 'listAvailabilityStates', desc: 'List all availability states', test: () => sdkManager.listAvailabilityStates() },
      ]
    },
    Contact: {
      icon: <PhoneCall size={18} />,
      color: '#10b981',
      features: [
        { name: 'getContactAttributes', desc: 'Get all contact attributes', test: () => sdkManager.getContactAttributes() },
        { name: 'getChannelType', desc: 'Get contact channel type', test: () => sdkManager.getChannelType() },
        { name: 'getQueue', desc: 'Get contact queue info', test: () => sdkManager.getQueue() },
        { name: 'getInitialContactId', desc: 'Get initial contact ID', test: () => sdkManager.getInitialContactId() },
      ]
    },
    Voice: {
      icon: <PhoneCall size={18} />,
      color: '#8b5cf6',
      features: [
        { name: 'getOutboundCallPermission', desc: 'Check outbound permission', test: () => sdkManager.getOutboundCallPermission() },
        { name: 'listDialableCountries', desc: 'List dialable countries', test: () => sdkManager.listDialableCountries() },
        { name: 'canMakeOutboundCall', desc: 'Validate call capability', test: () => sdkManager.canMakeOutboundCall() },
      ]
    },
    Email: {
      icon: <Mail size={18} />,
      color: '#f59e0b',
      features: [
        { name: 'isEmailEnabled', desc: 'Check if email is enabled', test: () => sdkManager.isEmailEnabled() },
        { name: 'createDraftEmail', desc: 'Create draft email', test: () => sdkManager.createDraftEmail({
          destinationAddress: 'customer@example.com',
          subject: 'Test Email',
          body: 'This is a test email from Feature Explorer'
        }) },
        { name: 'getEmailData', desc: 'Get email metadata', test: () => sdkManager.getEmailData() },
        { name: 'getEmailThread', desc: 'Get email thread', test: () => sdkManager.getEmailThread({ contactId: 'test' }) },
        { name: 'getDraftEmails', desc: 'Get all draft emails', test: () => sdkManager.getDraftEmails() },
      ]
    },
    File: {
      icon: <FileText size={18} />,
      color: '#ec4899',
      features: [
        { name: 'startAttachedFileUpload', desc: 'Start file upload (requires package)', test: null },
        { name: 'getAttachedFileUrl', desc: 'Get file download URL', test: null },
        { name: 'deleteAttachedFile', desc: 'Delete attached file', test: null },
      ]
    },
    Templates: {
      icon: <BookOpen size={18} />,
      color: '#06b6d4',
      features: [
        { name: 'searchMessageTemplates', desc: 'Search templates (requires package)', test: null },
        { name: 'getTemplateContent', desc: 'Get template content', test: null },
      ]
    },
    QuickResponses: {
      icon: <Zap size={18} />,
      color: '#14b8a6',
      features: [
        { name: 'searchQuickResponses', desc: 'Search quick responses (requires package)', test: null },
        { name: 'isQuickResponsesEnabled', desc: 'Check if enabled', test: null },
      ]
    },
    Settings: {
      icon: <Settings size={18} />,
      color: '#6366f1',
      features: [
        { name: 'getLanguage', desc: 'Get user language setting (requires package)', test: null },
      ]
    }
  };

  const testFeature = async (featureName, testFn) => {
    if (!testFn) {
      setTestResults(prev => ({
        ...prev,
        [featureName]: { status: 'unavailable', message: 'Feature requires additional package' }
      }));
      return;
    }

    setTestResults(prev => ({
      ...prev,
      [featureName]: { status: 'testing', message: 'Testing...' }
    }));

    try {
      const result = await testFn();
      
      // Check if result is null/empty (no active contact)
      if (result === null || result === undefined || 
          (typeof result === 'object' && Object.keys(result).length === 0)) {
        setTestResults(prev => ({
          ...prev,
          [featureName]: { 
            status: 'warning', 
            message: 'No active contact - This feature requires an active contact in Amazon Connect',
            data: 'Result: ' + JSON.stringify(result)
          }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [featureName]: { 
            status: 'success', 
            message: 'Success', 
            data: JSON.stringify(result, null, 2) 
          }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [featureName]: { 
          status: 'error', 
          message: error.message 
        }
      }));
    }
  };

  if (!sdkManager || !sdkManager.isInitialized) {
    return (
      <div className="panel feature-explorer">
        <h3><BookOpen size={18} /> Feature Explorer</h3>
        <p className="text-muted">SDK not initialized</p>
      </div>
    );
  }

  const selectedFeatures = featureCategories[selectedCategory];

  return (
    <div className="panel feature-explorer">
      <div className="panel-header">
        <h3><BookOpen size={18} /> Feature Explorer</h3>
        <span className="feature-count">
          {Object.values(featureCategories).reduce((sum, cat) => sum + cat.features.length, 0)} Features
        </span>
      </div>

      <div className="panel-content">
        {/* Category Tabs */}
        <div className="category-tabs">
          {Object.entries(featureCategories).map(([name, category]) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`category-tab ${selectedCategory === name ? 'active' : ''}`}
              style={{ 
                borderColor: selectedCategory === name ? category.color : 'transparent',
                color: selectedCategory === name ? category.color : '#6b7280'
              }}
            >
              {category.icon}
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* Feature List */}
        <div className="feature-list">
          {selectedFeatures.features.map((feature) => {
            const result = testResults[feature.name];
            
            return (
              <div key={feature.name} className="feature-item">
                <div className="feature-info">
                  <div className="feature-name">{feature.name}()</div>
                  <div className="feature-desc">{feature.desc}</div>
                  {result && (
                    <div className={`feature-result ${result.status}`}>
                      {result.message}
                      {result.data && (
                        <pre className="result-data">{result.data}</pre>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => testFeature(feature.name, feature.test)}
                  className="btn btn-sm btn-test"
                  disabled={!feature.test || result?.status === 'testing'}
                >
                  {feature.test ? 'Test' : 'N/A'}
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
       </div> 
    </div>
  );
}

export default FeatureExplorer;
