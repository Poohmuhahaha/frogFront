'use client';

import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { NewsletterSignup } from '@/components/newsletter';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: {
    id: string;
    name: string;
    bio: string;
    avatar?: string;
    subscriberCount: number;
  };
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  tags: string[];
  isPremium: boolean;
  featuredImage?: string;
  seoTitle: string;
  seoDescription: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
}

interface RelatedArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  author: {
    name: string;
  };
  publishedAt: string;
  readingTime: number;
  featuredImage?: string;
}

// Mock data - in real implementation, this would be fetched based on slug
const mockArticle: Article = {
  id: '1',
  title: 'Advanced Machine Learning Techniques for Academic Research',
  content: `
# Introduction

Machine learning has become an indispensable tool in academic research across various disciplines. From natural language processing to computer vision, ML techniques are revolutionizing how researchers approach complex problems and extract insights from data.

## Key Techniques

### 1. Deep Learning Networks

Deep learning networks, particularly convolutional neural networks (CNNs) and recurrent neural networks (RNNs), have shown remarkable success in processing complex data structures. These networks can:

- Handle high-dimensional data effectively
- Learn hierarchical representations
- Adapt to various domain-specific requirements

### 2. Transfer Learning

Transfer learning allows researchers to leverage pre-trained models and adapt them to their specific domains. This approach is particularly valuable when:

- Limited labeled data is available
- Computational resources are constrained
- Domain-specific expertise is required

### 3. Ensemble Methods

Ensemble methods combine multiple models to improve prediction accuracy and robustness. Popular techniques include:

- Random Forests
- Gradient Boosting
- Voting Classifiers

## Applications in Academic Research

### Natural Language Processing

Academic research in NLP has benefited significantly from transformer architectures like BERT and GPT. These models enable:

- Automated literature reviews
- Research paper summarization
- Academic writing assistance

### Computer Vision

In computer vision research, ML techniques facilitate:

- Medical image analysis
- Satellite imagery processing
- Historical document digitization

### Data Science

Machine learning supports data science research through:

- Predictive modeling
- Pattern recognition
- Anomaly detection

## Best Practices

When implementing ML techniques in academic research, consider:

1. **Data Quality**: Ensure your dataset is clean, representative, and properly labeled
2. **Model Selection**: Choose appropriate models based on your research objectives
3. **Validation**: Use proper cross-validation techniques to assess model performance
4. **Reproducibility**: Document your methodology and provide code for replication
5. **Ethical Considerations**: Address bias, fairness, and privacy concerns

## Conclusion

Machine learning continues to evolve and offer new opportunities for academic research. By staying current with the latest techniques and best practices, researchers can harness the full potential of ML to advance their fields and contribute to scientific knowledge.

The future of academic research lies in the thoughtful integration of these powerful tools with domain expertise and rigorous scientific methodology.
  `,
  excerpt: 'Explore cutting-edge ML methods that are revolutionizing academic research across disciplines, from natural language processing to computer vision.',
  slug: 'advanced-ml-techniques-academic-research',
  author: {
    id: '1',
    name: 'Dr. Sarah Chen',
    bio: 'Machine Learning Researcher at Stanford University with over 10 years of experience in AI and academic research.',
    avatar: '/avatars/sarah.jpg',
    subscriberCount: 1250
  },
  publishedAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  readingTime: 12,
  tags: ['Machine Learning', 'Research', 'AI', 'Deep Learning'],
  isPremium: false,
  featuredImage: '/images/ml-research.jpg',
  seoTitle: 'Advanced ML Techniques for Academic Research | Complete Guide 2024',
  seoDescription: 'Discover cutting-edge machine learning techniques revolutionizing academic research. Learn deep learning, transfer learning, and ensemble methods with practical applications.',
  viewCount: 2150,
  likeCount: 89,
  shareCount: 34
};

const mockRelatedArticles: RelatedArticle[] = [
  {
    id: '2',
    title: 'Getting Started with Deep Learning for Researchers',
    excerpt: 'A comprehensive beginner\'s guide to implementing deep learning in academic research projects.',
    slug: 'getting-started-deep-learning-researchers',
    author: { name: 'Dr. Michael Wong' },
    publishedAt: '2024-01-10T14:00:00Z',
    readingTime: 8,
    featuredImage: '/images/deep-learning-guide.jpg'
  },
  {
    id: '3',
    title: 'Research Data Management Best Practices',
    excerpt: 'Essential strategies for organizing, storing, and sharing research data in the digital age.',
    slug: 'research-data-management-best-practices',
    author: { name: 'Prof. Lisa Rodriguez' },
    publishedAt: '2024-01-08T11:30:00Z',
    readingTime: 6,
    featuredImage: '/images/data-management.jpg'
  },
  {
    id: '4',
    title: 'The Future of AI in Academic Publishing',
    excerpt: 'Exploring how artificial intelligence is transforming peer review, citation analysis, and research discovery.',
    slug: 'future-ai-academic-publishing',
    author: { name: 'Dr. James Park' },
    publishedAt: '2024-01-05T16:20:00Z',
    readingTime: 10,
    featuredImage: '/images/ai-publishing.jpg'
  }
];

