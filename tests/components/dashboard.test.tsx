import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import ArticleManagement from '../../src/components/dashboard/ArticleManagement';
import AnalyticsDashboard from '../../src/components/analytics/AnalyticsDashboard';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: '/dashboard',
    query: {},
  }))
}));

// Mock API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock chart libraries
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />
}));

describe('ArticleManagement', () => {
  const mockArticles = [
    {
      id: 'article_1',
      title: 'Test Article 1',
      status: 'published',
      createdAt: '2023-01-01T00:00:00Z',
      views: 150,
      likes: 25
    },
    {
      id: 'article_2',
      title: 'Test Article 2',
      status: 'draft',
      createdAt: '2023-01-02T00:00:00Z',
      views: 0,
      likes: 0
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        pagination: { total: 2, page: 1, pages: 1 }
      })
    });
  });

  it('should render article management interface', async () => {
    render(<ArticleManagement />);

    expect(screen.getByText('Article Management')).toBeInTheDocument();
    expect(screen.getByText('Create New Article')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });
  });

  it('should display article statistics', async () => {
    render(<ArticleManagement />);

    await waitFor(() => {
      expect(screen.getByText('150 views')).toBeInTheDocument();
      expect(screen.getByText('25 likes')).toBeInTheDocument();
    });
  });

  it('should filter articles by status', async () => {
    const user = userEvent.setup();
    render(<ArticleManagement />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    });

    const draftFilter = screen.getByRole('button', { name: /draft/i });
    await user.click(draftFilter);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=draft'),
        expect.any(Object)
      );
    });
  });

  it('should handle article search', async () => {
    const user = userEvent.setup();
    render(<ArticleManagement />);

    const searchInput = screen.getByPlaceholderText('Search articles...');
    await user.type(searchInput, 'Test Article');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Test%20Article'),
        expect.any(Object)
      );
    });
  });

  it('should navigate to article editor on create button click', async () => {
    const user = userEvent.setup();
    const { useRouter } = require('next/router');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush, pathname: '/dashboard', query: {} });

    render(<ArticleManagement />);

    const createButton = screen.getByText('Create New Article');
    await user.click(createButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/new');
  });

  it('should handle article deletion', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ articles: mockArticles, pagination: { total: 2, page: 1, pages: 1 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    render(<ArticleManagement />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles/article_1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('should handle bulk actions', async () => {
    const user = userEvent.setup();
    render(<ArticleManagement />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
    });

    // Select articles
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First article checkbox
    await user.click(checkboxes[2]); // Second article checkbox

    // Apply bulk action
    const bulkActionSelect = screen.getByRole('combobox', { name: /bulk actions/i });
    await user.selectOptions(bulkActionSelect, 'publish');

    const applyButton = screen.getByText('Apply');
    await user.click(applyButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles/bulk'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            action: 'publish',
            articleIds: ['article_1', 'article_2']
          })
        })
      );
    });
  });

  it('should handle pagination', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        pagination: { total: 20, page: 1, pages: 2 }
      })
    });

    render(<ArticleManagement />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });
  });

  it('should show loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ArticleManagement />);

    expect(screen.getByText('Loading articles...')).toBeInTheDocument();
  });

  it('should handle API errors', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));

    render(<ArticleManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load articles')).toBeInTheDocument();
    });
  });
});

describe('AnalyticsDashboard', () => {
  const mockAnalytics = {
    overview: {
      totalViews: 1500,
      totalLikes: 250,
      totalComments: 80,
      totalShares: 45
    },
    viewsOverTime: [
      { date: '2023-01-01', views: 100 },
      { date: '2023-01-02', views: 150 },
      { date: '2023-01-03', views: 200 }
    ],
    topArticles: [
      { title: 'Popular Article 1', views: 500 },
      { title: 'Popular Article 2', views: 300 }
    ],
    trafficSources: [
      { source: 'Direct', visitors: 800 },
      { source: 'Google', visitors: 600 },
      { source: 'Social', visitors: 100 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAnalytics
    });
  });

  it('should render analytics dashboard', async () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('1,500')).toBeInTheDocument(); // Total views
      expect(screen.getByText('250')).toBeInTheDocument(); // Total likes
    });
  });

  it('should display overview statistics', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Views')).toBeInTheDocument();
      expect(screen.getByText('Total Likes')).toBeInTheDocument();
      expect(screen.getByText('Total Comments')).toBeInTheDocument();
      expect(screen.getByText('Total Shares')).toBeInTheDocument();
    });
  });

  it('should render charts for analytics data', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('should handle date range selection', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);

    const dateRangeSelect = screen.getByRole('combobox', { name: /date range/i });
    await user.selectOptions(dateRangeSelect, '30-days');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('range=30-days'),
        expect.any(Object)
      );
    });
  });

  it('should display top performing articles', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Top Articles')).toBeInTheDocument();
      expect(screen.getByText('Popular Article 1')).toBeInTheDocument();
      expect(screen.getByText('500 views')).toBeInTheDocument();
    });
  });

  it('should show traffic sources breakdown', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
      expect(screen.getByText('Direct')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Social')).toBeInTheDocument();
    });
  });

  it('should export analytics data', async () => {
    const user = userEvent.setup();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1,500')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export Data');
    await user.click(exportButton);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should refresh analytics data', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle real-time updates', async () => {
    jest.useFakeTimers();
    render(<AnalyticsDashboard realTimeUpdates={true} />);

    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Fast-forward time to trigger real-time update
    jest.advanceTimersByTime(30000); // 30 seconds

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });

  it('should show loading state for analytics', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<AnalyticsDashboard />);

    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('should handle analytics API errors', async () => {
    mockFetch.mockRejectedValue(new Error('Analytics API Error'));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument();
    });
  });

  it('should filter analytics by article', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);

    const articleFilter = screen.getByRole('combobox', { name: /filter by article/i });
    await user.selectOptions(articleFilter, 'article_1');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('articleId=article_1'),
        expect.any(Object)
      );
    });
  });

  it('should compare metrics with previous period', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);

    const compareToggle = screen.getByRole('checkbox', { name: /compare with previous period/i });
    await user.click(compareToggle);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('compare=true'),
        expect.any(Object)
      );
    });
  });

  it('should display metric trends', async () => {
    const analyticsWithTrends = {
      ...mockAnalytics,
      trends: {
        viewsGrowth: 15.5,
        likesGrowth: -2.3,
        commentsGrowth: 8.7
      }
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => analyticsWithTrends
    });

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('+15.5%')).toBeInTheDocument();
      expect(screen.getByText('-2.3%')).toBeInTheDocument();
      expect(screen.getByText('+8.7%')).toBeInTheDocument();
    });
  });
});