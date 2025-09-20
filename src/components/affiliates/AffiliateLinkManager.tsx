'use client';

import React, { useState, useMemo } from 'react';

export interface AffiliateLink {
  id: string;
  name: string;
  originalUrl: string;
  trackingCode: string;
  network: 'amazon' | 'shareasale' | 'cj' | 'custom';
  commissionRate: number; // percentage
  category: string;
  isActive: boolean;
  createdAt: string;
  stats?: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

interface AffiliateLinkManagerProps {
  links: AffiliateLink[];
  onCreateLink: (link: Omit<AffiliateLink, 'id' | 'trackingCode' | 'createdAt' | 'stats'>) => Promise<void>;
  onUpdateLink: (id: string, updates: Partial<AffiliateLink>) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  onCopyTrackingUrl: (trackingCode: string) => void;
  isLoading?: boolean;
}

export const AffiliateLinkManager: React.FC<AffiliateLinkManagerProps> = ({
  links,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  onCopyTrackingUrl,
  isLoading = false
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkFilter, setNetworkFilter] = useState<'all' | AffiliateLink['network']>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState<Omit<AffiliateLink, 'id' | 'trackingCode' | 'createdAt' | 'stats'>>({
    name: '',
    originalUrl: '',
    network: 'custom',
    commissionRate: 0,
    category: '',
    isActive: true
  });

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(links.map(link => link.category).filter(Boolean)));
  }, [links]);

  // Filter and search links
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNetwork = networkFilter === 'all' || link.network === networkFilter;
      const matchesCategory = categoryFilter === 'all' || link.category === categoryFilter;
      return matchesSearch && matchesNetwork && matchesCategory;
    });
  }, [links, searchTerm, networkFilter, categoryFilter]);

  // Calculate total stats
  const totalStats = useMemo(() => {
    return links.reduce((acc, link) => {
      if (link.stats) {
        acc.clicks += link.stats.clicks;
        acc.conversions += link.stats.conversions;
        acc.revenue += link.stats.revenue;
      }
      return acc;
    }, { clicks: 0, conversions: 0, revenue: 0 });
  }, [links]);

  const resetForm = () => {
    setFormData({
      name: '',
      originalUrl: '',
      network: 'custom',
      commissionRate: 0,
      category: '',
      isActive: true
    });
    setEditingLink(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLink) {
        await onUpdateLink(editingLink, formData);
      } else {
        await onCreateLink(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save affiliate link:', error);
    }
  };

  const handleEdit = (link: AffiliateLink) => {
    setFormData({
      name: link.name,
      originalUrl: link.originalUrl,
      network: link.network,
      commissionRate: link.commissionRate,
      category: link.category,
      isActive: link.isActive
    });
    setEditingLink(link.id);
    setShowCreateForm(true);
  };

  const getNetworkColor = (network: AffiliateLink['network']) => {
    const colors = {
      amazon: 'bg-orange-100 text-orange-800',
      shareasale: 'bg-blue-100 text-blue-800',
      cj: 'bg-green-100 text-green-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[network];
  };

  const getTrackingUrl = (trackingCode: string) => {
    return `${window.location.origin}/track/${trackingCode}`;
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Affiliate Link Manager</h2>
            <p className="text-gray-600 mt-1">Track and manage your affiliate marketing links</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-gray-400"
          >
            + Add New Link
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{links.length}</div>
            <div className="text-sm text-gray-600">Total Links</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">{totalStats.clicks.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">{totalStats.conversions.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-800">${totalStats.revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search links by name, category, or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value as 'all' | AffiliateLink['network'])}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Networks</option>
              <option value="amazon">Amazon</option>
              <option value="shareasale">ShareASale</option>
              <option value="cj">Commission Junction</option>
              <option value="custom">Custom</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingLink ? 'Edit Affiliate Link' : 'Create New Affiliate Link'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Best Gaming Mouse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Electronics, Books, Software"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original URL *
              </label>
              <input
                type="url"
                required
                value={formData.originalUrl}
                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/product"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Network
                </label>
                <select
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value as AffiliateLink['network'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="amazon">Amazon Associates</option>
                  <option value="shareasale">ShareASale</option>
                  <option value="cj">Commission Junction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active (link is trackable)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-gray-400"
              >
                {editingLink ? 'Update Link' : 'Create Link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading affiliate links...</div>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm || networkFilter !== 'all' || categoryFilter !== 'all'
                ? 'No links match your filters'
                : 'No affiliate links yet. Create your first link!'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLinks.map((link) => (
              <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{link.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(link.network)}`}>
                        {link.network.toUpperCase()}
                      </span>
                      {!link.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Original URL</div>
                        <div className="text-sm text-blue-600 truncate">
                          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {link.originalUrl}
                          </a>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Tracking URL</div>
                        <div className="text-sm text-green-600 truncate">
                          {getTrackingUrl(link.trackingCode)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Category</div>
                        <div className="text-sm text-gray-800">{link.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Commission: {link.commissionRate}%</span>
                      <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                      {link.stats && (
                        <>
                          <span>{link.stats.clicks} clicks</span>
                          <span>{link.stats.conversions} conversions</span>
                          <span>${link.stats.revenue.toLocaleString()} revenue</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onCopyTrackingUrl(link.trackingCode)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Copy URL
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleEdit(link)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
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

export default AffiliateLinkManager;