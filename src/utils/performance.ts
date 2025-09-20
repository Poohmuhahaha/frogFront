interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
}

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
  sizes?: string;
  priority?: boolean;
}

export class PerformanceOptimizer {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, IntersectionObserver> = new Map();
  private loadingStates: Map<string, LoadingState> = new Map();

  constructor() {
    this.initializePerformanceObserver();
    this.setupWebVitals();
  }

  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }

  private setupWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Measure TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }

    // Measure CLS
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsEntries.push(entry);
            clsValue += (entry as any).value;
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });

      // Report CLS when the page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.metrics.cls = clsValue;
          this.reportMetrics();
        }
      });
    } catch (error) {
      console.warn('Layout shift observation not supported:', error);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
        break;
      case 'largest-contentful-paint':
        this.metrics.lcp = entry.startTime;
        break;
      case 'first-input':
        this.metrics.fid = (entry as any).processingStart - entry.startTime;
        break;
    }
  }

  private reportMetrics(): void {
    if (process.env.NODE_ENV === 'production') {
      // Send metrics to analytics service
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      }).catch(console.error);
    } else {
      console.log('Performance Metrics:', this.metrics);
    }
  }

  // Lazy loading for images
  setupLazyLoading(selector: string = 'img[data-src]'): void {
    if (typeof window === 'undefined') return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy');
            img.classList.add('lazy-loaded');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    document.querySelectorAll(selector).forEach(img => {
      imageObserver.observe(img);
    });

    this.observers.set('images', imageObserver);
  }

  // Preload critical resources
  preloadCriticalResources(resources: Array<{ url: string; type: 'script' | 'style' | 'font' | 'image' }>): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;

      switch (resource.type) {
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
        case 'image':
          link.as = 'image';
          break;
      }

      document.head.appendChild(link);
    });
  }

  // Optimize images
  optimizeImage(src: string, options: ImageOptimizationOptions = {}): string {
    const {
      quality = 80,
      format = 'webp',
      sizes,
      priority = false
    } = options;

    // If using Next.js Image optimization
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Development mode - return original
      return src;
    }

    // Production image optimization
    const params = new URLSearchParams();
    params.set('url', src);
    params.set('w', '800'); // Default width
    params.set('q', quality.toString());

    if (format !== 'original') {
      params.set('f', format);
    }

    return `/api/image-optimize?${params.toString()}`;
  }

  // Bundle splitting and lazy loading for components
  async loadComponent<T>(importFn: () => Promise<{ default: T }>): Promise<T> {
    const componentId = importFn.toString();

    this.setLoadingState(componentId, { isLoading: true, progress: 0 });

    try {
      const module = await importFn();
      this.setLoadingState(componentId, { isLoading: false, progress: 100 });
      return module.default;
    } catch (error) {
      this.setLoadingState(componentId, { isLoading: false, progress: 0 });
      throw error;
    }
  }

  // Service Worker for caching
  async registerServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Update available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Show update available notification
              this.showUpdateNotification();
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private showUpdateNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <p>A new version is available!</p>
        <button onclick="window.location.reload()">Update</button>
        <button onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;
    document.body.appendChild(notification);
  }

  // Critical CSS inlining
  inlineCriticalCSS(css: string): void {
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }

  // Resource hints
  addResourceHints(hints: Array<{ url: string; type: 'dns-prefetch' | 'preconnect' | 'prefetch' }>): void {
    hints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.type;
      link.href = hint.url;

      if (hint.type === 'preconnect') {
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  // Code splitting utilities
  createAsyncComponent<P = {}>(
    importFn: () => Promise<{ default: React.ComponentType<P> }>,
    fallback?: React.ComponentType
  ): React.ComponentType<P> {
    return React.lazy(importFn) as React.ComponentType<P>;
  }

  // Memory optimization
  cleanupUnusedObservers(): void {
    this.observers.forEach((observer, key) => {
      observer.disconnect();
      this.observers.delete(key);
    });
  }

  // Performance monitoring
  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();

      console.log(`Function ${name} took ${end - start} milliseconds`);

      // Track slow functions
      if (end - start > 100) {
        this.reportSlowFunction(name, end - start);
      }

      return result;
    };
  }

  private reportSlowFunction(name: string, duration: number): void {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/slow-functions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, duration, timestamp: Date.now() })
      }).catch(console.error);
    }
  }

  // Loading state management
  setLoadingState(key: string, state: LoadingState): void {
    this.loadingStates.set(key, state);
    this.notifyLoadingStateChange(key, state);
  }

  getLoadingState(key: string): LoadingState | undefined {
    return this.loadingStates.get(key);
  }

  private notifyLoadingStateChange(key: string, state: LoadingState): void {
    window.dispatchEvent(new CustomEvent('loadingStateChange', {
      detail: { key, state }
    }));
  }

  // Virtual scrolling for large lists
  createVirtualList<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    renderItem: (item: T, index: number) => React.ReactNode
  ): {
    visibleItems: Array<{ item: T; index: number }>;
    scrollTop: number;
    totalHeight: number;
  } {
    const startIndex = Math.floor(this.getScrollTop() / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    const visibleItems = items
      .slice(startIndex, endIndex)
      .map((item, i) => ({ item, index: startIndex + i }));

    return {
      visibleItems,
      scrollTop: startIndex * itemHeight,
      totalHeight: items.length * itemHeight
    };
  }

  private getScrollTop(): number {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  // Tree shaking utilities
  stripUnusedCode(): void {
    // Remove unused CSS classes
    const usedClasses = new Set<string>();
    document.querySelectorAll('*').forEach(el => {
      el.classList.forEach(cls => usedClasses.add(cls));
    });

    // In production, this would be handled by build tools
    if (process.env.NODE_ENV === 'development') {
      console.log('Used CSS classes:', Array.from(usedClasses));
    }
  }

  // Network optimization
  async optimizeNetworkRequests<T>(
    requests: Array<() => Promise<T>>,
    concurrency: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = request().then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  // Cleanup method
  cleanup(): void {
    this.cleanupUnusedObservers();
    this.loadingStates.clear();
  }

  // Get current performance score
  getPerformanceScore(): number {
    const weights = {
      fcp: 0.15, // First Contentful Paint
      lcp: 0.25, // Largest Contentful Paint
      fid: 0.25, // First Input Delay
      cls: 0.15, // Cumulative Layout Shift
      ttfb: 0.20  // Time to First Byte
    };

    let score = 0;
    let totalWeight = 0;

    // Score FCP (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
    if (this.metrics.fcp !== undefined) {
      score += weights.fcp * (this.metrics.fcp < 1800 ? 100 : this.metrics.fcp < 3000 ? 75 : 50);
      totalWeight += weights.fcp;
    }

    // Score LCP (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (this.metrics.lcp !== undefined) {
      score += weights.lcp * (this.metrics.lcp < 2500 ? 100 : this.metrics.lcp < 4000 ? 75 : 50);
      totalWeight += weights.lcp;
    }

    // Score FID (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (this.metrics.fid !== undefined) {
      score += weights.fid * (this.metrics.fid < 100 ? 100 : this.metrics.fid < 300 ? 75 : 50);
      totalWeight += weights.fid;
    }

    // Score CLS (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (this.metrics.cls !== undefined) {
      score += weights.cls * (this.metrics.cls < 0.1 ? 100 : this.metrics.cls < 0.25 ? 75 : 50);
      totalWeight += weights.cls;
    }

    // Score TTFB (good: <800ms, needs improvement: 800-1800ms, poor: >1800ms)
    if (this.metrics.ttfb !== undefined) {
      score += weights.ttfb * (this.metrics.ttfb < 800 ? 100 : this.metrics.ttfb < 1800 ? 75 : 50);
      totalWeight += weights.ttfb;
    }

    return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer();

// React hooks for performance optimization
export function usePerformanceOptimizer() {
  const [metrics, setMetrics] = React.useState<Partial<PerformanceMetrics>>({});

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics({ ...performanceOptimizer['metrics'] });
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    score: performanceOptimizer.getPerformanceScore(),
    setupLazyLoading: performanceOptimizer.setupLazyLoading.bind(performanceOptimizer),
    optimizeImage: performanceOptimizer.optimizeImage.bind(performanceOptimizer),
    loadComponent: performanceOptimizer.loadComponent.bind(performanceOptimizer)
  };
}

export function useLoadingState(key: string) {
  const [state, setState] = React.useState<LoadingState>({ isLoading: false, progress: 0 });

  React.useEffect(() => {
    const handleStateChange = (event: CustomEvent) => {
      if (event.detail.key === key) {
        setState(event.detail.state);
      }
    };

    window.addEventListener('loadingStateChange', handleStateChange as EventListener);
    return () => {
      window.removeEventListener('loadingStateChange', handleStateChange as EventListener);
    };
  }, [key]);

  return state;
}

export default performanceOptimizer;