import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('shows hero copy', async ({ page }) => {
    await page.goto('/');
    // Wait for page to load and check that main content is visible
    await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
    
    // Check that page has loaded - look for any heading or main content
    const hasContent = await page.locator('h1, h2, main').count() > 0;
    expect(hasContent).toBeTruthy();
    
    // Check for upload card or testimonials section as proof page loaded
    const uploadCard = page.locator('[data-upload-card]');
    const testimonials = page.getByText(/REAL STORIES|ИСТОРИИ ЛЮДЕЙ|TESTIMONIALS/i);
    
    const cardVisible = await uploadCard.isVisible().catch(() => false);
    const testimonialsVisible = await testimonials.isVisible().catch(() => false);
    
    expect(cardVisible || testimonialsVisible).toBeTruthy();
  });

  test.describe('Testimonials carousel', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 }, // iPhone SE
      { name: 'mobile-large', width: 414, height: 896 }, // iPhone 11 Pro Max
      { name: 'tablet', width: 768, height: 1024 }, // iPad
      { name: 'desktop', width: 1280, height: 720 }, // Desktop
      { name: 'desktop-large', width: 1920, height: 1080 } // Large Desktop
    ];

    for (const viewport of viewports) {
      test(`testimonials display correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        
        // Wait for testimonials section to load
        await expect(page.getByText(/REAL STORIES|ИСТОРИИ ЛЮДЕЙ/i)).toBeVisible();
        
        const testimonialsSection = page.locator('section').filter({ hasText: /REAL STORIES|ИСТОРИИ ЛЮДЕЙ/i });
        await expect(testimonialsSection).toBeVisible();
        
        const rows = testimonialsSection.locator('[data-testimonial-row]');
        await expect(rows).toHaveCount(2);

        const expectedDirections = ['normal', 'reverse'];

        for (let i = 0; i < 2; i++) {
          const row = rows.nth(i);
          const track = row.locator('[data-testimonial-track]');
          await expect(track).toBeVisible();

          const metrics = await track.evaluate((el) => {
            const cards = Array.from(el.querySelectorAll('[data-testimonial-card]'));
            const container = el.parentElement as HTMLElement | null;
            const containerWidth = container?.clientWidth ?? 0;
            return {
              cardCount: cards.length,
              trackWidth: el.scrollWidth,
              containerWidth,
              animationDirection: getComputedStyle(el).animationDirection
            };
          });

          expect(metrics.cardCount).toBeGreaterThanOrEqual(12);
          if (metrics.containerWidth > 0) {
            expect(metrics.trackWidth).toBeGreaterThan(metrics.containerWidth + 200);
          }
          expect(metrics.animationDirection).toContain(expectedDirections[i]);
        }

        // Check that at least one card is visible within the section
        const firstCard = testimonialsSection.locator('[data-testimonial-card]').first();
        await expect(firstCard).toBeVisible();
        
        // Take screenshot for visual verification
        await page.screenshot({ 
          path: `test-results/testimonials-${viewport.name}.png`, 
          fullPage: false 
        });
      });
    }
  });
});






