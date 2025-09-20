import { test, expect, Page } from '@playwright/test';

// Helper functions for common operations
async function signUp(page: Page, userData: { name: string; email: string; password: string; role: string }) {
  await page.goto('/auth/register');
  await page.fill('[data-testid="name-input"]', userData.name);
  await page.fill('[data-testid="email-input"]', userData.email);
  await page.fill('[data-testid="password-input"]', userData.password);
  await page.selectOption('[data-testid="role-select"]', userData.role);
  await page.click('[data-testid="register-button"]');
}

async function signIn(page: Page, credentials: { email: string; password: string }) {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', credentials.email);
  await page.fill('[data-testid="password-input"]', credentials.password);
  await page.click('[data-testid="login-button"]');
}

async function createArticle(page: Page, articleData: { title: string; content: string; excerpt?: string }) {
  await page.goto('/dashboard/articles/new');
  await page.fill('[data-testid="article-title"]', articleData.title);
  await page.fill('[data-testid="article-content"]', articleData.content);
  if (articleData.excerpt) {
    await page.fill('[data-testid="article-excerpt"]', articleData.excerpt);
  }
  await page.click('[data-testid="save-article"]');
}

test.describe('User Registration and Authentication Flow', () => {
  test('should complete full user registration flow', async ({ page }) => {
    const userData = {
      name: 'John Doe',
      email: `test+${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'creator'
    };

    // Navigate to registration page
    await page.goto('/auth/register');
    await expect(page).toHaveTitle(/Register/);

    // Fill out registration form
    await signUp(page, userData);

    // Should redirect to email verification page
    await expect(page).toHaveURL(/\/auth\/verify-email/);
    await expect(page.locator('[data-testid="verification-message"]')).toContainText('check your email');

    // Simulate email verification (in real test, would click email link)
    await page.goto('/auth/login');
    await signIn(page, { email: userData.email, password: userData.password });

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText(userData.name);
  });

  test('should handle registration validation errors', async ({ page }) => {
    await page.goto('/auth/register');

    // Try to submit with empty fields
    await page.click('[data-testid="register-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');

    // Try with invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');

    // Try with weak password
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters');
  });

  test('should handle login flow', async ({ page }) => {
    // Assume user already exists
    const credentials = {
      email: 'existing@example.com',
      password: 'Password123!'
    };

    await signIn(page, credentials);

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Fill email and submit
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.click('[data-testid="send-reset-button"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reset link sent');

    // Simulate clicking reset link (would be from email)
    await page.goto('/auth/reset-password?token=mock-reset-token');

    // Fill new password
    await page.fill('[data-testid="new-password-input"]', 'NewPassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!');
    await page.click('[data-testid="reset-password-button"]');

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset successful');
  });
});

test.describe('Content Creator Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as content creator
    await signIn(page, { email: 'creator@example.com', password: 'Password123!' });
  });

  test('should complete article creation and publishing flow', async ({ page }) => {
    const articleData = {
      title: 'Test Article ' + Date.now(),
      content: 'This is the content of the test article with some meaningful text.',
      excerpt: 'This is a test excerpt for the article.'
    };

    // Create new article
    await createArticle(page, articleData);

    // Should redirect to article editor
    await expect(page).toHaveURL(/\/dashboard\/articles\/[^/]+\/edit/);
    await expect(page.locator('[data-testid="article-title"]')).toHaveValue(articleData.title);

    // Add SEO information
    await page.click('[data-testid="seo-tab"]');
    await page.fill('[data-testid="seo-title"]', articleData.title + ' - SEO Title');
    await page.fill('[data-testid="seo-description"]', 'SEO description for the test article');

    // Add tags
    await page.click('[data-testid="tags-input"]');
    await page.keyboard.type('test,article,content');
    await page.keyboard.press('Enter');

    // Save draft
    await page.click('[data-testid="save-draft"]');
    await expect(page.locator('[data-testid="save-status"]')).toContainText('Draft saved');

    // Publish article
    await page.click('[data-testid="publish-button"]');
    await page.click('[data-testid="confirm-publish"]');

    // Should show published status
    await expect(page.locator('[data-testid="article-status"]')).toContainText('Published');

    // Verify article appears in article list
    await page.goto('/dashboard/articles');
    await expect(page.locator(`[data-testid="article-${articleData.title}"]`)).toBeVisible();

    // Verify article is accessible to public
    const articleSlug = articleData.title.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`/articles/${articleSlug}`);
    await expect(page.locator('h1')).toContainText(articleData.title);
    await expect(page.locator('[data-testid="article-content"]')).toContainText(articleData.content);
  });

  test('should handle article SEO optimization', async ({ page }) => {
    await page.goto('/dashboard/articles/new');

    // Fill basic article info
    await page.fill('[data-testid="article-title"]', 'SEO Test Article');
    await page.fill('[data-testid="article-content"]', 'Content for SEO testing with multiple paragraphs. This helps test the SEO analysis functionality.');

    // Check SEO panel
    await page.click('[data-testid="seo-panel-toggle"]');
    await expect(page.locator('[data-testid="seo-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="reading-time"]')).toContainText('min read');

    // Improve SEO based on suggestions
    await page.fill('[data-testid="seo-description"]', 'A comprehensive guide to SEO testing with detailed examples and best practices.');

    // Add meta keywords
    await page.fill('[data-testid="meta-keywords"]', 'SEO, testing, optimization, content');

    // Verify SEO score improved
    const seoScore = await page.locator('[data-testid="seo-score-value"]').textContent();
    expect(parseInt(seoScore || '0')).toBeGreaterThan(50);
  });

  test('should manage article analytics', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/dashboard/analytics');

    // Verify analytics dashboard loads
    await expect(page.locator('[data-testid="analytics-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-articles"]')).toBeVisible();

    // Check article performance chart
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();

    // Filter by date range
    await page.selectOption('[data-testid="date-range-select"]', '30-days');
    await page.waitForTimeout(1000); // Wait for chart to update

    // Export analytics data
    await page.click('[data-testid="export-analytics"]');
    // Verify download triggered (in real test, would check downloaded file)
  });
});

test.describe('Subscriber Journey', () => {
  test('should complete newsletter subscription flow', async ({ page }) => {
    // Start from homepage
    await page.goto('/');

    // Find and fill newsletter signup
    await page.fill('[data-testid="newsletter-email"]', 'subscriber@example.com');
    await page.fill('[data-testid="newsletter-name"]', 'John Subscriber');
    await page.click('[data-testid="newsletter-subscribe"]');

    // Should show success message
    await expect(page.locator('[data-testid="subscription-success"]')).toContainText('subscribed successfully');

    // Should redirect to confirmation page
    await expect(page).toHaveURL(/\/newsletter\/confirm/);

    // Simulate email confirmation
    await page.goto('/newsletter/confirm?token=mock-confirmation-token');
    await expect(page.locator('[data-testid="confirmation-success"]')).toContainText('subscription confirmed');
  });

  test('should browse and read articles', async ({ page }) => {
    await page.goto('/');

    // Verify homepage shows articles
    await expect(page.locator('[data-testid="featured-articles"]')).toBeVisible();
    await expect(page.locator('[data-testid="article-grid"]')).toBeVisible();

    // Filter articles by category
    await page.click('[data-testid="category-filter-technology"]');
    await expect(page).toHaveURL(/category=technology/);

    // Read an article
    await page.click('[data-testid="article-card"]:first-child');
    await expect(page).toHaveURL(/\/articles\/[^/]+/);

    // Verify article content loads
    await expect(page.locator('[data-testid="article-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="author-info"]')).toBeVisible();

    // Check related articles
    await expect(page.locator('[data-testid="related-articles"]')).toBeVisible();

    // Like article (if logged in)
    await page.click('[data-testid="like-button"]');
    await expect(page.locator('[data-testid="like-count"]')).toContainText('1');

    // Share article
    await page.click('[data-testid="share-button"]');
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
  });
});

test.describe('Monetization Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, { email: 'creator@example.com', password: 'Password123!' });
  });

  test('should handle subscription plan selection and payment', async ({ page }) => {
    // Navigate to subscription plans
    await page.goto('/subscription/plans');

    // Verify plans are displayed
    await expect(page.locator('[data-testid="subscription-plans"]')).toBeVisible();
    await expect(page.locator('[data-testid="plan-basic"]')).toBeVisible();
    await expect(page.locator('[data-testid="plan-premium"]')).toBeVisible();

    // Select premium plan
    await page.click('[data-testid="select-premium-plan"]');

    // Should redirect to checkout
    await expect(page).toHaveURL(/\/subscription\/checkout/);

    // Fill payment information (mock Stripe)
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="cardholder-name"]', 'John Doe');

    // Complete payment
    await page.click('[data-testid="complete-payment"]');

    // Should redirect to success page
    await expect(page).toHaveURL(/\/subscription\/success/);
    await expect(page.locator('[data-testid="payment-success"]')).toContainText('subscription activated');

    // Verify subscription in account settings
    await page.goto('/dashboard/settings');
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Premium');
  });

  test('should manage affiliate links', async ({ page }) => {
    await page.goto('/dashboard/affiliates');

    // Create new affiliate link
    await page.click('[data-testid="create-affiliate-link"]');
    await page.fill('[data-testid="link-name"]', 'Test Product Link');
    await page.fill('[data-testid="original-url"]', 'https://example.com/product');
    await page.selectOption('[data-testid="network-select"]', 'amazon');
    await page.fill('[data-testid="commission-rate"]', '5.5');
    await page.click('[data-testid="save-link"]');

    // Should show in affiliate links list
    await expect(page.locator('[data-testid="affiliate-links-list"]')).toContainText('Test Product Link');

    // Copy affiliate link
    await page.click('[data-testid="copy-link-button"]');
    // Verify clipboard (in real test, would check clipboard content)

    // View link analytics
    await page.click('[data-testid="view-analytics-button"]');
    await expect(page.locator('[data-testid="link-analytics"]')).toBeVisible();
    await expect(page.locator('[data-testid="click-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
  });
});

test.describe('Content Lifecycle Management', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, { email: 'creator@example.com', password: 'Password123!' });
  });

  test('should handle complete article lifecycle', async ({ page }) => {
    const articleTitle = 'Lifecycle Test Article ' + Date.now();

    // Create draft article
    await createArticle(page, {
      title: articleTitle,
      content: 'This is a test article for lifecycle management.',
      excerpt: 'Test excerpt'
    });

    // Verify draft status
    await expect(page.locator('[data-testid="article-status"]')).toContainText('Draft');

    // Edit article
    await page.click('[data-testid="edit-content"]');
    await page.fill('[data-testid="article-content"]', 'Updated content for the test article with more detailed information.');
    await page.click('[data-testid="save-changes"]');

    // Publish article
    await page.click('[data-testid="publish-button"]');
    await page.click('[data-testid="confirm-publish"]');
    await expect(page.locator('[data-testid="article-status"]')).toContainText('Published');

    // Update published article
    await page.click('[data-testid="edit-content"]');
    await page.fill('[data-testid="article-title"]', articleTitle + ' (Updated)');
    await page.click('[data-testid="save-changes"]');

    // Archive article
    await page.click('[data-testid="more-actions"]');
    await page.click('[data-testid="archive-article"]');
    await page.click('[data-testid="confirm-archive"]');
    await expect(page.locator('[data-testid="article-status"]')).toContainText('Archived');

    // Restore article
    await page.click('[data-testid="more-actions"]');
    await page.click('[data-testid="restore-article"]');
    await expect(page.locator('[data-testid="article-status"]')).toContainText('Published');
  });

  test('should handle bulk article operations', async ({ page }) => {
    await page.goto('/dashboard/articles');

    // Select multiple articles
    await page.check('[data-testid="select-article-1"]');
    await page.check('[data-testid="select-article-2"]');
    await page.check('[data-testid="select-article-3"]');

    // Bulk publish
    await page.selectOption('[data-testid="bulk-actions"]', 'publish');
    await page.click('[data-testid="apply-bulk-action"]');
    await page.click('[data-testid="confirm-bulk-action"]');

    // Verify success message
    await expect(page.locator('[data-testid="bulk-success"]')).toContainText('3 articles published');

    // Bulk add tags
    await page.check('[data-testid="select-all-articles"]');
    await page.selectOption('[data-testid="bulk-actions"]', 'add-tags');
    await page.fill('[data-testid="bulk-tags-input"]', 'bulk,update,test');
    await page.click('[data-testid="apply-bulk-action"]');

    // Verify tags were added
    await expect(page.locator('[data-testid="bulk-success"]')).toContainText('Tags added to articles');
  });
});

test.describe('Performance and User Experience', () => {
  test('should load pages within performance budget', async ({ page }) => {
    // Test homepage performance
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000); // 3 second budget

    // Verify core content loads
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="navigation"]')).toBeVisible();
  });

  test('should work offline with cached content', async ({ page, context }) => {
    // Load page while online
    await page.goto('/');
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();

    // Go offline
    await context.setOffline(true);

    // Navigate to cached page
    await page.goto('/articles/cached-article');

    // Should show offline indicator but still display content
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
  });

  test('should be responsive across device sizes', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();

    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
  });
});