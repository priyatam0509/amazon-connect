import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, UserCheck, Mail, Calendar, MapPin,
  Filter, Download, Grid, List as ListIcon, AlertCircle, CheckCircle,
  Network, Shield, ListOrdered, TrendingUp, Activity, Copy, Check
} from 'lucide-react';
import AgentService from '../services/AgentService';

/**
 * AgentsListPanel - Displays all agents in the Amazon Connect instance
 * Useful for supervisors and team management
 */
function AgentsListPanel({ sdkManager }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'username', 'lastModified'
  
  // State for profiles and queues
  const [routingProfiles, setRoutingProfiles] = useState([]);
  const [securityProfiles, setSecurityProfiles] = useState([]);
  const [queues, setQueues] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadAgents();
    loadProfiles();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const agentsData = await AgentService.listAllAgents();
      setAgents(agentsData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    setProfilesLoading(true);
    setProfilesError(null);
    try {
      const [routing, security, queuesList] = await Promise.all([
        AgentService.getAllRoutingProfiles(),
        AgentService.getAllSecurityProfiles(),
        AgentService.getAllQueues()
      ]);
      setRoutingProfiles(routing);
      setSecurityProfiles(security);
      setQueues(queuesList);
    } catch (error) {
      setProfilesError(error.message);
      console.error('Failed to load profiles:', error);
    } finally {
      setProfilesLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAgents();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await AgentService.searchAgents(searchQuery);
      setAgents(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username) => {
    if (!username) return '??';
    const parts = username.split(/[._@]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAgentsList = () => {
    const csv = [
      ['ID', 'Username', 'Last Modified', 'Region', 'ARN'].join(','),
      ...agents.map(agent => [
        agent.Id,
        agent.Username,
        agent.LastModifiedTime,
        agent.LastModifiedRegion,
        agent.Arn
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agents-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sortedAgents = [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.Username.localeCompare(b.Username);
      case 'username':
        return a.Username.localeCompare(b.Username);
      case 'lastModified':
        return new Date(b.LastModifiedTime) - new Date(a.LastModifiedTime);
      default:
        return 0;
    }
  });

  if (!sdkManager?.isInitialized && loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Team Agents</h3>
        </div>
        <p className="text-gray-500">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Team Management Hub</h1>
                <p className="text-white/90 text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Complete overview of your Amazon Connect workspace
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[120px] border border-white/30 shadow-lg">
                <div className="text-3xl font-bold text-white mb-1">{agents.length}</div>
                <div className="text-sm text-white/90 font-medium">Total Agents</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[120px] border border-white/30 shadow-lg">
                <div className="text-3xl font-bold text-white mb-1">{routingProfiles.length}</div>
                <div className="text-sm text-white/90 font-medium">Profiles</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[120px] border border-white/30 shadow-lg">
                <div className="text-3xl font-bold text-white mb-1">{queues.length}</div>
                <div className="text-sm text-white/90 font-medium">Queues</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Controls Panel */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Enhanced Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search agents by username..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4" />
            Search
          </button>

          <button
            onClick={loadAgents}
            disabled={loading}
            className="px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Modern Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-medium cursor-pointer hover:bg-white transition-all"
          >
            <option value="name">📋 Sort by Name</option>
            <option value="username">👤 Sort by Username</option>
            <option value="lastModified">🕒 Sort by Last Modified</option>
          </select>

          {/* Enhanced View Toggle */}
          <div className="flex gap-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1.5 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-md text-blue-600 scale-105' 
                  : 'hover:bg-white/50 text-gray-600'
              }`}
              title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white shadow-md text-blue-600 scale-105' 
                  : 'hover:bg-white/50 text-gray-600'
              }`}
              title="List View"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportAgentsList}
            disabled={agents.length === 0}
            className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Enhanced Stats Bar */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              <strong className="text-blue-700 text-base">{agents.length}</strong> agents found
            </span>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm animate-fadeIn">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                Filtered: <strong className="text-purple-700">"{searchQuery}"</strong>
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  loadAgents();
                }}
                className="ml-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full w-6 h-6 flex items-center justify-center transition-all font-bold"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-900">Failed to load agents</div>
            <div className="text-sm text-red-700">{error}</div>
          </div>
          <button
            onClick={loadAgents}
            className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Agents Grid/List */}
      {loading && agents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No agents found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAgents.map((agent) => (
            <div
              key={agent.Id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative flex flex-col items-center text-center">
                {/* Enhanced Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ring-4 ring-blue-100">
                  {getInitials(agent.Username)}
                </div>

                {/* Username */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {agent.Username}
                </h3>

                {/* Agent ID Badge */}
                <div className="text-xs text-gray-500 mb-4 font-mono bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                  {agent.Id.substring(0, 8)}...
                </div>

                {/* Details with Icons */}
                <div className="w-full space-y-2.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">{formatDate(agent.LastModifiedTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium">{agent.LastModifiedRegion}</span>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="w-full flex gap-2">
                  <button
                    onClick={() => handleCopy(agent.Id, `id-${agent.Id}`)}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                    title="Copy Agent ID"
                  >
                    {copiedId === `id-${agent.Id}` ? (
                      <><Check className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy ID</>
                    )}
                  </button>
                  <button
                    onClick={() => handleCopy(agent.Arn, `arn-${agent.Id}`)}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                    title="Copy ARN"
                  >
                    {copiedId === `arn-${agent.Id}` ? (
                      <><Check className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> ARN</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAgents.map((agent) => (
                <tr key={agent.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(agent.Username)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{agent.Username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{agent.Id.substring(0, 13)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(agent.LastModifiedTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {agent.LastModifiedRegion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(agent.Id)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        title="Copy ID"
                      >
                        Copy ID
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(agent.Arn)}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-medium"
                        title="Copy ARN"
                      >
                        Copy ARN
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Routing Profiles Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <Network className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Routing Profiles</h3>
                <p className="text-white/90 text-sm font-medium">{routingProfiles.length} profiles configured</p>
              </div>
            </div>
            <button
              onClick={loadProfiles}
              disabled={profilesLoading}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 backdrop-blur-md border border-white/30 shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${profilesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        <div className="p-6">

        {profilesError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-red-900">Failed to load profiles</div>
              <div className="text-sm text-red-700">{profilesError}</div>
            </div>
            <button
              onClick={loadProfiles}
              className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {profilesLoading && routingProfiles.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Loading routing profiles...</p>
          </div>
        ) : routingProfiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No routing profiles found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {routingProfiles.map((profile) => (
              <div
                key={profile.Id}
                className="group relative bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-700 transition-colors">{profile.Name}</h4>
                      <p className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-1 rounded truncate">{profile.Id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-700 mt-4 pt-4 border-t-2 border-blue-200">
                    <span className="flex items-center gap-1 font-medium">📅 {formatDate(profile.LastModifiedTime)}</span>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md">
                      {profile.LastModifiedRegion}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Security Profiles Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Security Profiles</h3>
                <p className="text-white/90 text-sm font-medium">{securityProfiles.length} security configurations</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">

        {profilesLoading && securityProfiles.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Loading security profiles...</p>
          </div>
        ) : securityProfiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No security profiles found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {securityProfiles.map((profile) => (
              <div
                key={profile.Id}
                className="group relative bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 rounded-xl p-5 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base mb-2 group-hover:text-purple-700 transition-colors">{profile.Name}</h4>
                      <p className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-1 rounded truncate">{profile.Id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-700 mt-4 pt-4 border-t-2 border-purple-200">
                    <span className="flex items-center gap-1 font-medium">📅 {formatDate(profile.LastModifiedTime)}</span>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-md">
                      {profile.LastModifiedRegion}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Queues Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <ListOrdered className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Contact Queues</h3>
                <p className="text-white/90 text-sm font-medium">{queues.length} active queues</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">

        {profilesLoading && queues.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Loading queues...</p>
          </div>
        ) : queues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No queues found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {queues.map((queue) => (
              <div
                key={queue.Id}
                className="group relative bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 rounded-xl p-5 border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base mb-2 group-hover:text-green-700 transition-colors line-clamp-2">{queue.Name}</h4>
                      <p className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-1 rounded truncate">{queue.Id}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-bold shadow-md inline-block">
                      {queue.QueueType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-700 pt-3 border-t-2 border-green-200">
                    <span className="flex items-center gap-1 font-medium">📅 {formatDate(queue.LastModifiedTime)}</span>
                    <span className="text-xs font-semibold text-green-700">
                      {queue.LastModifiedRegion}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default AgentsListPanel;
