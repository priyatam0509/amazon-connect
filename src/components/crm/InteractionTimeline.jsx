import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Video, Clock, Smile, Frown, Meh, Tag, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * InteractionTimeline - Comprehensive interaction history across all channels
 */
function InteractionTimeline({ interactions }) {
  const [expandedInteraction, setExpandedInteraction] = useState(null);
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');

  const getChannelIcon = (channel) => {
    const icons = {
      phone: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-500' },
      email: { icon: Mail, color: 'text-purple-600', bg: 'bg-purple-500' },
      chat: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-500' },
      video: { icon: Video, color: 'text-red-600', bg: 'bg-red-500' },
    };
    const config = icons[channel] || icons.phone;
    const Icon = config.icon;
    return { Icon, ...config };
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-600" />;
      case 'negative': return <Frown className="w-4 h-4 text-red-600" />;
      default: return <Meh className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  // Filter interactions
  const filteredInteractions = interactions.filter(interaction => {
    const channelMatch = filterChannel === 'all' || interaction.channel === filterChannel;
    const sentimentMatch = filterSentiment === 'all' || interaction.sentiment === filterSentiment;
    return channelMatch && sentimentMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Interaction Timeline</h3>
          <p className="text-sm text-gray-600">{filteredInteractions.length} interactions</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Channels</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="chat">Chat</option>
            <option value="video">Video</option>
          </select>
          
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200"></div>
        
        <div className="space-y-6">
          {filteredInteractions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg ml-14">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No interactions found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredInteractions.map((interaction, index) => {
              const { Icon, color, bg } = getChannelIcon(interaction.channel);
              const isExpanded = expandedInteraction === interaction.id;
              
              return (
                <div key={interaction.id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 w-4 h-4 rounded-full border-2 border-white shadow-md ${bg}`}></div>
                  
                  {/* Interaction Card */}
                  <div 
                    className="bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setExpandedInteraction(isExpanded ? null : interaction.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${color}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 capitalize">{interaction.channel} Contact</span>
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {interaction.date}
                              </span>
                              {interaction.duration && (
                                <>
                                  <span>•</span>
                                  <span>{interaction.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getSentimentColor(interaction.sentiment)}`}>
                            {getSentimentIcon(interaction.sentiment)}
                            {interaction.sentiment}
                          </span>
                        </div>
                      </div>
                      
                      {/* Summary - Always visible */}
                      <p className="text-sm text-gray-700 mb-2">{interaction.summary}</p>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-fadeIn">
                          <div>
                            <span className="text-sm font-semibold text-gray-900">Agent: </span>
                            <span className="text-sm text-gray-700">{interaction.agent}</span>
                          </div>
                          
                          {interaction.outcome && (
                            <div>
                              <span className="text-sm font-semibold text-gray-900">Outcome: </span>
                              <span className="text-sm text-gray-700">{interaction.outcome}</span>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {interaction.tags.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Load More Button */}
      {filteredInteractions.length > 0 && (
        <div className="text-center pt-4">
          <button className="px-6 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors">
            Load More Interactions
          </button>
        </div>
      )}
    </div>
  );
}

export default InteractionTimeline;
