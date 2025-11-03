/**
 * MetricsTracker - Service for tracking and managing analytics data
 * Tracks calls, agent performance, and generates statistics
 */

class MetricsTracker {
  constructor() {
    this.metrics = {
      calls: {
        active: 0,
        totalToday: 0,
        totalWeek: 0,
        completed: 0,
        missed: 0,
        abandoned: 0,
      },
      callHistory: [],
      dailyStats: [],
      weeklyStats: [],
      currentCallStart: null,
      currentCallDuration: 0,
      agentStats: {
        totalHandleTime: 0,
        averageHandleTime: 0,
        satisfactionScore: 0,
        callsHandled: 0,
        acwTime: 0,
        idleTime: 0,
      },
      hourlyData: Array(24).fill(0).map((_, hour) => ({ hour, calls: 0 })),
    };

    // Load from localStorage if available
    this.loadFromStorage();
    
    // Initialize daily stats structure for today
    this.ensureTodayStats();

    // Update current call duration every second
    this.durationInterval = setInterval(() => {
      if (this.metrics.currentCallStart) {
        this.metrics.currentCallDuration = 
          Math.floor((Date.now() - this.metrics.currentCallStart) / 1000);
        this.notifyListeners();
      }
    }, 1000);

    this.listeners = [];
  }

