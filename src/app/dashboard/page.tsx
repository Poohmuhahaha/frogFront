'use client';

import React, { useState, useEffect } from 'react';
import { ArticleManagement, Article } from '@/components/dashboard';
import { RichTextEditor, EditorContent } from '@/components/editor';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalSubscribers: number;
  monthlyRevenue: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

const mockStats: DashboardStats = {
  totalArticles: 23,
  publishedArticles: 18,
  draftArticles: 5,
  totalViews: 45670,
  totalSubscribers: 1250,
  monthlyRevenue: 2340
};

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Advanced Machine Learning Techniques for Academic Research',
    slug: 'advanced-ml-techniques-academic-research',
    status: 'published',
    isPremium: false,
    publishedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    viewCount: 2150,
    tags: ['Machine Learning', 'Research', 'AI'],
    excerpt: 'Explore cutting-edge ML methods that are revolutionizing academic research across disciplines.'
  },
  {
    id: '2',
    title: 'The Future of Academic Publishing: Blockchain and Decentralization',
    slug: 'future-academic-publishing-blockchain',
    status: 'published',
    isPremium: true,
    publishedAt: '2024-01-14T14:30:00Z',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
    viewCount: 1890,
    tags: ['Blockchain', 'Publishing', 'Academic'],
    excerpt: 'How blockchain technology is transforming peer review, citation tracking, and academic credibility.'
  },
  {
    id: '3',
    title: 'Data Visualization Best Practices for Scientific Papers',
    slug: 'data-visualization-scientific-papers',
    status: 'draft',
    isPremium: false,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
    tags: ['Data Visualization', 'Research', 'Publishing'],
    excerpt: 'Learn how to create compelling, clear, and scientifically accurate visualizations.'
  },
  {
    id: '4',
    title: 'Collaborative Research in the Digital Age',
    slug: 'collaborative-research-digital-age',
    status: 'draft',
    isPremium: false,
    createdAt: '2024-01-11T16:20:00Z',
    updatedAt: '2024-01-17T08:45:00Z',
    tags: ['Collaboration', 'Digital Tools', 'Research'],
    excerpt: 'Exploring tools and methodologies for effective remote research collaboration.'
  }
];

export default function CreatorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setArticles(mockArticles);
      setIsLoading(false);
    }, 1000);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'new-article',
      title: 'Write New Article',
      description: 'Start writing your next research article',
      icon: '✍️',
      action: () => {
        setEditingArticle(null);
        setShowEditor(true);
      }
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Check your content performance',
      icon: '📊',
      action: () => {
        // Navigate to analytics page
        window.location.href = '/analytics';
      }
    },
    {
      id: 'manage-subscription',
      title: 'Subscription Plans',
      description: 'Manage your monetization settings',
      icon: '💳',
      action: () => {
        console.log('Navigate to subscription management');
      }
    },
    {
      id: 'email-campaigns',
      title: 'Email Campaigns',
      description: 'Send newsletters to your subscribers',
      icon: '📧',
      action: () => {
        console.log('Navigate to email campaigns');
      }
    }
  ];

  const handleCreateNew = () => {
    setEditingArticle(null);
    setShowEditor(true);
  };

  const handleEditArticle = (articleId: string) => {
    setEditingArticle(articleId);
    setShowEditor(true);
  };

  const handleDeleteArticle = async (articleId: string) => {
    // Mock delete operation
    setArticles(prev => prev.filter(article => article.id !== articleId));
    console.log('Deleting article:', articleId);
  };

  const handlePublishArticle = async (articleId: string) => {
    // Mock publish operation
    setArticles(prev => prev.map(article =>
      article.id === articleId
        ? { ...article, status: 'published' as const, publishedAt: new Date().toISOString() }
        : article
    ));
    console.log('Publishing article:', articleId);
  };

  const handleArchiveArticle = async (articleId: string) => {
    // Mock archive operation
    setArticles(prev => prev.map(article =>
      article.id === articleId
        ? { ...article, status: 'archived' as const }
        : article
    ));
    console.log('Archiving article:', articleId);
  };

  const handleSaveArticle = async (content: EditorContent) => {
    // Mock save operation
    console.log('Saving article:', content);
    setShowEditor(false);

    // In real implementation, this would save to the backend
    // and update the articles list
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mb-4">
          <button
            onClick={() => setShowEditor(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <RichTextEditor
          onSave={handleSaveArticle}
          // In real implementation, load existing content if editing
          initialContent={editingArticle ? undefined : {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Creator Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your content and grow your audience</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + New Article
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Articles</div>
                <div className="text-2xl font-bold text-gray-800">{stats?.totalArticles}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Published</div>
                <div className="text-2xl font-bold text-green-600">{stats?.publishedArticles}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Drafts</div>
                <div className="text-2xl font-bold text-yellow-600">{stats?.draftArticles}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Views</div>
                <div className="text-2xl font-bold text-blue-600">{stats?.totalViews.toLocaleString()}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Subscribers</div>
                <div className="text-2xl font-bold text-purple-600">{stats?.totalSubscribers.toLocaleString()}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Monthly Revenue</div>
                <div className="text-2xl font-bold text-emerald-600">{stats ? formatCurrency(stats.monthlyRevenue) : '$0'}</div>
              </div>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="text-2xl mb-3">{action.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Article Published</div>
                  <div className="text-xs text-gray-600">&quot;Advanced Machine Learning Techniques&quot; • 2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-800">New Subscriber</div>
                  <div className="text-xs text-gray-600">5 new subscribers joined • 4 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Draft Saved</div>
                  <div className="text-xs text-gray-600">&quot;Data Visualization Best Practices&quot; • 1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Management */}
        <section>
          <ArticleManagement
            articles={articles}
            onCreateNew={handleCreateNew}
            onEditArticle={handleEditArticle}
            onDeleteArticle={handleDeleteArticle}
            onPublishArticle={handlePublishArticle}
            onArchiveArticle={handleArchiveArticle}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
}