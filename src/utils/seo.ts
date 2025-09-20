import { Metadata } from 'next';

interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle: string;
  facebookAppId?: string;
  author: string;
  keywords: string[];
}

interface ArticleMetadata {
  title: string;
  description: string;
  content: string;
  slug: string;
  author: {
    name: string;
    url?: string;
  };
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  category?: string;
  image?: string;
  readingTime?: number;
  premium?: boolean;
}

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  canonical?: string;
}

export class SEOManager {
  private config: SEOConfig;

  constructor() {
    this.config = {
      siteName: 'Frogtales',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://frogtales.com',
      defaultTitle: 'Frogtales - Academic Content & Educational Resources',
      defaultDescription: 'Discover high-quality academic content, educational resources, and expert insights. Join our community of creators and learners.',
      defaultImage: '/images/og-default.jpg',
      twitterHandle: '@frogtales',
      facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      author: 'Frogtales Team',
      keywords: [
        'academic content',
        'educational resources',
        'online learning',
        'expert insights',
        'research',
        'knowledge sharing',
        'academic writing',
        'educational blog'
      ]
    };
  }

  generatePageMetadata(data: PageMetadata): Metadata {
    const title = data.title ? `${data.title} | ${this.config.siteName}` : this.config.defaultTitle;
    const description = data.description || this.config.defaultDescription;
    const url = `${this.config.siteUrl}${data.path}`;
    const image = data.image ? `${this.config.siteUrl}${data.image}` : `${this.config.siteUrl}${this.config.defaultImage}`;

    const metadata: Metadata = {
      title,
      description,
      keywords: this.config.keywords.join(', '),
      authors: [{ name: this.config.author }],
      creator: this.config.author,
      publisher: this.config.siteName,
      robots: data.noIndex ? 'noindex, nofollow' : 'index, follow',
      alternates: {
        canonical: data.canonical || url
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url,
        title,
        description,
        siteName: this.config.siteName,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        site: this.config.twitterHandle,
        creator: this.config.twitterHandle,
        title,
        description,
        images: [image]
      }
    };

    if (this.config.facebookAppId) {
      metadata.other = {
        'fb:app_id': this.config.facebookAppId
      };
    }

    return metadata;
  }

  generateArticleMetadata(article: ArticleMetadata): Metadata {
    const title = `${article.title} | ${this.config.siteName}`;
    const description = article.description;
    const url = `${this.config.siteUrl}/articles/${article.slug}`;
    const image = article.image ? `${this.config.siteUrl}${article.image}` : `${this.config.siteUrl}${this.config.defaultImage}`;

    const keywords = [...this.config.keywords, ...article.tags];
    if (article.category) {
      keywords.push(article.category);
    }

    const metadata: Metadata = {
      title,
      description,
      keywords: keywords.join(', '),
      authors: [{ name: article.author.name, url: article.author.url }],
      creator: article.author.name,
      publisher: this.config.siteName,
      alternates: {
        canonical: url
      },
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url,
        title,
        description,
        siteName: this.config.siteName,
        publishedTime: article.publishedAt.toISOString(),
        modifiedTime: article.updatedAt?.toISOString(),
        authors: [article.author.name],
        tags: article.tags,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        site: this.config.twitterHandle,
        creator: this.config.twitterHandle,
        title,
        description,
        images: [image]
      }
    };

    if (this.config.facebookAppId) {
      metadata.other = {
        'fb:app_id': this.config.facebookAppId,
        'article:author': article.author.name,
        'article:published_time': article.publishedAt.toISOString(),
        'article:modified_time': article.updatedAt?.toISOString() || article.publishedAt.toISOString(),
        'article:section': article.category || 'Academic',
        'article:tag': article.tags.join(',')
      };
    }

