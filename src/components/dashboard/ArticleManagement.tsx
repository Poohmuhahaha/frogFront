'use client';

import React, { useState, useMemo } from 'react';

export interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  isPremium: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  tags: string[];
  excerpt: string;
}

interface ArticleManagementProps {
  articles: Article[];
  onCreateNew: () => void;
  onEditArticle: (articleId: string) => void;
  onDeleteArticle: (articleId: string) => Promise<void>;
  onPublishArticle: (articleId: string) => Promise<void>;
  onArchiveArticle: (articleId: string) => Promise<void>;
  isLoading?: boolean;
}

export const ArticleManagement: React.FC<ArticleManagementProps> = ({
  articles,
  onCreateNew,
  onEditArticle,
  onDeleteArticle,
  onPublishArticle,
  onArchiveArticle,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    const filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortBy] as string | number | Date;
      let bValue: string | number | Date = b[sortBy] as string | number | Date;

      // Handle date fields
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'publishedAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle number fields
      if (sortBy === 'viewCount') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [articles, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: Article['status']) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getArticleActions = (article: Article) => {
    const actions = [];

    actions.push(
      <button
        key="edit"
        onClick={() => onEditArticle(article.id)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Edit
      </button>
    );

    if (article.status === 'draft') {
      actions.push(
        <button
          key="publish"
          onClick={() => onPublishArticle(article.id)}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          Publish
        </button>
      );
    }

    if (article.status === 'published') {
      actions.push(
        <button
          key="archive"
          onClick={() => onArchiveArticle(article.id)}
          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
        >
          Archive
        </button>
      );
    }

    actions.push(
      <button
        key="delete"
        onClick={() => onDeleteArticle(article.id)}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Delete
      </button>
    );

    return actions;
  };

  const articleStats = useMemo(() => {
    return {
      total: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      draft: articles.filter(a => a.status === 'draft').length,
      archived: articles.filter(a => a.status === 'archived').length,
      totalViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0)
    };
  }, [articles]);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Article Management</h2>
            <p className="text-gray-600 mt-1">Manage your content library</p>
          </div>
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-gray-400"
          >
            + New Article
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{articleStats.total}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">{articleStats.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-800">{articleStats.draft}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{articleStats.archived}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">{articleStats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search articles by title or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as typeof sortBy);
                setSortOrder(order as typeof sortOrder);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="createdAt-desc">Recently Created</option>
              <option value="publishedAt-desc">Recently Published</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="viewCount-desc">Most Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading articles...</div>
          </div>
        ) : filteredAndSortedArticles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No articles match your filters'
                : 'No articles yet. Create your first article!'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedArticles.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
                      {getStatusBadge(article.status)}
                      {article.isPremium && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Premium
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {formatDate(article.createdAt)}</span>
                      <span>Updated: {formatDate(article.updatedAt)}</span>
                      {article.publishedAt && (
                        <span>Published: {formatDate(article.publishedAt)}</span>
                      )}
                      {article.viewCount !== undefined && (
                        <span>{article.viewCount.toLocaleString()} views</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {getArticleActions(article).map((action, index) => (
                      <React.Fragment key={index}>
                        {action}
                        {index < getArticleActions(article).length - 1 && (
                          <span className="text-gray-300">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleManagement;