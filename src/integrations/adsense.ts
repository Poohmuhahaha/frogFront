interface AdSenseConfig {
  publisherId: string;
  enableTestMode: boolean;
  environment: 'development' | 'production';
}

interface AdUnitConfig {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adLayoutKey?: string;
  responsive?: boolean;
  width?: number;
  height?: number;
}

interface AdPerformanceData {
  adSlot: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  rpm: number;
  date: string;
}

export class AdSenseIntegration {
  private config: AdSenseConfig;
  private isInitialized: boolean = false;
  private adUnits: Map<string, AdUnitConfig> = new Map();

  constructor() {
    this.config = {
      publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
      enableTestMode: process.env.NODE_ENV === 'development',
      environment: process.env.NODE_ENV as 'development' | 'production'
    };

    if (!this.config.publisherId && this.config.environment === 'production') {
      console.warn('AdSense publisher ID not configured for production environment');
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (typeof window === 'undefined') {
        console.warn('AdSense: Window object not available (SSR)');
        return;
      }

      if (!this.config.publisherId) {
        console.warn('AdSense: Publisher ID not configured');
        return;
      }

      await this.loadAdSenseScript();
      this.setupGlobalAdSenseConfig();
      this.isInitialized = true;

      console.log('AdSense initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdSense:', error);
    }
  }

