'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsDashboard, AnalyticsData } from '@/components/analytics';

// Mock data for analytics - in real implementation, this would come from API
const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalPageViews: 45670,
    uniqueVisitors: 12890,
    totalRevenue: 3480,
    subscriptions: 156,
    emailSubscribers: 2340,
    affiliateClicks: 892
  },
  traffic: [
    { date: '2024-01-10', pageViews: 1250, uniqueVisitors: 890, bounceRate: 45.2 },
    { date: '2024-01-11', pageViews: 1380, uniqueVisitors: 920, bounceRate: 42.8 },
    { date: '2024-01-12', pageViews: 1520, uniqueVisitors: 1080, bounceRate: 38.5 },
    { date: '2024-01-13', pageViews: 1420, uniqueVisitors: 950, bounceRate: 41.2 },
    { date: '2024-01-14', pageViews: 1680, uniqueVisitors: 1150, bounceRate: 35.8 },
    { date: '2024-01-15', pageViews: 1850, uniqueVisitors: 1230, bounceRate: 33.1 },
    { date: '2024-01-16', pageViews: 1920, uniqueVisitors: 1340, bounceRate: 31.9 }
  ],
  revenue: [
    { date: '2024-01-10', adRevenue: 45, subscriptionRevenue: 280, affiliateRevenue: 32 },
    { date: '2024-01-11', adRevenue: 52, subscriptionRevenue: 310, affiliateRevenue: 28 },
    { date: '2024-01-12', adRevenue: 68, subscriptionRevenue: 340, affiliateRevenue: 45 },
    { date: '2024-01-13', adRevenue: 58, subscriptionRevenue: 295, affiliateRevenue: 38 },
    { date: '2024-01-14', adRevenue: 72, subscriptionRevenue: 380, affiliateRevenue: 52 },
    { date: '2024-01-15', adRevenue: 89, subscriptionRevenue: 420, affiliateRevenue: 65 },
    { date: '2024-01-16', adRevenue: 95, subscriptionRevenue: 450, affiliateRevenue: 71 }
  ],
  topArticles: [
    {
      id: '1',
      title: 'Advanced Machine Learning Techniques for Academic Research',
      views: 5240,
      revenue: 340,
      engagement: 78.5
    },
    {
      id: '2',
      title: 'The Future of Academic Publishing: Blockchain and Decentralization',
      views: 4180,
      revenue: 520,
      engagement: 82.1
    },
    {
      id: '3',
      title: 'Data Visualization Best Practices for Scientific Papers',
      views: 3920,
      revenue: 280,
      engagement: 74.3
    },
    {
      id: '4',
      title: 'Research Collaboration Tools in the Digital Age',
      views: 3560,
      revenue: 190,
      engagement: 71.8
    },
    {
      id: '5',
      title: 'Open Science Initiatives and Their Impact',
      views: 3240,
      revenue: 160,
      engagement: 68.9
    }
  ],
  emailMetrics: [
    { date: '2024-01-10', subscribers: 2180, openRate: 24.5, clickRate: 3.8 },
    { date: '2024-01-11', subscribers: 2195, openRate: 26.2, clickRate: 4.1 },
    { date: '2024-01-12', subscribers: 2210, openRate: 25.8, clickRate: 3.9 },
    { date: '2024-01-13', subscribers: 2225, openRate: 27.3, clickRate: 4.5 },
    { date: '2024-01-14', subscribers: 2250, openRate: 28.1, clickRate: 4.8 },
    { date: '2024-01-15', subscribers: 2280, openRate: 29.4, clickRate: 5.2 },
    { date: '2024-01-16', subscribers: 2340, openRate: 30.2, clickRate: 5.6 }
  ]
};

interface TimeRange {
  start: string;
  end: string;
  label: string;
}

const timeRanges: TimeRange[] = [
  {
    start: '2024-01-09',
    end: '2024-01-16',
    label: 'Last 7 days'
  },
  {
    start: '2024-01-01',
    end: '2024-01-16',
    label: 'Last 30 days'
  },
  {
    start: '2023-12-01',
    end: '2024-01-16',
    label: 'Last 90 days'
  }
];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRanges[0]);
  const [dateRange, setDateRange] = useState({
    start: '2024-01-10',
    end: '2024-01-16'
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDateRangeChange = (newRange: { start: string; end: string }) => {
    setDateRange(newRange);
    // In real implementation, this would trigger a new API call
    console.log('Date range changed:', newRange);
  };

  const handleTimeRangeSelect = (range: TimeRange) => {
    setSelectedTimeRange(range);
    setDateRange({
      start: range.start,
      end: range.end
    });
    // In real implementation, this would trigger a new API call
    console.log('Time range selected:', range);
  };

  const exportData = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    console.log(`Exporting analytics data as ${format}`);
    // In real implementation, this would generate and download the file
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your content performance and audience growth</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Time Range:</label>
                <select
                  value={selectedTimeRange.label}
                  onChange={(e) => {
                    const range = timeRanges.find(r => r.label === e.target.value);
                    if (range) handleTimeRangeSelect(range);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Options */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportData('csv')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportData('pdf')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading analytics data...</div>
          </div>
        ) : analyticsData ? (
          <AnalyticsDashboard
            data={analyticsData}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            isLoading={false}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">No analytics data available</div>
          </div>
        )}
      </div>

      {/* Insights Section */}
      {analyticsData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Key Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Top Performing Content */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🏆 Top Performer</h3>
                <p className="text-sm text-blue-700">
                  &quot;{analyticsData.topArticles[0].title}&quot; generated {analyticsData.topArticles[0].views.toLocaleString()} views
                  with {analyticsData.topArticles[0].engagement}% engagement rate.
                </p>
              </div>

              {/* Growth Trend */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">📈 Growth Trend</h3>
                <p className="text-sm text-green-700">
                  Your email subscribers grew by {((analyticsData.emailMetrics[analyticsData.emailMetrics.length - 1].subscribers - analyticsData.emailMetrics[0].subscribers) / analyticsData.emailMetrics[0].subscribers * 100).toFixed(1)}%
                  this week with improving engagement rates.
                </p>
              </div>

              {/* Revenue Insight */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">💰 Revenue Insight</h3>
                <p className="text-sm text-purple-700">
                  Subscription revenue accounts for {(analyticsData.revenue.reduce((sum, day) => sum + day.subscriptionRevenue, 0) / analyticsData.revenue.reduce((sum, day) => sum + day.adRevenue + day.subscriptionRevenue + day.affiliateRevenue, 0) * 100).toFixed(0)}%
                  of your total revenue this week.
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-4">📋 Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-yellow-800">Increase Content Frequency</div>
                    <div className="text-sm text-yellow-700">
                      Your engagement rates are high. Consider publishing more frequently to capitalize on your audience engagement.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-indigo-800">Optimize Email Campaigns</div>
                    <div className="text-sm text-indigo-700">
                      Your open rates are improving. A/B test different subject lines to boost engagement further.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-emerald-800">Monetization Opportunity</div>
                    <div className="text-sm text-emerald-700">
                      Your top-performing articles could benefit from premium content tiers or affiliate partnerships.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}