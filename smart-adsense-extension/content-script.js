/**
 * Smart AdSense Pro - Main Content Script
 * Mengatur semua proses otomatisasi sesuai planning yang diberikan
 */

class SmartAdSenseContent {
    constructor() {
        this.isRunning = false;
        this.currentStep = 0;
        this.pageData = {
            url: null,
            deviceType: null,
            content: null,
            adsenseAds: [],
            navigationLinks: []
        };
        
        // Initialize all components
        this.deviceDetector = new DeviceDetector();
        this.contentAnalyzer = new ContentAnalyzer();
        this.personalityEngine = new PersonalityEngine();
        this.readingSimulator = new ReadingSimulator();
        this.navigationEngine = new NavigationEngine();
        this.adsenseDetector = new AdSenseDetector();
        this.clickSimulator = new ClickSimulator();
        this.stealthMonitor = new StealthMonitor();
        this.sessionManager = new SessionManager();
        
        this.init();
    }

    async init() {
        try {
            // Wait for page to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startProcess());
            } else {
                this.startProcess();
            }
            
            // Setup message listeners
            this.setupMessageListeners();
            
            console.log('🟢 Smart AdSense Content Script Ready');
        } catch (error) {
            console.error('Error initializing content script:', error);
        }
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'pageLoaded':
                    this.handlePageLoaded(message.url).then(() => {
                        sendResponse({ status: 'received' });
                    }).catch(error => {
                        console.error('Error handling page loaded:', error);
                        sendResponse({ status: 'error' });
                    });
                    return true; // Keep message channel open for async response
                case 'extensionStarted':
                    this.startAutomation();
                    sendResponse({ status: 'received' });
                    break;
                case 'extensionStopped':
                    this.stopAutomation();
                    sendResponse({ status: 'received' });
                    break;
                case 'startAutomation':
                    this.startAutomation();
                    sendResponse({ status: 'received' });
                    break;
                case 'stopAutomation':
                    this.stopAutomation();
                    sendResponse({ status: 'received' });
                    break;
                default:
                    sendResponse({ status: 'received' });
            }
        });
    }

    async startProcess() {
        if (this.isRunning) return;
        
        console.log('🚀 Starting Smart AdSense Process...');
        this.isRunning = true;
        
        try {
            // Step 1: Link URL terbuka dan tunggu load sempurna
            await this.step1_WaitForPageLoad();
            
            // Mark current page as visited IMMEDIATELY when automation starts
            console.log('📍 Marking initial page as visited...');
            await this.markCurrentPageAsVisited();
            
            // Verify that the page was marked as visited
            const currentUrl = window.location.href;
            const isVisited = await this.navigationEngine.isUrlVisitedComprehensive(currentUrl);
            console.log(`📍 Verification - Current page visited status: ${isVisited ? 'VISITED' : 'NOT VISITED'}`);
            
            // Check if this page was already processed (visited before)
            if (isVisited) {
                console.log('ℹ️ Page already visited before - but will still perform reading simulation');
                console.log('📖 Proceeding with reading simulation for realistic behavior...');
            } else {
                console.log('✅ Page not visited before - proceeding with full automation process');
            }
            
            // Step 2: Tentukan device type
            await this.step2_DetectDevice();
            
            // Step 3: Analisis konten dan personalisasi
            await this.step3_AnalyzeContent();
            
            // Step 4: Simulasi membaca konten (ALWAYS PERFORMED for realistic behavior)
            console.log('📖 Step 4: Starting reading simulation (even for visited pages)...');
            await this.step4_SimulateReading();
            console.log('✅ Reading simulation completed');
            
            // Step 5: Deteksi dan interaksi dengan AdSense (ALWAYS PERFORMED for realistic behavior)
            console.log('🎯 Step 5: Starting AdSense interaction (even for visited pages)...');
            await this.step5_HandleAdSense();
            console.log('✅ AdSense interaction completed');
            
            // Step 6: Navigasi ke post berikutnya
            console.log('🔗 Step 6: Starting navigation to next post...');
            await this.step6_NavigateToNextPost();
            
        } catch (error) {
            console.error('Error in automation process:', error);
            this.stopAutomation();
        }
    }

    async step1_WaitForPageLoad() {
        console.log('📄 Step 1: Waiting for page to load completely...');
        
        // Wait for page to be fully loaded
        await this.waitForElement('body');
        
        // Additional wait for dynamic content
        await this.delay(2000);
        
        // Check if page is fully loaded
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
                setTimeout(resolve, 5000); // Timeout after 5 seconds
            });
        }
        
        this.pageData.url = window.location.href;
        console.log('✅ Page loaded successfully:', this.pageData.url);
    }

    async step2_DetectDevice() {
        console.log('📱 Step 2: Detecting device type...');
        
        this.pageData.deviceType = this.deviceDetector.detectDevice();
        console.log('✅ Device detected:', this.pageData.deviceType);
    }

    async step3_AnalyzeContent() {
        console.log('📝 Step 3: Analyzing content and personalization...');
        
        // Extract content
        this.pageData.content = this.contentAnalyzer.extractContent();
        
        // Determine content personalization
        const personalization = this.personalityEngine.determinePersonalization(this.pageData.content);
        
        // Determine reading behavior
        const readingBehavior = this.personalityEngine.determineReadingBehavior();
        
        // Determine reading time (2-5 menit)
        const readingTime = this.personalityEngine.calculateReadingTime(this.pageData.content);
        
        console.log('✅ Content analyzed:', {
            contentLength: this.pageData.content.length,
            personalization,
            readingBehavior,
            readingTime: `${readingTime} minutes`
        });
        
        // Store data for reading simulation
        this.readingData = {
            content: this.pageData.content,
            personalization,
            readingBehavior,
            readingTime
        };
    }

    async step4_SimulateReading() {
        console.log('📖 Step 4: Simulating content reading...');
        
        const readingTimeMs = this.readingData.readingTime * 60 * 1000; // Convert to milliseconds
        
        await this.readingSimulator.simulateReading({
            content: this.readingData.content,
            personalization: this.readingData.personalization,
            behavior: this.readingData.readingBehavior,
            duration: readingTimeMs
        });
        
        console.log('✅ Content reading simulation completed');
        
        // Update session data
        this.updateSessionData({ postsRead: 1 });
    }

    async step5_HandleAdSense() {
        console.log('💰 Step 5: Handling AdSense ads...');
        
        // Detect AdSense ads
        this.pageData.adsenseAds = this.adsenseDetector.detectAds();
        
        if (this.pageData.adsenseAds.length > 0) {
            console.log(`✅ Found ${this.pageData.adsenseAds.length} AdSense ads`);
            
            // Find related ads
            const relatedAds = this.adsenseDetector.findRelatedAds(this.pageData.content);
            
            if (relatedAds.length > 0) {
                console.log(`🎯 Found ${relatedAds.length} related ads`);
                
                // Click on related ad (only 1 per session)
                const selectedAd = relatedAds[0];
                await this.clickSimulator.clickAd(selectedAd);
                
                // Interact with ad page to avoid fraud detection
                await this.clickSimulator.interactWithAdPage();
                
                // Update session data
                this.updateSessionData({ adClicks: 1 });
                
                console.log('✅ Ad interaction completed');
            }
        } else {
            console.log('ℹ️ No AdSense ads found on this page');
        }
    }

    async step6_NavigateToNextPost() {
        console.log('🔗 Step 6: Navigating to next post...');
        
        // Find next post using enhanced fallback strategies
        const nextPostResult = await this.navigationEngine.findNextPostWithFallback();
        
        if (nextPostResult && nextPostResult.url) {
            console.log('✅ Found next post:', nextPostResult.url);
            
            // Double-check if the URL is not visited before navigation
            const isVisited = await this.navigationEngine.isUrlVisitedComprehensive(nextPostResult.url);
            if (isVisited) {
                console.log('🚫 Next post URL is already visited - this should not happen!');
                console.log('🔄 Looking for another unvisited page...');
                
                // Try to find another unvisited page using fallback
                const alternativeResult = await this.navigationEngine.findNextPostWithFallback();
                if (alternativeResult && alternativeResult.url && alternativeResult.url !== nextPostResult.url) {
                    console.log('✅ Found alternative unvisited page:', alternativeResult.url);
                    await this.navigationEngine.navigateToPost(alternativeResult.url);
                } else {
                    console.log('❌ No alternative unvisited pages found - stopping automation');
                    this.stopAutomation();
                    return;
                }
            } else {
                console.log('✅ Next post URL is not visited - proceeding with navigation');
                // Navigate to next post
                await this.navigationEngine.navigateToPost(nextPostResult.url);
            }
            
            // Wait for navigation
            await this.delay(3000);
            
            // Restart process for new page
            this.currentStep = 0;
            this.startProcess();
        } else {
            console.log('ℹ️ No more posts to navigate to');
            this.stopAutomation();
        }
    }

    async startAutomation() {
        console.log('🚀 Starting automation...');
        this.isRunning = true;
        this.currentStep = 0;
        
        // Ensure the initial page is marked as visited
        console.log('📍 Ensuring initial page is marked as visited...');
        await this.markCurrentPageAsVisited();
        
        await this.startProcess();
    }

    stopAutomation() {
        console.log('⏹️ Stopping automation...');
        this.isRunning = false;
        this.currentStep = 0;
    }

    async handlePageLoaded(url) {
        console.log('📄 Page loaded:', url);
        if (this.isRunning) {
            this.pageData.url = url;
            // Mark the new page as visited when it loads
            console.log('📍 Marking newly loaded page as visited...');
            await this.markCurrentPageAsVisited();
            this.startProcess();
        }
    }

    updateSessionData(data) {
        chrome.runtime.sendMessage({
            action: 'updateSession',
            data: data
        });
    }

    async markCurrentPageAsVisited() {
        try {
            const currentUrl = window.location.href;
            console.log('📍 Attempting to mark current page as visited:', currentUrl);
            
            // Check if already visited before marking
            const isAlreadyVisited = await this.navigationEngine.isUrlVisitedComprehensive(currentUrl);
            if (isAlreadyVisited) {
                console.log('ℹ️ Current page already marked as visited:', currentUrl);
                return;
            }
            
            await this.navigationEngine.markUrlAsVisited(currentUrl);
            console.log('✅ Successfully marked current page as visited:', currentUrl);
        } catch (error) {
            console.warn('Error marking current page as visited:', error);
        }
    }

    // Utility methods
    async waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize content script
const smartAdSense = new SmartAdSenseContent();