  private async loadAdSenseScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="adsbygoogle.js"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${this.config.publisherId}`;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load AdSense script'));

      document.head.appendChild(script);
    });
  }

  private setupGlobalAdSenseConfig(): void {
    if (typeof window !== 'undefined') {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];

      if (this.config.enableTestMode) {
        (window as any).adsbygoogle.push({
          google_ad_client: `ca-pub-${this.config.publisherId}`,
          enable_page_level_ads: true,
          tag_for_child_directed_treatment: 1
        });
      }
    }
  }

  registerAdUnit(id: string, config: AdUnitConfig): void {
    this.adUnits.set(id, config);
  }

  async displayAd(containerId: string, adUnitId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const adConfig = this.adUnits.get(adUnitId);
    if (!adConfig) {
      console.error(`Ad unit ${adUnitId} not registered`);
      return;
    }

    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
      }

      const adElement = this.createAdElement(adConfig);
      container.appendChild(adElement);

      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
      }

      await this.trackAdDisplay(adUnitId);
    } catch (error) {
      console.error('Failed to display ad:', error);
    }
  }

  private createAdElement(config: AdUnitConfig): HTMLElement {
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';

    adElement.setAttribute('data-ad-client', `ca-pub-${this.config.publisherId}`);
    adElement.setAttribute('data-ad-slot', config.adSlot);

    if (config.adFormat) {
      adElement.setAttribute('data-ad-format', config.adFormat);
    }

    if (config.adLayoutKey) {
      adElement.setAttribute('data-ad-layout-key', config.adLayoutKey);
    }

    if (config.responsive !== false) {
      adElement.setAttribute('data-full-width-responsive', 'true');
    }

    if (config.width && config.height) {
      adElement.style.width = `${config.width}px`;
      adElement.style.height = `${config.height}px`;
    }

    if (this.config.enableTestMode) {
      adElement.setAttribute('data-adtest', 'on');
    }

    return adElement;
  }

  async refreshAd(containerId: string): Promise<void> {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
      }

      const existingAds = container.querySelectorAll('.adsbygoogle');
      existingAds.forEach(ad => ad.remove());

      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
      }
    } catch (error) {
      console.error('Failed to refresh ad:', error);
    }
  }

  createResponsiveAdUnit(): AdUnitConfig {
    return {
      adSlot: 'responsive-ad',
      adFormat: 'auto',
      responsive: true
    };
  }

  createArticleAdUnit(): AdUnitConfig {
    return {
      adSlot: 'article-ad',
      adFormat: 'rectangle',
      width: 336,
      height: 280
    };
  }

  createSidebarAdUnit(): AdUnitConfig {
    return {
      adSlot: 'sidebar-ad',
      adFormat: 'vertical',
      width: 160,
      height: 600
    };
  }

  createBannerAdUnit(): AdUnitConfig {
    return {
      adSlot: 'banner-ad',
      adFormat: 'horizontal',
      width: 728,
      height: 90
    };
  }

  async getAdPerformance(dateRange: { start: Date; end: Date }): Promise<AdPerformanceData[]> {
    if (this.config.environment === 'development') {
      return this.generateMockPerformanceData(dateRange);
    }

    try {
      const response = await fetch('/api/adsense/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ad performance data');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get ad performance:', error);
      return [];
    }
  }

  private generateMockPerformanceData(dateRange: { start: Date; end: Date }): AdPerformanceData[] {
    const mockData: AdPerformanceData[] = [];
    const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);

      mockData.push({
        adSlot: 'article-ad',
        impressions: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 50) + 5,
        ctr: +(Math.random() * 5 + 1).toFixed(2),
        revenue: +(Math.random() * 10 + 2).toFixed(2),
        rpm: +(Math.random() * 3 + 0.5).toFixed(2),
        date: date.toISOString().split('T')[0]
      });

      mockData.push({
        adSlot: 'sidebar-ad',
        impressions: Math.floor(Math.random() * 500) + 50,
        clicks: Math.floor(Math.random() * 25) + 2,
        ctr: +(Math.random() * 3 + 0.5).toFixed(2),
        revenue: +(Math.random() * 5 + 1).toFixed(2),
        rpm: +(Math.random() * 2 + 0.3).toFixed(2),
        date: date.toISOString().split('T')[0]
      });
    }

    return mockData;
  }

  private async trackAdDisplay(adUnitId: string): Promise<void> {
    try {
      await fetch('/api/analytics/ad-display', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adUnitId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to track ad display:', error);
    }
  }

  enableAutoAds(): void {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      (window as any).adsbygoogle.push({
        google_ad_client: `ca-pub-${this.config.publisherId}`,
        enable_page_level_ads: true,
        overlays: { bottom: true }
      });
    }
  }

  disableAutoAds(): void {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      (window as any).adsbygoogle.push({
        google_ad_client: `ca-pub-${this.config.publisherId}`,
        enable_page_level_ads: false
      });
    }
  }

  setPersonalizedAds(enabled: boolean): void {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      (window as any).adsbygoogle.push({
        google_ad_client: `ca-pub-${this.config.publisherId}`,
        enable_page_level_ads: true,
        page_level_ad_settings: {
          personalized_ads: enabled
        }
      });
    }
  }

  async getAdUnits(): Promise<AdUnitConfig[]> {
    return Array.from(this.adUnits.values());
  }

  isTestMode(): boolean {
    return this.config.enableTestMode;
  }

  getPublisherId(): string {
    return this.config.publisherId;
  }
}

export const AdSenseComponent: React.FC<{
  adUnitId: string;
  containerId: string;
  className?: string;
}> = ({ adUnitId, containerId, className }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const loadAd = async () => {
      try {
        await adSenseIntegration.displayAd(containerId, adUnitId);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load ad:', error);
      }
    };

    loadAd();
  }, [adUnitId, containerId]);

  return (
    <div
      id={containerId}
      className={`ad-container ${className || ''}`}
      style={{
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px dashed #ccc'
      }}
    >
      {!isLoaded && (
        <div style={{ color: '#888', fontSize: '14px' }}>
          Loading advertisement...
        </div>
      )}
    </div>
  );
};

const adSenseIntegration = new AdSenseIntegration();

adSenseIntegration.registerAdUnit('article-ad', adSenseIntegration.createArticleAdUnit());
adSenseIntegration.registerAdUnit('sidebar-ad', adSenseIntegration.createSidebarAdUnit());
adSenseIntegration.registerAdUnit('banner-ad', adSenseIntegration.createBannerAdUnit());
adSenseIntegration.registerAdUnit('responsive-ad', adSenseIntegration.createResponsiveAdUnit());

export default adSenseIntegration;