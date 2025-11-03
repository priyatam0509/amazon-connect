import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, Phone, Clock, TrendingUp, Award, Target,
  Calendar, Users, ThumbsUp, AlertCircle, RefreshCw, UserCheck, UserX, PhoneCall, Coffee, Pause
} from 'lucide-react';
import { getMetricsTracker } from '../services/MetricsTracker';
import AgentService from '../services/AgentService';

/**
 * AnalyticsDashboard - Comprehensive analytics and reporting dashboard
 * Shows real-time metrics, performance charts, and statistics
 */
function AnalyticsDashboard({ sdkManager }) {
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState('today'); // 'today' or 'week'
  const [loading, setLoading] = useState(false);
  const [agentMetrics, setAgentMetrics] = useState(null);
  const [agentMetricsLoading, setAgentMetricsLoading] = useState(false);
  const [agentMetricsError, setAgentMetricsError] = useState(null);
  const [historicalMetrics, setHistoricalMetrics] = useState(null);
  const [historicalMetricsLoading, setHistoricalMetricsLoading] = useState(false);
  const [historicalMetricsError, setHistoricalMetricsError] = useState(null);
  const [historicalTimeRange, setHistoricalTimeRange] = useState(24); // hours
  const metricsTracker = getMetricsTracker();

  useEffect(() => {
    // Check localStorage directly
    const savedData = localStorage.getItem('amazonConnectMetrics');
    console.log('📊 AnalyticsDashboard: Raw localStorage data:', savedData ? JSON.parse(savedData) : 'No data');
    
    // Initial load
    const initialMetrics = metricsTracker.getMetrics();
    console.log('📊 AnalyticsDashboard: Initial metrics loaded:', {
      callHistory: initialMetrics.callHistory.length,
      totalToday: initialMetrics.calls.totalToday,
      totalWeek: initialMetrics.calls.totalWeek,
      completed: initialMetrics.calls.completed,
      missed: initialMetrics.calls.missed,
      active: initialMetrics.calls.active,
      avgHandleTime: initialMetrics.agentStats.averageHandleTime,
      satisfactionScore: initialMetrics.agentStats.satisfactionScore
    });
    setMetrics(initialMetrics);

    // Subscribe to updates
    const unsubscribe = metricsTracker.subscribe((updatedMetrics) => {
      console.log('📊 AnalyticsDashboard: Metrics updated:', {
        callHistory: updatedMetrics.callHistory.length,
        totalToday: updatedMetrics.calls.totalToday,
        completed: updatedMetrics.calls.completed,
        active: updatedMetrics.calls.active,
        avgHandleTime: updatedMetrics.agentStats.averageHandleTime
      });
      setMetrics(updatedMetrics);
    });

    // Load current agent metrics
    loadAgentMetrics();
    loadHistoricalMetrics(historicalTimeRange);

    // Auto-refresh agent metrics every 30 seconds
    const intervalId = setInterval(() => {
      loadAgentMetrics();
    }, 30000);

    // Auto-refresh historical metrics every 5 minutes
    const historicalIntervalId = setInterval(() => {
      loadHistoricalMetrics(historicalTimeRange);
    }, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
      clearInterval(historicalIntervalId);
    };
  }, [historicalTimeRange]);

  const loadAgentMetrics = async () => {
    setAgentMetricsLoading(true);
    setAgentMetricsError(null);
    try {
      const data = await AgentService.getCurrentAgentMetrics();
      setAgentMetrics(data);
      console.log('📊 Agent metrics loaded:', data);
    } catch (error) {
      setAgentMetricsError(error.message);
      console.error('Failed to load agent metrics:', error);
    } finally {
      setAgentMetricsLoading(false);
    }
  };

  const loadHistoricalMetrics = async (hoursBack = historicalTimeRange) => {
    setHistoricalMetricsLoading(true);
    setHistoricalMetricsError(null);
    try {
      // Always calculate fresh time range
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000);
      
      const data = await AgentService.getHistoricalAgentMetrics(hoursBack);
      
      // Attach the current time range to the data
      const dataWithTimeRange = {
        ...data,
        timeRange: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          hoursBack: hoursBack
        }
      };
      
      setHistoricalMetrics(dataWithTimeRange);
      console.log('📊 Historical metrics loaded:', dataWithTimeRange);
    } catch (error) {
      setHistoricalMetricsError(error.message);
      console.error('Failed to load historical metrics:', error);
    } finally {
      setHistoricalMetricsLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setMetrics(metricsTracker.getMetrics());
    loadAgentMetrics();
    loadHistoricalMetrics();
    setTimeout(() => setLoading(false), 500);
  };

  const handleReset = () => {
    if (confirm('Reset all analytics data? This will clear all tracked metrics.')) {
      metricsTracker.reset();
      setMetrics(metricsTracker.getMetrics());
    }
  };

  const handleTestCall = () => {
    console.log('🧪 Testing call tracking manually...');
    
    // Simulate a call
    const testContact = {
      contactId: `test_${Date.now()}`,
      type: 'Inbound',
      customerNumber: '+1234567890',
      queueName: 'Test Queue'
    };
    
    // Start call
    metricsTracker.startCall(testContact);
    console.log('🧪 Test call started');
    
    // End call after 5 seconds
    setTimeout(() => {
      metricsTracker.endCall(testContact, 'Completed');
      console.log('🧪 Test call ended');
    }, 5000);
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatTimeRange = (timeRange) => {
    if (!timeRange) return 'Select time range';
    
    try {
      // Always calculate fresh time range based on current time
      const now = new Date();
      const hoursBack = timeRange.hoursBack || historicalTimeRange;
      const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
      
      const formatOptions = {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      const startStr = startTime.toLocaleString('en-US', formatOptions);
      const endStr = now.toLocaleString('en-US', formatOptions);
      
      return `${startStr} - ${endStr}`;
    } catch (error) {
      console.error('Error formatting time range:', error);
      return 'Invalid time format';
    }
  };

  if (!metrics) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-state">
          <Activity size={48} className="loading-icon" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Check if we have any real data
  const hasRealData = metrics.callHistory.length > 0 || metrics.calls.totalToday > 0;

  // Calculate percentage changes
  const todayData = metrics.dailyStats[metrics.dailyStats.length - 1] || {};
  const yesterdayData = metrics.dailyStats[metrics.dailyStats.length - 2] || {};
  const callsChange = todayData.calls && yesterdayData.calls 
    ? ((todayData.calls - yesterdayData.calls) / yesterdayData.calls * 100).toFixed(1)
    : 0;

  // Prepare chart data based on time range
  const chartData = timeRange === 'today' 
    ? metrics.hourlyData 
    : metrics.dailyStats.slice(-7);

  // Performance score calculation
  const performanceScore = Math.round(
    (metrics.agentStats.satisfactionScore * 0.4) +
    (Math.min(metrics.calls.completed / 50, 1) * 100 * 0.3) +
    (Math.max(100 - (metrics.calls.missed / Math.max(metrics.calls.completed, 1) * 100), 0) * 0.3)
  );

  // Colors for charts
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      {/* <div className="dashboard-header">
        <div className="header-left">
          <Activity size={24} />
          <div>
            <h2>Analytics & Reporting</h2>
            <p className="header-subtitle">Real-time performance insights</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="time-range-selector">
            <button
              onClick={() => setTimeRange('today')}
              className={`range-btn ${timeRange === 'today' ? 'active' : ''}`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            >
              Week
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            className="icon-btn"
            disabled={loading}
            title="Refresh data"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div> */}

      {/* Empty State */}
      {/* {!hasRealData && (
        <div className="empty-state" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Activity size={64} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            No Analytics Data Yet
          </h3>
          <p style={{ color: '#64748b', marginBottom: '24px', maxWidth: '500px', margin: '0 auto' }}>
            Analytics will appear here once you start handling contacts. Accept an incoming call or make an outbound call to begin tracking metrics.
          </p>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: '#f1f5f9',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#475569'
          }}>
            <Phone size={16} />
            <span>Waiting for first contact...</span>
          </div>
        </div>
      )} */}

      {/* Real-time Agent Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Real-time Agent Status</h3>
              <p className="text-sm text-gray-500">
                {agentMetrics?.timestamp 
                  ? `Last updated: ${new Date(agentMetrics.timestamp).toLocaleTimeString()}`
                  : agentMetricsLoading 
                    ? 'Loading...' 
                    : 'No data available'}
              </p>
            </div>
          </div>
          <button
            onClick={loadAgentMetrics}
            disabled={agentMetricsLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${agentMetricsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {agentMetricsLoading && !agentMetrics ? (
          // Loading skeleton
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200 animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Agents Online */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-green-900">
                    {agentMetrics?.metrics.AGENTS_ONLINE || 0}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-green-800">Online</div>
            </div>

            {/* Agents Available */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-blue-900">
                    {agentMetrics?.metrics.AGENTS_AVAILABLE || 0}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-800">Available</div>
            </div>

            {/* Agents On Call */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-purple-900">
                    {agentMetrics?.metrics.AGENTS_ON_CALL || 0}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-purple-800">On Call</div>
            </div>

            {/* After Contact Work */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-orange-900">
                    {agentMetrics?.metrics.AGENTS_AFTER_CONTACT_WORK || 0}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-orange-800">After Call Work</div>
            </div>

            {/* Non-Productive */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                  <Pause className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {agentMetrics?.metrics.AGENTS_NON_PRODUCTIVE || 0}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-800">Non-Productive</div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Metrics Error */}
      {agentMetricsError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-900">Failed to load agent metrics</div>
            <div className="text-sm text-red-700">{agentMetricsError}</div>
          </div>
          <button
            onClick={loadAgentMetrics}
            className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Historical Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Historical Performance</h3>
              <p className="text-sm text-gray-500">
                {historicalMetricsLoading 
                  ? 'Loading...' 
                  : formatTimeRange(historicalMetrics?.timeRange)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <select
                value={historicalTimeRange}
                onChange={(e) => {
                  const hours = parseInt(e.target.value);
                  setHistoricalTimeRange(hours);
                  loadHistoricalMetrics(hours);
                }}
                disabled={historicalMetricsLoading}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:bg-gray-100"
              >
                <option value={1}>Last 1 Hour</option>
                <option value={3}>Last 3 Hours</option>
                <option value={6}>Last 6 Hours</option>
                <option value={12}>Last 12 Hours</option>
                <option value={24}>Last 24 Hours</option>
               
              </select>
            </div>
            <button
              onClick={() => loadHistoricalMetrics()}
              disabled={historicalMetricsLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${historicalMetricsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {historicalMetricsError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-red-900">Failed to load historical metrics</div>
              <div className="text-sm text-red-700">{historicalMetricsError}</div>
            </div>
            <button
              onClick={loadHistoricalMetrics}
              className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {historicalMetricsLoading && !historicalMetrics ? (
          // Loading skeleton
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Contacts Handled */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-xs font-medium text-blue-700 mb-1">Contacts Handled</div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {historicalMetrics?.metrics.CONTACTS_HANDLED?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-blue-600">Total</div>
            </div>

            {/* Handle Time */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-xs font-medium text-purple-700 mb-1">Avg Handle Time</div>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                {historicalMetrics?.metrics.HANDLE_TIME ? `${Math.floor(historicalMetrics.metrics.HANDLE_TIME / 60)}m ${Math.floor(historicalMetrics.metrics.HANDLE_TIME % 60)}s` : '0s'}
              </div>
              <div className="text-xs text-purple-600">{historicalMetrics?.metrics.HANDLE_TIME?.toFixed(0) || 0}s</div>
            </div>

            {/* ACW Time */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="text-xs font-medium text-orange-700 mb-1">Avg ACW Time</div>
              <div className="text-2xl font-bold text-orange-900 mb-1">
                {historicalMetrics?.metrics.AFTER_CONTACT_WORK_TIME ? `${Math.floor(historicalMetrics.metrics.AFTER_CONTACT_WORK_TIME / 60)}m ${Math.floor(historicalMetrics.metrics.AFTER_CONTACT_WORK_TIME % 60)}s` : '0s'}
              </div>
              <div className="text-xs text-orange-600">{historicalMetrics?.metrics.AFTER_CONTACT_WORK_TIME?.toFixed(0) || 0}s</div>
            </div>

            {/* Occupancy */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-xs font-medium text-green-700 mb-1">Occupancy</div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                {historicalMetrics?.metrics.OCCUPANCY?.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-green-600">Avg</div>
            </div>

            {/* Contacts Missed */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
              <div className="text-xs font-medium text-red-700 mb-1">Contacts Missed</div>
              <div className="text-2xl font-bold text-red-900 mb-1">
                {historicalMetrics?.metrics.CONTACTS_MISSED?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-red-600">Total</div>
            </div>

            {/* Contacts Abandoned */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="text-xs font-medium text-yellow-700 mb-1">Abandoned</div>
              <div className="text-2xl font-bold text-yellow-900 mb-1">
                {historicalMetrics?.metrics.CONTACTS_ABANDONED?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-yellow-600">Total</div>
            </div>

            {/* Interaction Time */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="text-xs font-medium text-indigo-700 mb-1">Avg Talk Time</div>
              <div className="text-2xl font-bold text-indigo-900 mb-1">
                {historicalMetrics?.metrics.INTERACTION_TIME ? `${Math.floor(historicalMetrics.metrics.INTERACTION_TIME / 60)}m ${Math.floor(historicalMetrics.metrics.INTERACTION_TIME % 60)}s` : '0s'}
              </div>
              <div className="text-xs text-indigo-600">{historicalMetrics?.metrics.INTERACTION_TIME?.toFixed(0) || 0}s</div>
            </div>

            {/* Contacts Queued */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
              <div className="text-xs font-medium text-cyan-700 mb-1">Contacts Queued</div>
              <div className="text-2xl font-bold text-cyan-900 mb-1">
                {historicalMetrics?.metrics.CONTACTS_QUEUED?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-cyan-600">Total</div>
            </div>

            {/* Transfers In */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <div className="text-xs font-medium text-pink-700 mb-1">Transfers In</div>
              <div className="text-2xl font-bold text-pink-900 mb-1">
                {historicalMetrics?.metrics.CONTACTS_TRANSFERRED_IN?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-pink-600">Total</div>
            </div>

            {/* Transfers Out */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
              <div className="text-xs font-medium text-teal-700 mb-1">Transfers Out</div>
              <div className="text-2xl font-bold text-teal-900 mb-1">
                {historicalMetrics?.metrics.CONTACTS_TRANSFERRED_OUT?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-teal-600">Total</div>
            </div>

            {/* Consulted */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
              <div className="text-xs font-medium text-violet-700 mb-1">Consulted</div>
              <div className="text-2xl font-bold text-violet-900 mb-1">
                {historicalMetrics?.metrics.CONTACTS_CONSULTED?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-violet-600">Total</div>
            </div>

            {/* Queues Included Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-1">Queues</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {historicalMetrics?.queuesIncluded || 0}
              </div>
              <div className="text-xs text-gray-600">Included</div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Metrics Cards */}
      {/* <div className="metrics-grid">
        <div className="metric-card active-calls">
          <div className="metric-icon" style={{ backgroundColor: '#3b82f620' }}>
            <Phone size={24} style={{ color: COLORS.primary }} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Active Calls</div>
            <div className="metric-value">{metrics.calls.active}</div>
            {metrics.currentCallDuration > 0 && (
              <div className="metric-subtitle">
                <Clock size={14} />
                <span>Duration: {formatDuration(metrics.currentCallDuration)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#10b98120' }}>
            <TrendingUp size={24} style={{ color: COLORS.success }} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Calls Today</div>
            <div className="metric-value">{metrics.calls.totalToday}</div>
            {callsChange !== 0 && (
              <div className={`metric-change ${callsChange > 0 ? 'positive' : 'negative'}`}>
                {callsChange > 0 ? '↑' : '↓'} {Math.abs(callsChange)}% vs yesterday
              </div>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#8b5cf620' }}>
            <Clock size={24} style={{ color: COLORS.purple }} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Avg Handle Time</div>
            <div className="metric-value">{formatTime(metrics.agentStats.averageHandleTime)}</div>
            <div className="metric-subtitle">
              Total: {formatTime(metrics.agentStats.totalHandleTime)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#f59e0b20' }}>
            <Award size={24} style={{ color: COLORS.warning }} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Satisfaction Score</div>
            <div className="metric-value">{metrics.agentStats.satisfactionScore.toFixed(1)}%</div>
            <div className="satisfaction-bar">
              <div 
                className="satisfaction-fill"
                style={{ width: `${metrics.agentStats.satisfactionScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#06b6d420' }}>
            <Target size={24} style={{ color: COLORS.cyan }} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Calls This Week</div>
            <div className="metric-value">{metrics.calls.totalWeek}</div>
            <div className="metric-subtitle">
              Completed: {metrics.calls.completed}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#ef444420' }}>
            <AlertCircle size={24} style={{ color: COLORS.danger }} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Missed Calls</div>
            <div className="metric-value">{metrics.calls.missed}</div>
            <div className="metric-subtitle">
              {metrics.calls.completed > 0 
                ? `${((metrics.calls.missed / metrics.calls.completed) * 100).toFixed(1)}% miss rate`
                : 'No data'}
            </div>
          </div>
        </div>
      </div> */}

      {/* Performance Score Card */}
      {/* <div className="performance-score-card">
        <div className="score-header">
          <ThumbsUp size={20} />
          <h3>Overall Performance Score</h3>
        </div>
        <div className="score-display">
          <div className="score-circle" style={{ 
            background: `conic-gradient(${COLORS.success} ${performanceScore * 3.6}deg, #e5e7eb 0deg)` 
          }}>
            <div className="score-inner">
              <div className="score-value">{performanceScore}</div>
              <div className="score-label">/ 100</div>
            </div>
          </div>
          <div className="score-breakdown">
            <div className="score-item">
              <span className="score-item-label">Satisfaction</span>
              <div className="score-bar">
                <div 
                  className="score-bar-fill"
                  style={{ 
                    width: `${metrics.agentStats.satisfactionScore}%`,
                    backgroundColor: COLORS.success
                  }}
                />
              </div>
              <span className="score-item-value">{metrics.agentStats.satisfactionScore.toFixed(0)}%</span>
            </div>
            <div className="score-item">
              <span className="score-item-label">Call Volume</span>
              <div className="score-bar">
                <div 
                  className="score-bar-fill"
                  style={{ 
                    width: `${Math.min((metrics.calls.completed / 50) * 100, 100)}%`,
                    backgroundColor: COLORS.primary
                  }}
                />
              </div>
              <span className="score-item-value">{metrics.calls.completed} calls</span>
            </div>
            <div className="score-item">
              <span className="score-item-label">Call Success</span>
              <div className="score-bar">
                <div 
                  className="score-bar-fill"
                  style={{ 
                    width: `${Math.max(100 - (metrics.calls.missed / Math.max(metrics.calls.completed, 1) * 100), 0)}%`,
                    backgroundColor: COLORS.purple
                  }}
                />
              </div>
              <span className="score-item-value">
                {Math.max(100 - (metrics.calls.missed / Math.max(metrics.calls.completed, 1) * 100), 0).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Charts Section */}
      {/* <div className="charts-grid">
        {/* Call Volume Chart */}
        {/* <div className="chart-card">
          <div className="chart-header">
            <h3>
              <Activity size={18} />
              Call Volume
            </h3>
            <span className="chart-subtitle">
              {timeRange === 'today' ? 'Hourly breakdown' : 'Last 7 days'}
            </span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={timeRange === 'today' ? 'hour' : 'date'} 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="calls" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Performance Trend Chart */}
        {/* <div className="chart-card">
          <div className="chart-header">
            <h3>
              <TrendingUp size={18} />
              Performance Trend
            </h3>
            <span className="chart-subtitle">Last 7 days</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.dailyStats.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Calls"
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke={COLORS.success} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Satisfaction %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Average Handle Time Chart */}
        {/* <div className="chart-card">
          <div className="chart-header">
            <h3>
              <Clock size={18} />
              Avg Handle Time
            </h3>
            <span className="chart-subtitle">Daily trend (seconds)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metrics.dailyStats.slice(-7)}>
                <defs>
                  <linearGradient id="colorHandleTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => formatTime(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgHandleTime" 
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHandleTime)"
                  name="Avg Handle Time"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      {/* </div> */}

      {/* Recent Call History
      {hasRealData && (
        <div className="call-history-card">
          <div className="card-header">
            <h3>
              <Calendar size={18} />
              Recent Call History
            </h3>
            <span className="call-count">{metrics.callHistory.length} calls</span>
          </div>
          <div className="call-history-table">
            {metrics.callHistory.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Queue</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.callHistory.slice(0, 10).map((call) => (
                    <tr key={call.id}>
                      <td>
                        <span className={`call-type-badge ${call.type.toLowerCase()}`}>
                          {call.type}
                        </span>
                      </td>
                      <td className="phone-number">{call.customerPhone}</td>
                      <td>{formatTime(call.duration)}</td>
                      <td>
                        <span className={`status-badge ${call.status.toLowerCase()}`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="timestamp">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </td>
                      <td>{call.queue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                No call history yet. Call history will appear here once contacts are completed.
              </div>
            )}
          </div>
        </div>
      )} */}

     

      
    </div>
  );
}

export default AnalyticsDashboard;
