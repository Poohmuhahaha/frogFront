'use client';

import React, { useState, useEffect } from 'react';
import { NewsletterSignup } from '@/components/newsletter';

// Mock data - in real implementation, this would come from API
interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readingTime: number;
  tags: string[];
  isPremium: boolean;
  featuredImage?: string;
}

interface Creator {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
  subscriberCount: number;
  articleCount: number;
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Advanced Machine Learning Techniques for Academic Research',
    excerpt: 'Explore cutting-edge ML methods that are revolutionizing academic research across disciplines, from natural language processing to computer vision.',
    slug: 'advanced-ml-techniques-academic-research',
    author: { name: 'Dr. Sarah Chen', avatar: '/avatars/sarah.jpg' },
    publishedAt: '2024-01-15T10:00:00Z',
    readingTime: 12,
    tags: ['Machine Learning', 'Research', 'AI'],
    isPremium: false,
    featuredImage: '/images/ml-research.jpg'
  },
  {
    id: '2',
    title: 'The Future of Academic Publishing: Blockchain and Decentralization',
    excerpt: 'How blockchain technology is transforming peer review, citation tracking, and academic credibility in the digital age.',
    slug: 'future-academic-publishing-blockchain',
    author: { name: 'Prof. Michael Rodriguez', avatar: '/avatars/michael.jpg' },
    publishedAt: '2024-01-14T14:30:00Z',
    readingTime: 8,
    tags: ['Blockchain', 'Publishing', 'Academic'],
    isPremium: true,
    featuredImage: '/images/blockchain-academic.jpg'
  },
  {
    id: '3',
    title: 'Data Visualization Best Practices for Scientific Papers',
    excerpt: 'Learn how to create compelling, clear, and scientifically accurate visualizations that enhance your research publications.',
    slug: 'data-visualization-scientific-papers',
    author: { name: 'Dr. Emily Watson', avatar: '/avatars/emily.jpg' },
    publishedAt: '2024-01-13T09:15:00Z',
    readingTime: 10,
    tags: ['Data Visualization', 'Research', 'Publishing'],
    isPremium: false,
    featuredImage: '/images/data-viz.jpg'
  }
];

const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    bio: 'Machine Learning Researcher at Stanford University',
    avatar: '/avatars/sarah.jpg',
    subscriberCount: 1250,
    articleCount: 23
  },
  {
    id: '2',
    name: 'Prof. Michael Rodriguez',
    bio: 'Blockchain Technology & Academic Innovation Expert',
    avatar: '/avatars/michael.jpg',
    subscriberCount: 890,
    articleCount: 15
  },
  {
    id: '3',
    name: 'Dr. Emily Watson',
    bio: 'Data Scientist & Research Visualization Specialist',
    avatar: '/avatars/emily.jpg',
    subscriberCount: 2100,
    articleCount: 31
  }
];

export default function Homepage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArticles(mockArticles);
      setCreators(mockCreators);
      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = ['all', 'Machine Learning', 'Research', 'Publishing', 'Data Visualization', 'Academic'];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.tags.includes(selectedCategory));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNewsletterSubscribe = async (data: { email: string; name?: string; source: string; tags?: string[] }) => {
    // Mock newsletter subscription
    console.log('Newsletter subscription:', data);
    // In real implementation, this would call the API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Academic Excellence
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with leading researchers, explore cutting-edge content, and advance your academic journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Reading
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Become a Creator
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Articles</h2>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {article.featuredImage && (
                  <div className="h-48 bg-gray-300 relative">
                    {/* Placeholder for image */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      Featured Image
                    </div>
                    {article.isPremium && (
                      <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Premium
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {article.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{article.author.name}</div>
                        <div className="text-xs text-gray-500">{formatDate(article.publishedAt)}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {article.readingTime} min read
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Read Article
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Featured Creators */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Creators</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creators.map((creator) => (
              <div key={creator.id} className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{creator.name}</h3>
                <p className="text-gray-600 mb-4">{creator.bio}</p>
                <div className="flex justify-center gap-6 text-sm text-gray-500 mb-4">
                  <span>{creator.subscriberCount.toLocaleString()} subscribers</span>
                  <span>{creator.articleCount} articles</span>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup
            title="Stay Updated with Academic Insights"
            description="Get the latest research articles, academic trends, and creator updates delivered to your inbox."
            onSubscribe={handleNewsletterSubscribe}
            source="website"
            tags={['homepage']}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Research?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of academics who are already sharing their insights and building their audience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Writing
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}