    return metadata;
  }

  generateStructuredData(type: 'article' | 'webpage' | 'organization' | 'breadcrumb', data: any): object {
    const baseContext = {
      '@context': 'https://schema.org'
    };

    switch (type) {
      case 'article':
        return this.generateArticleStructuredData(data);
      case 'webpage':
        return this.generateWebPageStructuredData(data);
      case 'organization':
        return this.generateOrganizationStructuredData();
      case 'breadcrumb':
        return this.generateBreadcrumbStructuredData(data);
      default:
        return baseContext;
    }
  }

  private generateArticleStructuredData(article: ArticleMetadata): object {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image ? `${this.config.siteUrl}${article.image}` : `${this.config.siteUrl}${this.config.defaultImage}`,
      author: {
        '@type': 'Person',
        name: article.author.name,
        url: article.author.url
      },
      publisher: {
        '@type': 'Organization',
        name: this.config.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.config.siteUrl}/logo.png`
        }
      },
      datePublished: article.publishedAt.toISOString(),
      dateModified: article.updatedAt?.toISOString() || article.publishedAt.toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${this.config.siteUrl}/articles/${article.slug}`
      },
      keywords: article.tags.join(', '),
      articleSection: article.category || 'Academic',
      wordCount: this.estimateWordCount(article.content),
      timeRequired: article.readingTime ? `PT${article.readingTime}M` : undefined,
      inLanguage: 'en-US',
      isAccessibleForFree: !article.premium,
      hasPart: article.premium ? {
        '@type': 'WebPageElement',
        isAccessibleForFree: false,
        cssSelector: '.premium-content'
      } : undefined
    };

    return structuredData;
  }

  private generateWebPageStructuredData(page: PageMetadata): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.description,
      url: `${this.config.siteUrl}${page.path}`,
      publisher: {
        '@type': 'Organization',
        name: this.config.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.config.siteUrl}/logo.png`
        }
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: page.image ? `${this.config.siteUrl}${page.image}` : `${this.config.siteUrl}${this.config.defaultImage}`
      },
      inLanguage: 'en-US'
    };
  }

  private generateOrganizationStructuredData(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.config.siteName,
      url: this.config.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${this.config.siteUrl}/logo.png`
      },
      sameAs: [
        `https://twitter.com/${this.config.twitterHandle.replace('@', '')}`,
        // Add other social media URLs as needed
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@frogtales.com'
      },
      description: this.config.defaultDescription
    };
  }

  private generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${this.config.siteUrl}${crumb.url}`
      }))
    };
  }

  generateRSSStructuredData(articles: ArticleMetadata[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: this.config.siteName,
      description: this.config.defaultDescription,
      url: this.config.siteUrl,
      publisher: {
        '@type': 'Organization',
        name: this.config.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.config.siteUrl}/logo.png`
        }
      },
      blogPost: articles.map(article => ({
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        url: `${this.config.siteUrl}/articles/${article.slug}`,
        datePublished: article.publishedAt.toISOString(),
        dateModified: article.updatedAt?.toISOString() || article.publishedAt.toISOString(),
        author: {
          '@type': 'Person',
          name: article.author.name
        }
      }))
    };
  }

  generateSitemapUrls(pages: Array<{ path: string; lastModified?: Date; priority?: number; changeFreq?: string }>): string[] {
    return pages.map(page => {
      const url = `${this.config.siteUrl}${page.path}`;
      const lastmod = page.lastModified ? page.lastModified.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const priority = page.priority || 0.5;
      const changefreq = page.changeFreq || 'weekly';

      return `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`;
    });
  }

  generateRobotsTxt(customRules?: string[]): string {
    const defaultRules = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin/',
      'Disallow: /api/',
      'Disallow: /private/',
      '',
      `Sitemap: ${this.config.siteUrl}/sitemap.xml`
    ];

    const rules = customRules ? [...defaultRules, ...customRules] : defaultRules;
    return rules.join('\n');
  }

  extractMetaFromContent(content: string): { description: string; keywords: string[]; readingTime: number } {
    const stripped = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = stripped.split(' ').length;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute

    const description = stripped.substring(0, 155) + (stripped.length > 155 ? '...' : '');

    const keywords = this.extractKeywords(stripped);

    return { description, keywords, readingTime };
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private estimateWordCount(content: string): number {
    return content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(word => word.length > 0).length;
  }

  validateMetadata(metadata: Metadata): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metadata.title || metadata.title.length > 60) {
      errors.push('Title should be present and under 60 characters');
    }

    if (!metadata.description || typeof metadata.description !== 'string' || metadata.description.length > 160) {
      errors.push('Description should be present and under 160 characters');
    }

    if (metadata.openGraph?.images && metadata.openGraph.images.length === 0) {
      errors.push('At least one Open Graph image should be provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getSEOScore(metadata: Metadata, content?: string): { score: number; suggestions: string[] } {
    let score = 0;
    const suggestions: string[] = [];

    if (metadata.title && metadata.title.length >= 30 && metadata.title.length <= 60) {
      score += 20;
    } else {
      suggestions.push('Title should be between 30-60 characters');
    }

    if (metadata.description && metadata.description.length >= 120 && metadata.description.length <= 160) {
      score += 20;
    } else {
      suggestions.push('Description should be between 120-160 characters');
    }

    if (metadata.openGraph?.images && metadata.openGraph.images.length > 0) {
      score += 15;
    } else {
      suggestions.push('Add Open Graph images for better social sharing');
    }

    if (metadata.keywords) {
      score += 10;
    } else {
      suggestions.push('Add relevant keywords');
    }

    if (metadata.alternates?.canonical) {
      score += 10;
    } else {
      suggestions.push('Set canonical URL to avoid duplicate content');
    }

    if (content) {
      const wordCount = this.estimateWordCount(content);
      if (wordCount >= 300) {
        score += 15;
      } else {
        suggestions.push('Content should be at least 300 words');
      }

      const headings = (content.match(/<h[1-6][^>]*>/g) || []).length;
      if (headings >= 2) {
        score += 10;
      } else {
        suggestions.push('Use proper heading structure (H1-H6)');
      }
    }

    return { score, suggestions };
  }
}

export const seoManager = new SEOManager();
export default seoManager;