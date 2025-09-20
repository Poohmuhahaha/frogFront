'use client';

import React, { useState, useMemo } from 'react';

export interface AnalyticsData {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalRevenue: number;
    subscriptions: number;
    emailSubscribers: number;
    affiliateClicks: number;
  };
  traffic: {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
  }[];
  revenue: {
    date: string;
    adRevenue: number;
    subscriptionRevenue: number;
    affiliateRevenue: number;
  }[];
  topArticles: {
    id: string;
    title: string;
    views: number;
    revenue: number;
    engagement: number;
  }[];
  emailMetrics: {
    date: string;
    subscribers: number;
    openRate: number;
    clickRate: number;
  }[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  isLoading?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  dateRange,
  onDateRangeChange,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'revenue' | 'content' | 'email'>('overview');

  // Simple chart component (in real implementation, you'd use a library like Chart.js or Recharts)
  const SimpleLineChart: React.FC<{ data: Record<string, unknown>[]; dataKey: string; title: string; color?: string }> = ({
    data,
    dataKey,
    title,
    color = '#3B82F6'
  }) => {
    const max = Math.max(...data.map(d => d[dataKey] || 0));
    const min = Math.min(...data.map(d => d[dataKey] || 0));
    const range = max - min || 1;

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="relative h-32">
          <svg width="100%" height="100%" viewBox="0 0 300 100">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * 300;
                const y = 100 - (((item[dataKey] as number) - min) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 100 - (((item[dataKey] as number) - min) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                />
              );
            })}
          </svg>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Current: {(data[data.length - 1]?.[dataKey] as number)?.toLocaleString() || 0}
        </div>
      </div>
    );
  };

  const MetricCard: React.FC<{ title: string; value: number; change?: number; format?: 'number' | 'currency' | 'percentage' }> = ({
    title,
    value,
    change,
    format = 'number'
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `$${val.toLocaleString()}`;
        case 'percentage':
          return `${val.toFixed(1)}%`;
        default:
          return val.toLocaleString();
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <div className="text-2xl font-bold text-gray-800">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  const topPerformingArticles = useMemo(() => {
    return [...data.topArticles].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [data.topArticles]);

  // Total revenue calculation (currently unused but may be needed for future features)
  // const totalRevenue = useMemo(() => {
  //   return data.revenue.reduce((sum, item) => sum + item.adRevenue + item.subscriptionRevenue + item.affiliateRevenue, 0);
  // }, [data.revenue]);

  const averageEngagement = useMemo(() => {
    const avgBounceRate = data.traffic.reduce((sum, item) => sum + item.bounceRate, 0) / data.traffic.length;
    return 100 - avgBounceRate; // Engagement as inverse of bounce rate
  }, [data.traffic]);

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'traffic', label: 'Traffic' },
              { id: 'revenue', label: 'Revenue' },
              { id: 'content', label: 'Content' },
              { id: 'email', label: 'Email' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading analytics data...</div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricCard title="Total Page Views" value={data.overview.totalPageViews} />
                  <MetricCard title="Unique Visitors" value={data.overview.uniqueVisitors} />
                  <MetricCard title="Total Revenue" value={data.overview.totalRevenue} format="currency" />
                  <MetricCard title="Active Subscriptions" value={data.overview.subscriptions} />
                  <MetricCard title="Email Subscribers" value={data.overview.emailSubscribers} />
                  <MetricCard title="Affiliate Clicks" value={data.overview.affiliateClicks} />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SimpleLineChart
                    data={data.traffic}
                    dataKey="pageViews"
                    title="Page Views Trend"
                    color="#3B82F6"
                  />
                  <SimpleLineChart
                    data={data.revenue}
                    dataKey="adRevenue"
                    title="Ad Revenue Trend"
                    color="#10B981"
                  />
                </div>
              </div>
            )}

            {/* Traffic Tab */}
            {activeTab === 'traffic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <SimpleLineChart
                    data={data.traffic}
                    dataKey="pageViews"
                    title="Page Views"
                    color="#3B82F6"
                  />
                  <SimpleLineChart
                    data={data.traffic}
                    dataKey="uniqueVisitors"
                    title="Unique Visitors"
                    color="#8B5CF6"
                  />
                  <SimpleLineChart
                    data={data.traffic}
                    dataKey="bounceRate"
                    title="Bounce Rate (%)"
                    color="#EF4444"
                  />
                </div>

                {/* Traffic Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Daily Traffic</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Views</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Visitors</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bounce Rate</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.traffic.slice(-7).map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.pageViews.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.uniqueVisitors.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.bounceRate.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Ad Revenue"
                    value={data.revenue.reduce((sum, item) => sum + item.adRevenue, 0)}
                    format="currency"
                  />
                  <MetricCard
                    title="Subscription Revenue"
                    value={data.revenue.reduce((sum, item) => sum + item.subscriptionRevenue, 0)}
                    format="currency"
                  />
                  <MetricCard
                    title="Affiliate Revenue"
                    value={data.revenue.reduce((sum, item) => sum + item.affiliateRevenue, 0)}
                    format="currency"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <SimpleLineChart
                    data={data.revenue}
                    dataKey="adRevenue"
                    title="Ad Revenue"
                    color="#10B981"
                  />
                  <SimpleLineChart
                    data={data.revenue}
                    dataKey="subscriptionRevenue"
                    title="Subscription Revenue"
                    color="#3B82F6"
                  />
                  <SimpleLineChart
                    data={data.revenue}
                    dataKey="affiliateRevenue"
                    title="Affiliate Revenue"
                    color="#F59E0B"
                  />
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard title="Total Articles" value={data.topArticles.length} />
                  <MetricCard title="Average Views" value={data.topArticles.reduce((sum, a) => sum + a.views, 0) / data.topArticles.length} />
                  <MetricCard title="Engagement Rate" value={averageEngagement} format="percentage" />
                </div>

                {/* Top Articles */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Top Performing Articles</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {topPerformingArticles.map((article, index) => (
                      <div key={article.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <h4 className="font-medium text-gray-900">{article.title}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span>{article.views.toLocaleString()} views</span>
                          <span>${article.revenue.toLocaleString()} revenue</span>
                          <span>{article.engagement.toFixed(1)}% engagement</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard title="Total Subscribers" value={data.overview.emailSubscribers} />
                  <MetricCard
                    title="Average Open Rate"
                    value={data.emailMetrics.reduce((sum, item) => sum + item.openRate, 0) / data.emailMetrics.length}
                    format="percentage"
                  />
                  <MetricCard
                    title="Average Click Rate"
                    value={data.emailMetrics.reduce((sum, item) => sum + item.clickRate, 0) / data.emailMetrics.length}
                    format="percentage"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <SimpleLineChart
                    data={data.emailMetrics}
                    dataKey="subscribers"
                    title="Subscriber Growth"
                    color="#3B82F6"
                  />
                  <SimpleLineChart
                    data={data.emailMetrics}
                    dataKey="openRate"
                    title="Open Rate (%)"
                    color="#10B981"
                  />
                  <SimpleLineChart
                    data={data.emailMetrics}
                    dataKey="clickRate"
                    title="Click Rate (%)"
                    color="#F59E0B"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;