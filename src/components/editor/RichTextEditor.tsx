'use client';

import React, { useState, useCallback } from 'react';

export interface EditorContent {
  title: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  slug: string;
}

interface RichTextEditorProps {
  initialContent?: Partial<EditorContent>;
  onChange?: (content: EditorContent) => void;
  onSave?: (content: EditorContent) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = {},
  onChange,
  onSave,
  isLoading = false,
  readOnly = false
}) => {
  const [content, setContent] = useState<EditorContent>({
    title: '',
    content: '',
    excerpt: '',
    seoTitle: '',
    seoDescription: '',
    tags: [],
    slug: '',
    ...initialContent
  });

  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Generate slug from title
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }, []);

  const handleContentChange = (field: keyof EditorContent, value: string | string[]) => {
    const updatedContent = { ...content, [field]: value };

    // Auto-generate slug when title changes
    if (field === 'title' && typeof value === 'string') {
      updatedContent.slug = generateSlug(value);
      // Auto-generate SEO title if not manually set
      if (!content.seoTitle || content.seoTitle === content.title) {
        updatedContent.seoTitle = value;
      }
    }

    setContent(updatedContent);
    onChange?.(updatedContent);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !content.tags.includes(newTag.trim())) {
      const updatedTags = [...content.tags, newTag.trim()];
      handleContentChange('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = content.tags.filter(tag => tag !== tagToRemove);
    handleContentChange('tags', updatedTags);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(content);
    }
  };

  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const wordCount = content.content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = calculateReadingTime(content.content);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Content Editor</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSeoPanel(!showSeoPanel)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              SEO Tools
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || readOnly}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isLoading || readOnly
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Editor */}
        <div className="flex-1 p-6">
          {/* Title */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your title..."
              value={content.title}
              onChange={(e) => handleContentChange('title', e.target.value)}
              readOnly={readOnly}
              className="w-full text-3xl font-bold border-none outline-none placeholder-gray-400 resize-none"
            />
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt (for article previews)
            </label>
            <textarea
              placeholder="Write a brief excerpt that will appear in article previews..."
              value={content.excerpt}
              onChange={(e) => handleContentChange('excerpt', e.target.value)}
              readOnly={readOnly}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Main Content */}
          <div className="mb-6">
            <textarea
              placeholder="Start writing your content..."
              value={content.content}
              onChange={(e) => handleContentChange('content', e.target.value)}
              readOnly={readOnly}
              rows={20}
              className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
            />
            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  {!readOnly && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEO Panel */}
        {showSeoPanel && (
          <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Optimization</h3>

            {/* SEO Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title ({content.seoTitle.length}/60)
              </label>
              <input
                type="text"
                placeholder="Custom SEO title..."
                value={content.seoTitle}
                onChange={(e) => handleContentChange('seoTitle', e.target.value)}
                readOnly={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-1 text-xs text-gray-500">
                {content.seoTitle.length > 60 && (
                  <span className="text-red-600">Title too long for optimal SEO</span>
                )}
              </div>
            </div>

            {/* SEO Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description ({content.seoDescription.length}/160)
              </label>
              <textarea
                placeholder="Write a compelling meta description..."
                value={content.seoDescription}
                onChange={(e) => handleContentChange('seoDescription', e.target.value)}
                readOnly={readOnly}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-1 text-xs text-gray-500">
                {content.seoDescription.length > 160 && (
                  <span className="text-red-600">Description too long for optimal SEO</span>
                )}
              </div>
            </div>

            {/* URL Slug */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                placeholder="article-url-slug"
                value={content.slug}
                onChange={(e) => handleContentChange('slug', e.target.value)}
                readOnly={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-1 text-xs text-gray-500">
                yoursite.com/articles/{content.slug}
              </div>
            </div>

            {/* SEO Preview */}
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Search Preview</h4>
              <div className="text-blue-600 text-sm font-medium hover:underline">
                {content.seoTitle || content.title || 'Your article title'}
              </div>
              <div className="text-green-700 text-xs mt-1">
                yoursite.com/articles/{content.slug || 'article-slug'}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {content.seoDescription || content.excerpt || 'Your article description will appear here...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;