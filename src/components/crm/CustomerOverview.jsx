import React from 'react';
import { User, DollarSign, TrendingUp, Heart, Tag, Plus, BarChart3, TrendingDown } from 'lucide-react';

/**
 * CustomerOverview - 360° Customer View with sentiment analysis
 */
function CustomerOverview({ customerData, sentimentScore }) {
  return (
    <div className="space-y-6">
      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Information Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Customer Information
          </h3>
          <div className="space-y-3 text-sm">
            {[
              ['Join Date', customerData.joinDate],
              ['Last Contact', customerData.lastContact],
              ['Preferred Channel', customerData.preferredChannel],
              ['Timezone', customerData.timezone],
              ['Language', customerData.language],
            ].map(([label, value], idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-gray-600">{label}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Financial Overview
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lifetime Value:</span>
              <span className="font-bold text-green-700">${customerData.lifetimeValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Purchases:</span>
              <span className="font-medium">{customerData.totalPurchases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Order Value:</span>
              <span className="font-medium">${customerData.averageOrderValue}</span>
            </div>
            <div className="pt-3 border-t border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">High-Value Customer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Score Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600" />
            Engagement Score
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{sentimentScore}%</div>
              <div className="text-sm text-gray-600">Overall Satisfaction</div>
            </div>
            <div className="space-y-2">
              {[['Response Rate', 92], ['Loyalty Score', 88]].map(([label, value], idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Tags */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Tags</h3>
        <div className="flex flex-wrap gap-2">
          {customerData.tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1">
            <Plus className="w-3 h-3" />
            Add Tag
          </button>
        </div>
      </div>

      {/* Sentiment Trend Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Sentiment Trend (Last 7 Days)
        </h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {customerData.sentiment_history.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                {item.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                {item.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                <span className="text-xs font-medium">{item.score}%</span>
              </div>
              <div 
                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all hover:from-indigo-700 hover:to-indigo-500"
                style={{ height: `${item.score}%` }}
              ></div>
              <span className="text-xs text-gray-600">{item.date.split('-')[1]}/{item.date.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerOverview;
