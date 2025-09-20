import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { seoManager } from '../../src/utils/seo';
import { Metadata } from 'next';

// Mock Next.js metadata
jest.mock('next', () => ({
  Metadata: {}
}));

describe('SEO Manager', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.NEXT_PUBLIC_SITE_URL = 'https://frogtales.com';
  });

  describe('Page Metadata Generation', () => {
    it('should generate complete page metadata', () => {
      const pageData = {
        title: 'About Us',
        description: 'Learn more about Frogtales and our mission to provide quality academic content.',
        path: '/about',
        image: '/images/about-og.jpg'
      };

      const metadata = seoManager.generatePageMetadata(pageData);

      expect(metadata.title).toBe('About Us | Frogtales');
      expect(metadata.description).toBe(pageData.description);
      expect(metadata.openGraph?.title).toBe('About Us | Frogtales');
      expect(metadata.openGraph?.description).toBe(pageData.description);
      expect(metadata.openGraph?.url).toBe('https://frogtales.com/about');
      expect(metadata.openGraph?.images).toEqual([{
        url: 'https://frogtales.com/images/about-og.jpg',
        width: 1200,
        height: 630,
        alt: 'About Us | Frogtales'
      }]);
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBe('About Us | Frogtales');
    });

    it('should use default values when optional fields are missing', () => {
      const pageData = {
        title: '',
        description: '',
        path: '/test'
      };

      const metadata = seoManager.generatePageMetadata(pageData);

      expect(metadata.title).toBe('Frogtales - Academic Content & Educational Resources');
      expect(metadata.description).toBe('Discover high-quality academic content, educational resources, and expert insights. Join our community of creators and learners.');
      expect(metadata.openGraph?.images?.[0]?.url).toBe('https://frogtales.com/images/og-default.jpg');
    });

    it('should handle noIndex pages correctly', () => {
      const pageData = {
        title: 'Private Page',
        description: 'This is a private page',
        path: '/private',
        noIndex: true
      };

      const metadata = seoManager.generatePageMetadata(pageData);

      expect(metadata.robots).toBe('noindex, nofollow');
    });

    it('should set canonical URL correctly', () => {
      const pageData = {
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        canonical: 'https://frogtales.com/canonical-test'
      };

      const metadata = seoManager.generatePageMetadata(pageData);

      expect(metadata.alternates?.canonical).toBe('https://frogtales.com/canonical-test');
    });
  });

  describe('Article Metadata Generation', () => {
    const articleData = {
      title: 'Understanding Machine Learning',
      description: 'A comprehensive guide to machine learning concepts and applications.',
      content: '<p>This article covers the fundamentals of machine learning...</p>',
      slug: 'understanding-machine-learning',
      author: {
        name: 'Dr. Jane Smith',
        url: 'https://frogtales.com/authors/jane-smith'
      },
      publishedAt: new Date('2023-01-15T10:00:00Z'),
      updatedAt: new Date('2023-01-20T15:30:00Z'),
      tags: ['machine learning', 'AI', 'technology'],
      category: 'Technology',
      image: '/images/ml-article.jpg'
    };

    it('should generate complete article metadata', () => {
      const metadata = seoManager.generateArticleMetadata(articleData);

      expect(metadata.title).toBe('Understanding Machine Learning | Frogtales');
      expect(metadata.description).toBe(articleData.description);
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.publishedTime).toBe('2023-01-15T10:00:00.000Z');
      expect(metadata.openGraph?.modifiedTime).toBe('2023-01-20T15:30:00.000Z');
      expect(metadata.openGraph?.authors).toEqual(['Dr. Jane Smith']);
      expect(metadata.openGraph?.tags).toEqual(['machine learning', 'AI', 'technology']);
      expect(metadata.authors).toEqual([{ name: 'Dr. Jane Smith', url: 'https://frogtales.com/authors/jane-smith' }]);
    });

    it('should include article-specific keywords', () => {
      const metadata = seoManager.generateArticleMetadata(articleData);

      const keywords = metadata.keywords as string;
      expect(keywords).toContain('machine learning');
      expect(keywords).toContain('AI');
      expect(keywords).toContain('technology');
      expect(keywords).toContain('Technology'); // category
    });

    it('should handle articles without updated date', () => {
      const articleWithoutUpdate = { ...articleData };
      delete articleWithoutUpdate.updatedAt;

      const metadata = seoManager.generateArticleMetadata(articleWithoutUpdate);

      expect(metadata.openGraph?.modifiedTime).toBe('2023-01-15T10:00:00.000Z');
    });
  });

  describe('Structured Data Generation', () => {
    it('should generate article structured data', () => {
      const articleData = {
        title: 'Test Article',
        description: 'Test description',
        content: '<p>Test content with about fifty words to test the word count estimation functionality properly.</p>',
        slug: 'test-article',
        author: { name: 'Test Author' },
        publishedAt: new Date('2023-01-01'),
        tags: ['test', 'article'],
        category: 'Technology',
        readingTime: 5
      };

      const structuredData = seoManager.generateStructuredData('article', articleData);

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        description: 'Test description',
        author: {
          '@type': 'Person',
          name: 'Test Author'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Frogtales'
        },
        keywords: 'test, article',
        articleSection: 'Technology',
        timeRequired: 'PT5M'
      });
    });

    it('should generate organization structured data', () => {
      const structuredData = seoManager.generateStructuredData('organization', {});

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Frogtales',
        url: 'https://frogtales.com',
        description: expect.any(String)
      });
    });

    it('should generate breadcrumb structured data', () => {
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Articles', url: '/articles' },
        { name: 'Technology', url: '/articles/technology' }
      ];

      const structuredData = seoManager.generateStructuredData('breadcrumb', breadcrumbs);

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://frogtales.com/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Articles',
            item: 'https://frogtales.com/articles'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Technology',
            item: 'https://frogtales.com/articles/technology'
          }
        ]
      });
    });

    it('should generate webpage structured data', () => {
      const pageData = {
        title: 'About Us',
        description: 'Learn about our company',
        path: '/about'
      };

      const structuredData = seoManager.generateStructuredData('webpage', pageData);

      expect(structuredData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'About Us',
        description: 'Learn about our company',
        url: 'https://frogtales.com/about'
      });
    });
  });

  describe('Content Analysis', () => {
    it('should extract metadata from content', () => {
      const content = `
        <h1>Machine Learning Basics</h1>
        <p>Machine learning is a powerful technology that enables computers to learn and make decisions without explicit programming. This comprehensive guide covers fundamental concepts, algorithms, and practical applications in the field of artificial intelligence.</p>
        <p>We'll explore supervised learning, unsupervised learning, and reinforcement learning techniques. By the end of this article, you'll have a solid understanding of how machine learning works and how to apply it in real-world scenarios.</p>
      `;

      const metadata = seoManager.extractMetaFromContent(content);

      expect(metadata.description).toHaveLength(155);
      expect(metadata.description).toContain('Machine learning is a powerful technology');
      expect(metadata.keywords).toContain('machine');
      expect(metadata.keywords).toContain('learning');
      expect(metadata.readingTime).toBeGreaterThan(0);
    });

    it('should handle empty content', () => {
      const metadata = seoManager.extractMetaFromContent('');

      expect(metadata.description).toBe('');
      expect(metadata.keywords).toEqual([]);
      expect(metadata.readingTime).toBe(0);
    });

    it('should extract keywords correctly', () => {
      const content = 'React React React JavaScript JavaScript TypeScript TypeScript TypeScript';

      const metadata = seoManager.extractMetaFromContent(content);

      expect(metadata.keywords[0]).toBe('typescript'); // Most frequent
      expect(metadata.keywords[1]).toBe('react');
      expect(metadata.keywords[2]).toBe('javascript');
    });
  });

  describe('SEO Validation', () => {
    it('should validate metadata correctly', () => {
      const goodMetadata: Metadata = {
        title: 'Good Title Length for SEO Testing',
        description: 'This is a good meta description that provides enough detail about the content while staying within the recommended character limit.',
        openGraph: {
          images: [{ url: 'https://example.com/image.jpg', width: 1200, height: 630 }]
        }
      };

      const validation = seoManager.validateMetadata(goodMetadata);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      const badMetadata: Metadata = {
        title: 'This title is way too long and exceeds the recommended character limit for SEO optimization',
        description: 'Short',
        openGraph: {
          images: []
        }
      };

      const validation = seoManager.validateMetadata(badMetadata);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title should be present and under 60 characters');
      expect(validation.errors).toContain('Description should be present and under 160 characters');
      expect(validation.errors).toContain('At least one Open Graph image should be provided');
    });
  });

  describe('SEO Scoring', () => {
    it('should calculate SEO score for good metadata', () => {
      const goodMetadata: Metadata = {
        title: 'Perfect SEO Title Length',
        description: 'This is an excellent meta description that provides comprehensive information about the content while maintaining optimal length.',
        keywords: 'seo, optimization, content, marketing',
        openGraph: {
          images: [{ url: 'https://example.com/image.jpg' }]
        },
        alternates: {
          canonical: 'https://example.com/page'
        }
      };

      const content = 'This is a comprehensive article about SEO optimization with proper headings and structure. '.repeat(20);

      const { score, suggestions } = seoManager.getSEOScore(goodMetadata, content);

      expect(score).toBeGreaterThan(80);
      expect(suggestions).toHaveLength(0);
    });

    it('should provide suggestions for poor SEO', () => {
      const poorMetadata: Metadata = {
        title: 'Bad',
        description: 'Too short'
      };

      const { score, suggestions } = seoManager.getSEOScore(poorMetadata, 'Short content');

      expect(score).toBeLessThan(50);
      expect(suggestions).toContain('Title should be between 30-60 characters');
      expect(suggestions).toContain('Description should be between 120-160 characters');
      expect(suggestions).toContain('Add Open Graph images for better social sharing');
      expect(suggestions).toContain('Content should be at least 300 words');
    });
  });

  describe('Sitemap Generation', () => {
    it('should generate sitemap URLs', () => {
      const pages = [
        { path: '/', lastModified: new Date('2023-01-01'), priority: 1.0 },
        { path: '/about', lastModified: new Date('2023-01-02'), priority: 0.8 },
        { path: '/articles/test', lastModified: new Date('2023-01-03'), priority: 0.6 }
      ];

      const urls = seoManager.generateSitemapUrls(pages);

      expect(urls).toHaveLength(3);
      expect(urls[0]).toContain('<loc>https://frogtales.com/</loc>');
      expect(urls[0]).toContain('<priority>1</priority>');
      expect(urls[1]).toContain('<loc>https://frogtales.com/about</loc>');
      expect(urls[1]).toContain('<priority>0.8</priority>');
    });
  });

  describe('Robots.txt Generation', () => {
    it('should generate basic robots.txt', () => {
      const robotsTxt = seoManager.generateRobotsTxt();

      expect(robotsTxt).toContain('User-agent: *');
      expect(robotsTxt).toContain('Allow: /');
      expect(robotsTxt).toContain('Disallow: /admin/');
      expect(robotsTxt).toContain('Sitemap: https://frogtales.com/sitemap.xml');
    });

    it('should include custom rules', () => {
      const customRules = [
        'Disallow: /private/',
        'Crawl-delay: 1'
      ];

      const robotsTxt = seoManager.generateRobotsTxt(customRules);

      expect(robotsTxt).toContain('Disallow: /private/');
      expect(robotsTxt).toContain('Crawl-delay: 1');
    });
  });

  describe('RSS Structured Data', () => {
    it('should generate RSS structured data', () => {
      const articles = [
        {
          title: 'Article 1',
          description: 'Description 1',
          slug: 'article-1',
          author: { name: 'Author 1' },
          publishedAt: new Date('2023-01-01'),
          tags: ['tag1'],
          content: 'Content 1'
        },
        {
          title: 'Article 2',
          description: 'Description 2',
          slug: 'article-2',
          author: { name: 'Author 2' },
          publishedAt: new Date('2023-01-02'),
          tags: ['tag2'],
          content: 'Content 2'
        }
      ];

      const rssData = seoManager.generateRSSStructuredData(articles);

      expect(rssData).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Frogtales',
        blogPost: expect.arrayContaining([
          expect.objectContaining({
            '@type': 'BlogPosting',
            headline: 'Article 1',
            description: 'Description 1',
            url: 'https://frogtales.com/articles/article-1'
          })
        ])
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large content efficiently', () => {
      const largeContent = 'word '.repeat(10000);
      const start = performance.now();

      const metadata = seoManager.extractMetaFromContent(largeContent);

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(metadata.readingTime).toBeGreaterThan(40); // ~10000 words / 200 wpm
    });

    it('should handle multiple metadata generations efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        seoManager.generatePageMetadata({
          title: `Page ${i}`,
          description: `Description for page ${i}`,
          path: `/page-${i}`
        });
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values gracefully', () => {
      const metadata = seoManager.generatePageMetadata({
        title: undefined as any,
        description: undefined as any,
        path: '/test'
      });

      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
    });

    it('should handle special characters in content', () => {
      const content = '<p>Content with special chars: @#$%^&*()_+{}:"<>?[]\\;\'</p>';

      const metadata = seoManager.extractMetaFromContent(content);

      expect(metadata.description).not.toContain('<');
      expect(metadata.description).not.toContain('>');
    });

    it('should handle very long titles and descriptions', () => {
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(500);

      const pageData = {
        title: longTitle,
        description: longDescription,
        path: '/test'
      };

      const metadata = seoManager.generatePageMetadata(pageData);

      // Should still generate metadata without errors
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
    });
  });
});