  /**
   * Ensure today's stats structure exists
   */
  ensureTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Ensure hourly data structure exists
    if (!this.metrics.hourlyData || this.metrics.hourlyData.length === 0) {
      this.metrics.hourlyData = Array(24).fill(0).map((_, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        calls: 0,
      }));
      console.log('📊 Created hourly data structure (24 hours)');
    }
    
    // Ensure today exists in daily stats
    let todayStats = this.metrics.dailyStats.find(d => d.date === today);
    if (!todayStats) {
      todayStats = {
        date: today,
        calls: 0,
        avgHandleTime: 0,
        satisfaction: 0,
        completed: 0,
        missed: 0,
      };
      this.metrics.dailyStats.push(todayStats);
      console.log('📊 Created daily stats for today:', today);
    }
    
    // Recalculate totals from actual data
    this.recalculateTotals();
    
    console.log('📊 Stats structures ready:', {
      hourlyDataLength: this.metrics.hourlyData.length,
      dailyStatsLength: this.metrics.dailyStats.length,
      todayDate: today
    });
  }

  /**
   * Recalculate aggregate statistics from real data
   */
  recalculateTotals() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.metrics.dailyStats.find(d => d.date === today);
    
    this.metrics.calls.totalToday = todayStats?.calls || 0;
    this.metrics.calls.totalWeek = this.metrics.dailyStats
      .slice(-7)
      .reduce((sum, day) => sum + (day.calls || 0), 0);
    this.metrics.calls.completed = this.metrics.callHistory.filter(c => c.status === 'Completed').length;
    this.metrics.calls.missed = this.metrics.callHistory.filter(c => c.status === 'Missed').length;

    const completedCalls = this.metrics.callHistory.filter(c => c.status === 'Completed');
    const totalDuration = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    
    this.metrics.agentStats.totalHandleTime = totalDuration;
    this.metrics.agentStats.callsHandled = completedCalls.length;
    this.metrics.agentStats.averageHandleTime = completedCalls.length > 0 
      ? Math.floor(totalDuration / completedCalls.length)
      : 0;
    
    // Calculate average satisfaction from daily stats with data
    const statsWithData = this.metrics.dailyStats.filter(d => d.calls > 0 && d.satisfaction > 0);
    this.metrics.agentStats.satisfactionScore = statsWithData.length > 0
      ? statsWithData.reduce((sum, day) => sum + day.satisfaction, 0) / statsWithData.length
      : 0;
  }

  /**
   * Start tracking a new call
   */
  async startCall(contactData) {
    this.metrics.calls.active++;
    this.metrics.currentCallStart = Date.now();
    this.metrics.currentCallDuration = 0;
    
    // Store contact ID for duration calculation later
    this.currentContactId = contactData?.contactId;
    this.contactStartTime = Date.now();
    
    console.log('📊 MetricsTracker: Call started', contactData);
    console.log('📊 Contact ID:', contactData?.contactId);
    console.log('📊 Current metrics state:', {
      active: this.metrics.calls.active,
      totalToday: this.metrics.calls.totalToday,
      completed: this.metrics.calls.completed
    });
    
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * End the current call
   */
  async endCall(contactData, status = 'Completed') {
    console.log('📊 MetricsTracker: endCall called', { contactData, status });
    
    if (this.metrics.calls.active > 0) {
      this.metrics.calls.active--;
    }

    // Calculate duration - use currentCallDuration (which is updated every second)
    // or calculate from start time if available
    let duration = this.metrics.currentCallDuration || 0;
    
    if (duration === 0 && this.contactStartTime) {
      // If duration tracking didn't work, calculate from timestamps
      duration = Math.floor((Date.now() - this.contactStartTime) / 1000);
      console.log('📊 Calculated duration from timestamps:', duration, 'seconds');
    }
    
    console.log('📊 Call duration:', duration, 'seconds');
    
    // Add to call history
    const call = {
      id: contactData?.contactId || `call_${Date.now()}`,
      type: contactData?.type || 'Inbound',
      duration,
      timestamp: new Date().toISOString(),
      status,
      customerPhone: contactData?.customerNumber || contactData?.phoneNumber || 'Unknown',
      queue: contactData?.queue?.name || contactData?.queueName || 'General',
    };

    console.log('📊 Adding call to history:', call);
    this.metrics.callHistory.unshift(call);
    
    // Keep only last 50 calls
    if (this.metrics.callHistory.length > 50) {
      this.metrics.callHistory = this.metrics.callHistory.slice(0, 50);
    }

    // Update stats
    if (status === 'Completed') {
      this.metrics.calls.completed++;
      this.metrics.calls.totalToday++;
      this.metrics.calls.totalWeek++;
      
      this.metrics.agentStats.totalHandleTime += duration;
      this.metrics.agentStats.callsHandled++;
      this.metrics.agentStats.averageHandleTime = 
        this.metrics.agentStats.callsHandled > 0
          ? Math.floor(this.metrics.agentStats.totalHandleTime / this.metrics.agentStats.callsHandled)
          : 0;
      
      console.log('📊 Updated stats:', {
        completed: this.metrics.calls.completed,
        totalToday: this.metrics.calls.totalToday,
        avgHandleTime: this.metrics.agentStats.averageHandleTime
      });
    } else if (status === 'Missed') {
      this.metrics.calls.missed++;
      console.log('📊 Missed calls:', this.metrics.calls.missed);
    }

    // Update hourly data
    const hour = new Date().getHours();
    const hourData = this.metrics.hourlyData.find(h => h.hour === `${hour.toString().padStart(2, '0')}:00`);
    if (hourData) {
      hourData.calls++;
      console.log('📊 Updated hourly data for', hourData.hour, ':', hourData.calls, 'calls');
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    let todayStats = this.metrics.dailyStats.find(d => d.date === today);
    
    if (!todayStats) {
      todayStats = {
        date: today,
        calls: 0,
        avgHandleTime: 0,
        satisfaction: 0,
        completed: 0,
        missed: 0,
      };
      this.metrics.dailyStats.push(todayStats);
      console.log('📊 Created new daily stats for today');
    }
    
    todayStats.calls++;
    if (status === 'Completed') {
      todayStats.completed++;
      todayStats.avgHandleTime = Math.floor(
        (todayStats.avgHandleTime * (todayStats.completed - 1) + duration) / todayStats.completed
      );
      // Set default satisfaction if not set
      if (todayStats.satisfaction === 0) {
        todayStats.satisfaction = 85;
      }
    } else if (status === 'Missed') {
      todayStats.missed++;
    }

    console.log('📊 Daily stats updated:', todayStats);

    this.metrics.currentCallStart = null;
    this.metrics.currentCallDuration = 0;
    this.contactStartTime = null;
    this.currentContactId = null;

    console.log('📊 MetricsTracker: Call ended successfully');
    console.log('📊 Total calls in history:', this.metrics.callHistory.length);
    console.log('📊 Final metrics:', {
      totalToday: this.metrics.calls.totalToday,
      completed: this.metrics.calls.completed,
      avgHandleTime: this.metrics.agentStats.averageHandleTime
    });
    
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Update agent satisfaction score
   */
  updateSatisfactionScore(score) {
    // Rolling average
    this.metrics.agentStats.satisfactionScore = 
      (this.metrics.agentStats.satisfactionScore * 0.9) + (score * 0.1);
    
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Subscribe to metrics updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of metric changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getMetrics());
      } catch (error) {
        console.error('Error in metrics listener:', error);
      }
    });
  }

  /**
   * Save metrics to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        callHistory: this.metrics.callHistory.slice(0, 50),
        dailyStats: this.metrics.dailyStats.slice(-30), // Keep last 30 days
        hourlyData: this.metrics.hourlyData, // Save hourly data
        agentStats: this.metrics.agentStats,
        calls: {
          ...this.metrics.calls,
          active: 0, // Don't persist active calls
        },
      };
      localStorage.setItem('amazonConnectMetrics', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('amazonConnectMetrics');
      if (saved) {
        const data = JSON.parse(saved);
        this.metrics.callHistory = data.callHistory || [];
        this.metrics.dailyStats = data.dailyStats || [];
        this.metrics.hourlyData = data.hourlyData || this.metrics.hourlyData; // Load hourly data
        this.metrics.agentStats = data.agentStats || this.metrics.agentStats;
        this.metrics.calls = { ...this.metrics.calls, ...data.calls };
        
        console.log('📊 Loaded metrics from storage:', {
          callHistoryCount: this.metrics.callHistory.length,
          dailyStatsCount: this.metrics.dailyStats.length,
          hourlyDataLength: this.metrics.hourlyData?.length || 0,
          totalToday: this.metrics.calls.totalToday,
          completed: this.metrics.calls.completed
        });
        
        // Recalculate totals from loaded data
        this.recalculateTotals();
        
        console.log('📊 After recalculation:', {
          totalToday: this.metrics.calls.totalToday,
          totalWeek: this.metrics.calls.totalWeek,
          completed: this.metrics.calls.completed,
          avgHandleTime: this.metrics.agentStats.averageHandleTime
        });
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      calls: {
        active: 0,
        totalToday: 0,
        totalWeek: 0,
        completed: 0,
        missed: 0,
        abandoned: 0,
      },
      callHistory: [],
      dailyStats: [],
      weeklyStats: [],
      currentCallStart: null,
      currentCallDuration: 0,
      agentStats: {
        totalHandleTime: 0,
        averageHandleTime: 0,
        satisfactionScore: 0,
        callsHandled: 0,
        acwTime: 0,
        idleTime: 0,
      },
      hourlyData: Array(24).fill(0).map((_, hour) => ({ 
        hour: `${hour.toString().padStart(2, '0')}:00`, 
        calls: 0 
      })),
    };
    
    localStorage.removeItem('amazonConnectMetrics');
    this.ensureTodayStats();
    this.notifyListeners();
    
    console.log('📊 MetricsTracker: All data reset. Starting fresh with real data only.');
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }
    this.listeners = [];
  }
}

// Export singleton instance
let metricsTrackerInstance = null;

export function getMetricsTracker() {
  if (!metricsTrackerInstance) {
    metricsTrackerInstance = new MetricsTracker();
  }
  return metricsTrackerInstance;
}

export default MetricsTracker;