interface PageProps {
  params: {
    slug: string;
  };
}

// This would be generated server-side in a real application
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateMetadata({ params: _ }: PageProps): Metadata {
  // In real implementation, fetch article data based on slug
  return {
    title: mockArticle.seoTitle,
    description: mockArticle.seoDescription,
    keywords: mockArticle.tags.join(', '),
    authors: [{ name: mockArticle.author.name }],
    openGraph: {
      title: mockArticle.seoTitle,
      description: mockArticle.seoDescription,
      type: 'article',
      publishedTime: mockArticle.publishedAt,
      modifiedTime: mockArticle.updatedAt,
      authors: [mockArticle.author.name],
      tags: mockArticle.tags,
      images: mockArticle.featuredImage ? [mockArticle.featuredImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: mockArticle.seoTitle,
      description: mockArticle.seoDescription,
      images: mockArticle.featuredImage ? [mockArticle.featuredImage] : undefined,
    }
  };
}

export default function ArticlePage({ params }: PageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArticle(mockArticle);
      setRelatedArticles(mockRelatedArticles);
      setIsLoading(false);
    }, 1000);
  }, [params.slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // In real implementation, this would call the API
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // In real implementation, this would call the API
  };

  const handleShare = (platform: string) => {
    // In real implementation, this would handle sharing
    console.log(`Sharing to ${platform}`);
  };

  const handleNewsletterSubscribe = async (data: { email: string; name?: string; source: string; tags?: string[] }) => {
    console.log('Newsletter subscription:', data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-gray-600">The article you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {tag}
                </span>
              ))}
              {article.isPremium && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  Premium
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6">
              {article.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-800">{article.author.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(article.publishedAt)} · {article.readingTime} min read
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>❤️</span>
                  <span>{article.likeCount}</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span>🔗</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-96 bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-lg">Featured Image</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <article className="flex-1">
            <div className="prose prose-lg max-w-none">
              <div
                className="article-content"
                dangerouslySetInnerHTML={{
                  __html: article.content.split('\n').map(line => {
                    if (line.startsWith('# ')) {
                      return `<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-800">${line.slice(2)}</h1>`;
                    } else if (line.startsWith('## ')) {
                      return `<h2 class="text-2xl font-semibold mt-6 mb-3 text-gray-800">${line.slice(3)}</h2>`;
                    } else if (line.startsWith('### ')) {
                      return `<h3 class="text-xl font-semibold mt-4 mb-2 text-gray-800">${line.slice(4)}</h3>`;
                    } else if (line.startsWith('- ')) {
                      return `<li class="ml-4 mb-1 text-gray-700">${line.slice(2)}</li>`;
                    } else if (line.match(/^\d+\./)) {
                      return `<li class="ml-4 mb-1 text-gray-700">${line.replace(/^\d+\.\s*/, '')}</li>`;
                    } else if (line.trim() === '') {
                      return '<br>';
                    } else {
                      return `<p class="mb-4 text-gray-700 leading-relaxed">${line}</p>`;
                    }
                  }).join('')
                }}
              />
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  {article.viewCount.toLocaleString()} views · {article.likeCount} likes · {article.shareCount} shares
                </div>
                <div className="text-sm text-gray-600">
                  Last updated: {formatDate(article.updatedAt)}
                </div>
              </div>

              {/* Author Bio */}
              <div className="bg-gray-100 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {article.author.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {article.author.bio}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {article.author.subscriberCount.toLocaleString()} followers
                      </span>
                      <button
                        onClick={handleFollow}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </article>

          {/* Sidebar */}
          <aside className="w-80 hidden lg:block">
            <div className="sticky top-8">
              {/* Related Articles */}
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <h4 className="font-medium text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {relatedArticle.excerpt}
                      </p>
                      <div className="text-xs text-gray-500">
                        {relatedArticle.author.name} · {relatedArticle.readingTime} min read
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mb-6">
                <NewsletterSignup
                  title="Get more insights"
                  description="Subscribe to get the latest research articles and academic insights."
                  variant="sidebar"
                  onSubscribe={handleNewsletterSubscribe}
                  source="article"
                  tags={['article-page']}
                />
              </div>

              {/* Share Options */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Share this article</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Share via Email
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}