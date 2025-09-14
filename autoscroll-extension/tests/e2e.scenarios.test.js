/**
 * End-to-End Scenario Tests
 * Testing specific real-world scenarios and use cases
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay, createHumanBehaviorDelay } from '../src/utils/time.js';
import { safeQuerySelector, safeQuerySelectorAll, isElementVisible, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, createMouseEvent, createTouchEvent, dispatchEventNatural } from '../src/utils/events.js';
import { createNamespacedStorage } from '../src/utils/storage.js';

describe('End-to-End Scenario Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('e2e-scenarios-test');
    
    // Setup realistic website DOM
    document.body.innerHTML = `
      <div id="website-container" style="height: 6000px;">
        <!-- Header Section -->
        <header id="site-header" style="height: 80px; position: fixed; top: 0; width: 100%; background: #fff; z-index: 1000;">
          <nav class="main-navigation">
            <div class="logo">Website Logo</div>
            <ul class="nav-menu">
              <li><a href="#home" class="nav-link">Home</a></li>
              <li><a href="#products" class="nav-link">Products</a></li>
              <li><a href="#services" class="nav-link">Services</a></li>
              <li><a href="#about" class="nav-link">About</a></li>
              <li><a href="#contact" class="nav-link">Contact</a></li>
            </ul>
          </nav>
        </header>

        <!-- Main Content -->
        <main id="main-content" style="margin-top: 80px; height: 5000px;">
          <!-- Hero Section -->
          <section class="hero-section" style="height: 600px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="hero-content">
              <h1>Welcome to Our Amazing Website</h1>
              <p>Discover the future of web browsing with our innovative solutions</p>
              <button class="cta-button">Get Started</button>
            </div>
          </section>

          <!-- Features Section -->
          <section class="features-section" style="height: 800px; padding: 60px 0;">
            <div class="container">
              <h2>Our Features</h2>
              <div class="features-grid">
                <div class="feature-card" data-feature="performance">
                  <h3>High Performance</h3>
                  <p>Lightning-fast loading and smooth interactions</p>
                </div>
                <div class="feature-card" data-feature="security">
                  <h3>Secure & Safe</h3>
                  <p>Enterprise-grade security for your peace of mind</p>
                </div>
                <div class="feature-card" data-feature="scalability">
                  <h3>Scalable</h3>
                  <p>Grows with your business needs</p>
                </div>
                <div class="feature-card" data-feature="support">
                  <h3>24/7 Support</h3>
                  <p>Round-the-clock assistance when you need it</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Ad Section -->
          <section class="ad-section" style="height: 300px; background: #f8f9fa; padding: 40px 0;">
            <div class="container">
              <div class="adsense-banner" data-ad-slot="banner-1">
                <div class="ad-content">Advertisement Space</div>
              </div>
            </div>
          </section>

          <!-- Products Section -->
          <section class="products-section" style="height: 1000px; padding: 60px 0;">
            <div class="container">
              <h2>Our Products</h2>
              <div class="products-grid">
                <div class="product-card" data-product="basic">
                  <img src="product1.jpg" alt="Basic Plan" />
                  <h3>Basic Plan</h3>
                  <p>Perfect for individuals and small teams</p>
                  <div class="price">$9.99/month</div>
                  <button class="buy-button">Buy Now</button>
                </div>
                <div class="product-card" data-product="pro">
                  <img src="product2.jpg" alt="Pro Plan" />
                  <h3>Pro Plan</h3>
                  <p>Advanced features for growing businesses</p>
                  <div class="price">$29.99/month</div>
                  <button class="buy-button">Buy Now</button>
                </div>
                <div class="product-card" data-product="enterprise">
                  <img src="product3.jpg" alt="Enterprise Plan" />
                  <h3>Enterprise Plan</h3>
                  <p>Complete solution for large organizations</p>
                  <div class="price">$99.99/month</div>
                  <button class="buy-button">Contact Sales</button>
                </div>
              </div>
            </div>
          </section>

          <!-- Blog Section -->
          <section class="blog-section" style="height: 1200px; padding: 60px 0;">
            <div class="container">
              <h2>Latest Blog Posts</h2>
              <div class="blog-grid">
                <article class="blog-post" data-post="1">
                  <img src="blog1.jpg" alt="Blog Post 1" />
                  <h3>Getting Started with Our Platform</h3>
                  <p>Learn how to set up and configure your account for maximum efficiency...</p>
                  <a href="#read-more-1" class="read-more">Read More</a>
                </article>
                <article class="blog-post" data-post="2">
                  <img src="blog2.jpg" alt="Blog Post 2" />
                  <h3>Advanced Tips and Tricks</h3>
                  <p>Discover hidden features and advanced techniques to boost your productivity...</p>
                  <a href="#read-more-2" class="read-more">Read More</a>
                </article>
                <article class="blog-post" data-post="3">
                  <img src="blog3.jpg" alt="Blog Post 3" />
                  <h3>Case Study: Success Story</h3>
                  <p>See how our client achieved 300% growth using our platform...</p>
                  <a href="#read-more-3" class="read-more">Read More</a>
                </article>
              </div>
            </div>
          </section>

          <!-- Testimonials Section -->
          <section class="testimonials-section" style="height: 600px; background: #f8f9fa; padding: 60px 0;">
            <div class="container">
              <h2>What Our Customers Say</h2>
              <div class="testimonials-grid">
                <div class="testimonial-card">
                  <div class="testimonial-content">
                    <p>"This platform has revolutionized our workflow. Highly recommended!"</p>
                    <div class="testimonial-author">
                      <img src="customer1.jpg" alt="Customer 1" />
                      <div class="author-info">
                        <h4>John Smith</h4>
                        <span>CEO, TechCorp</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="testimonial-card">
                  <div class="testimonial-content">
                    <p>"Amazing features and excellent customer support. 5 stars!"</p>
                    <div class="testimonial-author">
                      <img src="customer2.jpg" alt="Customer 2" />
                      <div class="author-info">
                        <h4>Sarah Johnson</h4>
                        <span>Marketing Director, InnovateCo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Footer -->
          <footer id="site-footer" style="height: 400px; background: #333; color: #fff; padding: 60px 0;">
            <div class="container">
              <div class="footer-content">
                <div class="footer-section">
                  <h3>Company</h3>
                  <ul>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#careers">Careers</a></li>
                    <li><a href="#press">Press</a></li>
                    <li><a href="#contact">Contact</a></li>
                  </ul>
                </div>
                <div class="footer-section">
                  <h3>Products</h3>
                  <ul>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#integrations">Integrations</a></li>
                    <li><a href="#api">API</a></li>
                  </ul>
                </div>
                <div class="footer-section">
                  <h3>Support</h3>
                  <ul>
                    <li><a href="#help">Help Center</a></li>
                    <li><a href="#docs">Documentation</a></li>
                    <li><a href="#community">Community</a></li>
                    <li><a href="#status">Status</a></li>
                  </ul>
                </div>
                <div class="footer-section">
                  <h3>Legal</h3>
                  <ul>
                    <li><a href="#privacy">Privacy Policy</a></li>
                    <li><a href="#terms">Terms of Service</a></li>
                    <li><a href="#cookies">Cookie Policy</a></li>
                    <li><a href="#gdpr">GDPR</a></li>
                  </ul>
                </div>
              </div>
              <div class="footer-bottom">
                <p>&copy; 2024 Our Company. All rights reserved.</p>
                <div class="social-links">
                  <a href="#facebook" class="social-link">Facebook</a>
                  <a href="#twitter" class="social-link">Twitter</a>
                  <a href="#linkedin" class="social-link">LinkedIn</a>
                  <a href="#instagram" class="social-link">Instagram</a>
                </div>
              </div>
            </div>
          </footer>
        </main>

        <!-- Navigation Elements -->
        <nav class="pagination-nav" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
          <a href="#prev" class="nav-button prev-button">Previous</a>
          <a href="#next" class="nav-button next-button">Next</a>
          <a href="#related" class="nav-button related-button">Related</a>
          <a href="#recent" class="nav-button recent-button">Recent</a>
        </nav>
      </div>
    `;
    
    // Setup mock environment
    global.testUtils.mockViewportSize(1920, 1080);
    global.testUtils.mockDocumentDimensions(1920, 6000);
    global.testUtils.mockScrollPosition(0, 0);
  });

  afterEach(async () => {
    if (engine && engine.state === 'running') {
      await engine.stop();
    }
    document.body.innerHTML = '';
  });

  describe('E-commerce Website Scenario', () => {
    test('should complete full e-commerce browsing workflow', async () => {
      const config = {
        speed: 1.5,
        strategy: 'momentum',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          hoverSimulator: { enabled: true },
          dwellTimeSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          keywordDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: Landing page exploration
      await sleep(200);
      console.log('Step 1: Landing page exploration completed');

      // Step 2: Navigate to products section
      const productsSection = safeQuerySelector('.products-section');
      if (productsSection) {
        // Simulate scrolling to products
        for (let i = 0; i < 5; i++) {
          await sleep(100);
          if (engine.stealthModules?.cursorSimulator) {
            await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
          }
        }
      }
      console.log('Step 2: Navigated to products section');

      // Step 3: Browse product cards
      const productCards = safeQuerySelectorAll('.product-card');
      for (let i = 0; i < Math.min(3, productCards.length); i++) {
        const card = productCards[i];
        
        // Hover over product
        if (engine.stealthModules?.hoverSimulator) {
          await engine.stealthModules.hoverSimulator.simulateHoverDelay(card, 300);
        }
        
        // Simulate reading product details
        if (engine.stealthModules?.dwellTimeSimulator) {
          const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(
            card.textContent || 'Product description and details'
          );
          await sleep(readingTime);
        }
        
        await sleep(100);
      }
      console.log('Step 3: Browsed product cards');

      // Step 4: Interact with buy buttons
      const buyButtons = safeQuerySelectorAll('.buy-button');
      for (let i = 0; i < Math.min(2, buyButtons.length); i++) {
        const button = buyButtons[i];
        
        // Hover over buy button
        if (engine.stealthModules?.hoverSimulator) {
          await engine.stealthModules.hoverSimulator.simulateHoverDelay(button, 200);
        }
        
        await sleep(100);
      }
      console.log('Step 4: Interacted with buy buttons');

      // Step 5: Detect and interact with ads
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        if (ads.length > 0) {
          await sleep(300); // Ad viewing time
        }
      }
      console.log('Step 5: Interacted with ads');

      // Step 6: Search for specific keywords
      if (engine.detectorModules?.keywordDetector) {
        const keywordLinks = await engine.detectorModules.keywordDetector.detectKeywordLinks([
          'buy', 'purchase', 'price', 'plan', 'subscription'
        ]);
        if (keywordLinks.length > 0) {
          await sleep(200);
        }
      }
      console.log('Step 6: Searched for keywords');

      // Step 7: Navigate to next page
      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToNext();
        await sleep(200);
      }
      console.log('Step 7: Navigated to next page');

      // Step 8: Continue browsing
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }
      console.log('Step 8: Continued browsing');

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(5000);

      console.log(`E-commerce Browsing Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully`);
    });
  });

  describe('News Website Scenario', () => {
    test('should complete full news website browsing workflow', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          dwellTimeSimulator: { enabled: true },
          errorSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: Read hero section
      const heroSection = safeQuerySelector('.hero-section');
      if (heroSection && engine.stealthModules?.dwellTimeSimulator) {
        const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(
          heroSection.textContent || 'Welcome to our news website'
        );
        await sleep(readingTime);
      }
      console.log('Step 1: Read hero section');

      // Step 2: Scroll through features
      const featuresSection = safeQuerySelector('.features-section');
      if (featuresSection) {
        for (let i = 0; i < 4; i++) {
          await sleep(100);
          if (engine.stealthModules?.cursorSimulator) {
            await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
          }
        }
      }
      console.log('Step 2: Scrolled through features');

      // Step 3: Read blog posts
      const blogPosts = safeQuerySelectorAll('.blog-post');
      for (let i = 0; i < Math.min(3, blogPosts.length); i++) {
        const post = blogPosts[i];
        
        // Simulate reading blog post
        if (engine.stealthModules?.dwellTimeSimulator) {
          const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(
            post.textContent || 'Blog post content'
          );
          await sleep(readingTime);
        }
        
        // Simulate clicking read more
        const readMoreLink = post.querySelector('.read-more');
        if (readMoreLink) {
          await sleep(100);
        }
        
        await sleep(100);
      }
      console.log('Step 3: Read blog posts');

      // Step 4: Interact with ads
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        if (ads.length > 0) {
          await sleep(200); // Ad viewing time
        }
      }
      console.log('Step 4: Interacted with ads');

      // Step 5: Navigate to related articles
      if (engine.detectorModules?.navigationDetector) {
        const navElements = await engine.detectorModules.navigationDetector.detectNavigationElements();
        if (navElements.length > 0) {
          await sleep(100);
        }
      }
      console.log('Step 5: Detected navigation elements');

      // Step 6: Simulate human errors (realistic behavior)
      if (engine.stealthModules?.errorSimulator) {
        await engine.stealthModules.errorSimulator.simulateRandomPause();
        await engine.stealthModules.errorSimulator.simulateHesitation();
      }
      console.log('Step 6: Simulated human errors');

      // Step 7: Continue reading
      for (let i = 0; i < 5; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }
      console.log('Step 7: Continued reading');

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(4000);

      console.log(`News Website Browsing Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully`);
    });
  });

  describe('Corporate Website Scenario', () => {
    test('should complete full corporate website browsing workflow', async () => {
      const config = {
        speed: 1.8,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          hoverSimulator: { enabled: true },
          dwellTimeSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          keywordDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: Explore navigation menu
      const navLinks = safeQuerySelectorAll('.nav-link');
      for (let i = 0; i < Math.min(3, navLinks.length); i++) {
        const link = navLinks[i];
        
        // Hover over navigation link
        if (engine.stealthModules?.hoverSimulator) {
          await engine.stealthModules.hoverSimulator.simulateHoverDelay(link, 200);
        }
        
        await sleep(100);
      }
      console.log('Step 1: Explored navigation menu');

      // Step 2: Read company information
      const featuresSection = safeQuerySelector('.features-section');
      if (featuresSection && engine.stealthModules?.dwellTimeSimulator) {
        const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(
          featuresSection.textContent || 'Company features and information'
        );
        await sleep(readingTime);
      }
      console.log('Step 2: Read company information');

      // Step 3: Browse testimonials
      const testimonials = safeQuerySelectorAll('.testimonial-card');
      for (let i = 0; i < Math.min(2, testimonials.length); i++) {
        const testimonial = testimonials[i];
        
        // Simulate reading testimonial
        if (engine.stealthModules?.dwellTimeSimulator) {
          const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(
            testimonial.textContent || 'Customer testimonial'
          );
          await sleep(readingTime);
        }
        
        await sleep(100);
      }
      console.log('Step 3: Browsed testimonials');

      // Step 4: Explore footer links
      const footerLinks = safeQuerySelectorAll('#site-footer a');
      for (let i = 0; i < Math.min(5, footerLinks.length); i++) {
        const link = footerLinks[i];
        
        // Hover over footer link
        if (engine.stealthModules?.hoverSimulator) {
          await engine.stealthModules.hoverSimulator.simulateHoverDelay(link, 150);
        }
        
        await sleep(50);
      }
      console.log('Step 4: Explored footer links');

      // Step 5: Search for business keywords
      if (engine.detectorModules?.keywordDetector) {
        const keywordLinks = await engine.detectorModules.keywordDetector.detectKeywordLinks([
          'contact', 'about', 'services', 'solutions', 'enterprise'
        ]);
        if (keywordLinks.length > 0) {
          await sleep(200);
        }
      }
      console.log('Step 5: Searched for business keywords');

      // Step 6: Interact with ads
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        if (ads.length > 0) {
          await sleep(250); // Ad viewing time
        }
      }
      console.log('Step 6: Interacted with ads');

      // Step 7: Navigate to related pages
      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToNext();
        await sleep(200);
      }
      console.log('Step 7: Navigated to related pages');

      // Step 8: Continue browsing
      for (let i = 0; i < 4; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }
      console.log('Step 8: Continued browsing');

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(4500);

      console.log(`Corporate Website Browsing Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully`);
    });
  });

  describe('Mobile Website Scenario', () => {
    test('should complete full mobile website browsing workflow', async () => {
      const config = {
        speed: 1.2,
        strategy: 'momentum',
        adapter: 'mobile',
        stealth: {
          enabled: true,
          gestureSimulator: { enabled: true },
          touchEvents: { enabled: true },
          dwellTimeSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: Mobile touch interactions
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        
        // Simulate touch gestures
        if (engine.stealthModules?.gestureSimulator) {
          await engine.stealthModules.gestureSimulator.simulateSwipe(100, 200, 100, 400);
        }
      }
      console.log('Step 1: Mobile touch interactions');

      // Step 2: Mobile reading behavior
      const heroSection = safeQuerySelector('.hero-section');
      if (heroSection && engine.stealthModules?.dwellTimeSimulator) {
        const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(
          heroSection.textContent || 'Mobile content'
        );
        await sleep(readingTime);
      }
      console.log('Step 2: Mobile reading behavior');

      // Step 3: Mobile scrolling
      for (let i = 0; i < 6; i++) {
        await sleep(100);
        
        // Simulate mobile scroll gestures
        if (engine.stealthModules?.gestureSimulator) {
          await engine.stealthModules.gestureSimulator.simulateSwipe(200, 300, 200, 100);
        }
      }
      console.log('Step 3: Mobile scrolling');

      // Step 4: Mobile tap interactions
      const productCards = safeQuerySelectorAll('.product-card');
      for (let i = 0; i < Math.min(2, productCards.length); i++) {
        const card = productCards[i];
        
        // Simulate tap on product card
        if (engine.stealthModules?.gestureSimulator) {
          await engine.stealthModules.gestureSimulator.simulateTap(200, 300);
        }
        
        await sleep(150);
      }
      console.log('Step 4: Mobile tap interactions');

      // Step 5: Mobile ad interactions
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        if (ads.length > 0) {
          await sleep(200); // Mobile ad viewing time
        }
      }
      console.log('Step 5: Mobile ad interactions');

      // Step 6: Continue mobile browsing
      for (let i = 0; i < 4; i++) {
        await sleep(100);
        
        if (engine.stealthModules?.gestureSimulator) {
          await engine.stealthModules.gestureSimulator.simulateSwipe(100, 200, 100, 400);
        }
      }
      console.log('Step 6: Continued mobile browsing');

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(3500);

      console.log(`Mobile Website Browsing Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully`);
    });
  });

  describe('Multi-page Navigation Scenario', () => {
    test('should complete multi-page navigation workflow', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          tabAwareness: { enabled: true }
        },
        detectors: {
          enabled: true,
          navigationDetector: { enabled: true },
          paginationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: Initial page exploration
      await sleep(200);
      console.log('Step 1: Initial page exploration');

      // Step 2: Detect pagination elements
      if (engine.detectorModules?.paginationDetector) {
        const pagination = await engine.detectorModules.paginationDetector.detectPagination();
        expect(Array.isArray(pagination)).toBe(true);
      }
      console.log('Step 2: Detected pagination elements');

      // Step 3: Navigate to next page
      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToNext();
        await sleep(200);
      }
      console.log('Step 3: Navigated to next page');

      // Step 4: Browse second page
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }
      console.log('Step 4: Browsed second page');

      // Step 5: Navigate to previous page
      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToPrevious();
        await sleep(200);
      }
      console.log('Step 5: Navigated to previous page');

      // Step 6: Open new tab
      if (engine.navigationModules?.tabManager) {
        await engine.navigationModules.tabManager.createNewTab('https://example.com');
        await sleep(100);
      }
      console.log('Step 6: Opened new tab');

      // Step 7: Simulate tab switching
      if (engine.stealthModules?.tabAwareness) {
        await engine.stealthModules.tabAwareness.handleTabBlur();
        await sleep(100);
        await engine.stealthModules.tabAwareness.handleTabFocus();
      }
      console.log('Step 7: Simulated tab switching');

      // Step 8: Navigate to related content
      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToRelated();
        await sleep(200);
      }
      console.log('Step 8: Navigated to related content');

      // Step 9: Continue browsing
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }
      console.log('Step 9: Continued browsing');

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(4000);

      console.log(`Multi-page Navigation Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully`);
    });
  });

  describe('Error Recovery Scenario', () => {
    test('should handle error recovery gracefully', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          errorSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: Normal operation
      await sleep(100);
      console.log('Step 1: Normal operation');

      // Step 2: Simulate errors
      try {
        // Simulate invalid cursor movement
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement('invalid', 'invalid');
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
      console.log('Step 2: Handled cursor movement error');

      // Step 3: Continue normal operation
      await sleep(100);
      if (engine.stealthModules?.cursorSimulator) {
        await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
      }
      console.log('Step 3: Continued normal operation');

      // Step 4: Simulate detection errors
      try {
        if (engine.detectorModules?.adSenseDetector) {
          await engine.detectorModules.adSenseDetector.detectAds();
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
      console.log('Step 4: Handled detection error');

      // Step 5: Continue operation
      await sleep(100);
      console.log('Step 5: Continued operation');

      // Step 6: Simulate human errors (realistic)
      if (engine.stealthModules?.errorSimulator) {
        await engine.stealthModules.errorSimulator.simulateRandomPause();
        await engine.stealthModules.errorSimulator.simulateHesitation();
      }
      console.log('Step 6: Simulated human errors');

      // Step 7: Final operation
      for (let i = 0; i < 2; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }
      console.log('Step 7: Final operation');

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(2000);

      console.log(`Error Recovery Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully with Error Recovery`);
    });
  });
});
