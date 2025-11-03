import React, { useState, useEffect } from 'react';
import { FileText, Plus, ChevronDown, ChevronRight, Trash2, Clock, AlertCircle } from 'lucide-react';

/**
 * CaseManager - Create and manage customer cases
 */
function CaseManager() {
  const [cases, setCases] = useState([]);
  const [newCase, setNewCase] = useState({ title: '', type: 'technical', priority: 'medium', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [expandedCase, setExpandedCase] = useState(null);

  useEffect(() => {
    const savedCases = localStorage.getItem('crm-cases');
    if (savedCases) {
      setCases(JSON.parse(savedCases));
    } else {
      setCases([
        { 
          id: 1, 
          title: 'API Integration Support', 
          type: 'technical', 
          priority: 'high', 
          status: 'open', 
          description: 'Customer needs help integrating our API with their system. Requires technical documentation and code samples.', 
          createdAt: '2024-01-18', 
          updatedAt: '2024-01-20' 
        },
        { 
          id: 2, 
          title: 'Billing Discrepancy', 
          type: 'billing', 
          priority: 'medium', 
          status: 'in-progress', 
          description: 'Customer reported incorrect charge on invoice #8823. Investigating payment processing issue.', 
          createdAt: '2024-01-15', 
          updatedAt: '2024-01-19' 
        },
        { 
          id: 3, 
          title: 'Feature Enhancement Request', 
          type: 'general', 
          priority: 'low', 
          status: 'closed', 
          description: 'Customer requested dark mode theme support for dashboard.', 
          createdAt: '2024-01-10', 
          updatedAt: '2024-01-12' 
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (cases.length > 0) {
      localStorage.setItem('crm-cases', JSON.stringify(cases));
    }
  }, [cases]);

  const handleAddCase = () => {
    if (!newCase.title) return alert('Please enter a case title');
    
    setCases([{
      id: Date.now(),
      ...newCase,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }, ...cases]);
    
    setNewCase({ title: '', type: 'technical', priority: 'medium', description: '' });
    setShowForm(false);
  };

  const handleUpdateStatus = (caseId, newStatus) => {
    setCases(cases.map(c => 
      c.id === caseId 
        ? { ...c, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : c
    ));
  };

  const handleDeleteCase = (caseId) => {
    if (confirm('Delete this case?')) {
      setCases(cases.filter(c => c.id !== caseId));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed':
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'open': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    const colors = {
      technical: 'text-purple-600',
      billing: 'text-green-600',
      general: 'text-blue-600',
      complaint: 'text-red-600',
    };
    return <FileText className={`w-5 h-5 ${colors[type] || 'text-gray-600'}`} />;
  };

  const openCases = cases.filter(c => c.status === 'open' || c.status === 'in-progress');
  const closedCases = cases.filter(c => c.status === 'closed' || c.status === 'resolved');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Case Management</h3>
          <p className="text-sm text-gray-600">{openCases.length} open, {closedCases.length} closed</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Case Form */}
      {showForm && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 animate-fadeIn">
          <h4 className="font-semibold text-gray-900 mb-3">Create New Case</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Case title..."
              value={newCase.title}
              onChange={(e) => setNewCase({...newCase, title: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newCase.type}
                onChange={(e) => setNewCase({...newCase, type: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="general">General Inquiry</option>
                <option value="complaint">Complaint</option>
              </select>
              <select
                value={newCase.priority}
                onChange={(e) => setNewCase({...newCase, priority: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <textarea
              placeholder="Case description..."
              value={newCase.description}
              onChange={(e) => setNewCase({...newCase, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCase}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Case
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="space-y-3">
        {cases.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No cases yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first case to track customer issues</p>
          </div>
        ) : (
          cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(caseItem.type)}
                      <span className="font-semibold text-gray-900">{caseItem.title}</span>
                      <button
                        onClick={() => setExpandedCase(expandedCase === caseItem.id ? null : caseItem.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {expandedCase === caseItem.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="capitalize">{caseItem.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated: {caseItem.updatedAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedCase === caseItem.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-fadeIn">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Description</h5>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{caseItem.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-gray-900">Status:</h5>
                      <select
                        value={caseItem.status}
                        onChange={(e) => handleUpdateStatus(caseItem.id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteCase(caseItem.id)}
                        className="ml-auto px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CaseManager;
