/**
 * Behavior Simulator - Simulates human-like browsing behavior
 * Implements mouse movement, scrolling, reading, and navigation patterns
 */

class BehaviorSimulator {
    constructor(personalityEngine) {
        this.personalityEngine = personalityEngine;
        this.currentPersonality = null;
        this.mousePosition = { x: 0, y: 0 };
        this.scrollPosition = 0;
        this.isSimulating = false;
        this.deviceType = this.detectDeviceType();
        
        this.behaviorConfig = {
            mouseMovement: {
                enabled: true,
                naturalCurves: true,
                acceleration: true,
                hoverEffects: true
            },
            scrolling: {
                enabled: true,
                variableSpeed: true,
                pauseAtContent: true,
                smoothScrolling: true
            },
            reading: {
                enabled: true,
                variableSpeed: true,
                textSelection: true,
                comprehension: true
            },
            navigation: {
                enabled: true,
                intelligentLinks: true,
                backForward: true,
                tabSwitching: true
            },
            device: {
                type: this.deviceType,
                viewport: this.getViewportInfo(),
                touchCapable: this.isTouchCapable(),
                orientation: this.getOrientation()
            }
        };
        
        // Initialize stealth delay system
        this.stealthDelay = new (window._stealth_delay || StealthDelay)();
    }

    /**
     * Detect device type based on user agent and screen size
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Mobile detection
        if (/android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
            if (/ipad/i.test(userAgent) || (screenWidth >= 768 && screenHeight >= 1024)) {
                return 'tablet';
            } else {
                return 'mobile';
            }
        }

        // Tablet detection by screen size
        if (screenWidth >= 768 && screenHeight >= 1024) {
            return 'tablet';
        }

        // Desktop detection
        if (screenWidth >= 1024) {
            return 'desktop';
        }

        // Fallback based on viewport
        if (viewportWidth >= 768) {
            return 'tablet';
        } else if (viewportWidth >= 480) {
            return 'mobile';
        } else {
            return 'desktop';
        }
    }

    /**
     * Get viewport information
     */
    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: this.getOrientation()
        };
    }

    /**
     * Check if device is touch capable
     */
    isTouchCapable() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }

    /**
     * Get device orientation
     */
    getOrientation() {
        if (window.innerHeight > window.innerWidth) {
            return 'portrait';
        } else {
            return 'landscape';
        }
    }

    /**
     * Initialize behavior simulator with personality
     */
    async initialize() {
        this.currentPersonality = await this.personalityEngine.loadPersonality();
        if (!this.currentPersonality) {
            this.currentPersonality = this.personalityEngine.generateUserPersonality();
        }
        
        this.updateBehaviorConfig();
        return this.currentPersonality;
    }

    /**
     * Update behavior configuration based on personality and device
     */
    updateBehaviorConfig() {
        if (!this.currentPersonality) return;

        const personality = this.currentPersonality;
        const patterns = this.personalityEngine.getBehaviorPatterns();
        const deviceBehavior = this.getDeviceSpecificBehavior();

        // Adjust mouse movement based on personality and device
        this.behaviorConfig.mouseMovement.speed = patterns.mouseMovement.speed;
        this.behaviorConfig.mouseMovement.precision = patterns.mouseMovement.precision;
        this.behaviorConfig.mouseMovement.pattern = deviceBehavior.scrollPattern;

        // Adjust scrolling based on personality and device
        this.behaviorConfig.scrolling.speed = patterns.scrolling.speed;
        this.behaviorConfig.scrolling.pauseFrequency = patterns.scrolling.pauseFrequency;
        this.behaviorConfig.scrolling.pattern = deviceBehavior.scrollPattern;

        // Adjust reading based on personality and device
        this.behaviorConfig.reading.speed = patterns.reading.speed;
        this.behaviorConfig.reading.comprehension = patterns.reading.comprehension;
        this.behaviorConfig.reading.typingSpeed = deviceBehavior.typingSpeed;

        // Adjust navigation based on device
        this.behaviorConfig.navigation.hoverProbability = deviceBehavior.hoverProbability;
        this.behaviorConfig.navigation.viewportBehavior = deviceBehavior.viewportBehavior;
    }

    /**
     * Get device-specific behavior patterns
     */
    getDeviceSpecificBehavior() {
        const deviceBehaviors = {
            "mobile": {
                scrollPattern: "touch_scroll",
                clickPattern: "touch_tap",
                viewportBehavior: "mobile_viewport",
                typingSpeed: "slow",
                hoverProbability: 0.1, // Less hovering on mobile
                pageDwellTime: { min: 15, max: 120 },
                maxPages: 4,
                scrollSpeed: 0.8,
                pauseFrequency: 0.4
            },
            "tablet": {
                scrollPattern: "touch_scroll",
                clickPattern: "touch_tap",
                viewportBehavior: "tablet_viewport",
                typingSpeed: "medium",
                hoverProbability: 0.2,
                pageDwellTime: { min: 20, max: 180 },
                maxPages: 6,
                scrollSpeed: 0.9,
                pauseFrequency: 0.3
            },
            "desktop": {
                scrollPattern: "mouse_scroll",
                clickPattern: "mouse_click",
                viewportBehavior: "desktop_viewport",
                typingSpeed: "fast",
                hoverProbability: 0.4,
                pageDwellTime: { min: 30, max: 300 },
                maxPages: 8,
                scrollSpeed: 1.0,
                pauseFrequency: 0.2
            }
        };

        return deviceBehaviors[this.deviceType] || deviceBehaviors["desktop"];
    }

    /**
     * Simulate natural mouse movement
     */
    async simulateMouseMovement(targetX, targetY, duration = 1000) {
        if (!this.behaviorConfig.mouseMovement.enabled) {
            this.mousePosition = { x: targetX, y: targetY };
            return;
        }

        const startX = this.mousePosition.x;
        const startY = this.mousePosition.y;
        const steps = Math.floor(duration / 16); // 60fps
        const personality = this.currentPersonality;

        // Generate natural curve path
        const path = this.generateNaturalCurve(startX, startY, targetX, targetY, steps);
        
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            
            // Create mouse move event
            const moveEvent = new MouseEvent('mousemove', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: point.x,
                clientY: point.y
            });

            document.dispatchEvent(moveEvent);
            this.mousePosition = { x: point.x, y: point.y };

            // Variable delay based on personality
            const delay = this.getMouseMovementDelay(personality);
            await this.delay(delay);
        }
    }

    /**
     * Generate natural curve path for mouse movement
     */
    generateNaturalCurve(startX, startY, endX, endY, steps) {
        const path = [];
        const personality = this.currentPersonality;
        
        // Add some randomness to the path
        const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 50;
        const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 50;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            
            // Quadratic Bezier curve for natural movement
            const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + Math.pow(t, 2) * endX;
            const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + Math.pow(t, 2) * endY;

            // Add slight jitter for realism
            const jitterX = (Math.random() - 0.5) * 2;
            const jitterY = (Math.random() - 0.5) * 2;

            path.push({
                x: Math.round(x + jitterX),
                y: Math.round(y + jitterY)
            });
        }

        return path;
    }

    /**
     * Get mouse movement delay based on personality
     */
    getMouseMovementDelay(personality) {
        const baseDelay = 16; // 60fps
        
        switch (personality.type) {
            case 'casual':
                return baseDelay * 0.7; // Faster movement
            case 'researcher':
                return baseDelay * 1.5; // Slower, more deliberate
            case 'professional':
                return baseDelay * 1.2; // Moderate speed
            case 'explorer':
                return baseDelay * 0.9; // Slightly faster
            default:
                return baseDelay;
        }
    }

    /**
     * Simulate natural scrolling with comprehensive patterns (matching Python Selenium)
     */
    async simulateNaturalScrolling(targetScrollY, duration = 2000, contentType = 'general') {
        if (!this.behaviorConfig.scrolling.enabled) {
            window.scrollTo(0, targetScrollY);
            return;
        }

        const personality = this.currentPersonality;
        const scrollConfig = this.getScrollConfig(contentType, personality);
        const deviceBehavior = this.getDeviceSpecificBehavior();
        
        // Get page dimensions
        const pageHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        const startScrollY = window.pageYOffset;
        const scrollDistance = targetScrollY - startScrollY;

        // Apply device-specific adjustments
        const adjustedScrollConfig = this.applyDeviceSpecificScrollAdjustments(scrollConfig, deviceBehavior);

        if (pageHeight > viewportHeight) {
            await this.simulateComprehensiveScrollPattern(scrollDistance, adjustedScrollConfig, personality);
        } else {
            // Simple scroll for short pages
            await this.simulateSimpleScroll(targetScrollY, duration);
        }
    }

    /**
     * Apply device-specific adjustments to scroll configuration
     */
    applyDeviceSpecificScrollAdjustments(scrollConfig, deviceBehavior) {
        const adjustedConfig = { ...scrollConfig };

        // Adjust scroll speed based on device
        adjustedConfig.speedMultiplier *= deviceBehavior.scrollSpeed;

        // Adjust pause frequency based on device
        adjustedConfig.thoroughnessMultiplier *= deviceBehavior.pauseFrequency;

        // Adjust pattern based on device type
        if (this.deviceType === 'mobile') {
            adjustedConfig.pattern = 'touch_scroll';
            adjustedConfig.scrollStep = Math.floor(adjustedConfig.scrollStep * 0.8); // Smaller steps on mobile
        } else if (this.deviceType === 'tablet') {
            adjustedConfig.pattern = 'touch_scroll';
            adjustedConfig.scrollStep = Math.floor(adjustedConfig.scrollStep * 0.9);
        } else {
            adjustedConfig.pattern = 'mouse_scroll';
        }

        return adjustedConfig;
    }

    /**
     * Get scroll configuration based on content type and personality
     */
    getScrollConfig(contentType, personality) {
        // Base scroll adjustments by content type
        const contentTypeConfigs = {
            "news": { speed: "fast", thoroughness: "medium", pattern: "linear" },
            "blog": { speed: "medium", thoroughness: "high", pattern: "exploratory" },
            "technology": { speed: "slow", thoroughness: "high", pattern: "careful" },
            "business": { speed: "medium", thoroughness: "medium", pattern: "efficient" },
            "product": { speed: "fast", thoroughness: "low", pattern: "scanning" },
            "entertainment": { speed: "fast", thoroughness: "low", pattern: "casual" },
            "general": { speed: "medium", thoroughness: "medium", pattern: "balanced" }
        };

        const baseConfig = contentTypeConfigs[contentType] || contentTypeConfigs["general"];

        // Personality adjustments
        const personalityAdjustments = {
            "explorer": { speedMult: 1.2, thoroughnessMult: 0.8, pattern: "exploratory" },
            "researcher": { speedMult: 0.7, thoroughnessMult: 1.3, pattern: "careful" },
            "casual": { speedMult: 1.0, thoroughnessMult: 0.9, pattern: "casual" },
            "professional": { speedMult: 1.1, thoroughnessMult: 1.1, pattern: "efficient" }
        };

        const personalityConfig = personalityAdjustments[personality.type] || personalityAdjustments["casual"];

        return {
            speed: baseConfig.speed,
            thoroughness: baseConfig.thoroughness,
            pattern: personalityConfig.pattern,
            speedMultiplier: personalityConfig.speedMult,
            thoroughnessMultiplier: personalityConfig.thoroughnessMult
        };
    }

    /**
     * Simulate comprehensive scroll pattern with real-time ad detection
     */
    async simulateComprehensiveScrollPattern(totalDistance, config, personality) {
        const baseStep = Math.random() * 250 + 150; // 150-400px base step
        const speedAdjustments = { fast: 0.6, medium: 1.0, slow: 1.5 };
        const speedAdj = speedAdjustments[config.speed] * config.speedMultiplier;
        const scrollStep = Math.floor(baseStep * speedAdj);

        // Calculate number of scroll actions
        let numScrolls = Math.max(3, Math.floor(totalDistance / scrollStep));
        
        // Adjust based on thoroughness
        if (config.thoroughness === "high") {
            numScrolls = Math.floor(numScrolls * 1.5);
        } else if (config.thoroughness === "low") {
            numScrolls = Math.floor(numScrolls * 0.7);
        }

        let currentPosition = window.pageYOffset;
        const detectedAds = new Set();
        const adInteractions = [];

        // Stealth logging - removed for security

        for (let i = 0; i < numScrolls; i++) {
            // Calculate scroll amount based on pattern
            const scrollAmount = this.calculatePatternScrollAmount(
                i, numScrolls, scrollStep, config.pattern, currentPosition, totalDistance
            );

            // Apply scroll
            currentPosition += scrollAmount;
            currentPosition = Math.min(currentPosition, totalDistance);

            // Stealth logging - removed for security

            // Smooth scroll to position
            window.scrollTo({ top: currentPosition, behavior: 'smooth' });

            // Real-time ad detection during scroll
            await this.delay(1000);
            const newAds = await this.detectNewAdsInViewport(detectedAds);
            
            if (newAds.length > 0) {
                // Stealth logging - removed for security
                
                for (const adInfo of newAds) {
                    detectedAds.add(adInfo.uniqueId);
                    const interaction = await this.handleRealtimeAdInteraction(adInfo);
                    if (interaction) {
                        adInteractions.push({
                            scrollPosition: currentPosition,
                            adInfo: adInfo,
                            interaction: interaction,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }

            // Pause based on pattern
            const pauseTime = this.calculateScrollPause(i, numScrolls, config.pattern, config);
            await this.delay(pauseTime * 1000);

            // Reading pause (30% chance)
            if (Math.random() < 0.3) {
                const readingPause = (2 + Math.random() * 3) * config.thoroughnessMultiplier;
                console.log(`📖 Reading pause: ${readingPause.toFixed(1)}s`);
                
                // Additional ad check during reading
                const additionalAds = await this.detectNewAdsInViewport(detectedAds);
                if (additionalAds.length > 0) {
                    console.log(`🎯 READING PAUSE: Found ${additionalAds.length} additional ads`);
                }
                
                await this.delay(readingPause * 1000);
            }

            // Scroll back (15% chance) - human behavior
            if (Math.random() < 0.15) {
                const backAmount = Math.random() * 150 + 50;
                currentPosition = Math.max(0, currentPosition - backAmount);
                console.log(`⬅️ Scroll back: ${backAmount.toFixed(0)}px → Position: ${currentPosition}px`);
                
                window.scrollTo({ top: currentPosition, behavior: 'smooth' });
                await this.delay(1000);
                
                const backAds = await this.detectNewAdsInViewport(detectedAds);
                if (backAds.length > 0) {
                    console.log(`🎯 SCROLL BACK: Found ${backAds.length} ads`);
                }
                
                await this.delay(Math.random() * 1000 + 1000);
            }
        }

        // Final scroll to top
        console.log("⬆️ Final scroll to top");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await this.delay(2000);

        // Final ad detection
        const finalAds = await this.detectNewAdsInViewport(detectedAds);
        if (finalAds.length > 0) {
            console.log(`🎯 FINAL CHECK: Found ${finalAds.length} ads at top`);
        }

        console.log(`✅ Comprehensive scroll completed: ${detectedAds.size} ads detected, ${adInteractions.length} interactions`);

        return {
            totalAdsDetected: detectedAds.size,
            totalInteractions: adInteractions.length,
            adInteractions: adInteractions,
            scrollPositions: numScrolls
        };
    }

    /**
     * Calculate scroll amount based on pattern
     */
    calculatePatternScrollAmount(step, totalSteps, baseStep, pattern, currentPos, totalDistance) {
        switch (pattern) {
            case "linear":
                return baseStep + Math.random() * 100 - 50;
            
            case "exploratory":
                if (step % 3 === 0) {
                    return baseStep * 1.5 + Math.random() * 60 - 30;
                } else {
                    return baseStep * 0.7 + Math.random() * 80 - 40;
                }
            
            case "careful":
                return baseStep * 0.8 + Math.random() * 40 - 20;
            
            case "efficient":
                return baseStep * 1.2 + Math.random() * 60 - 30;
            
            case "scanning":
                if (step % 4 === 0) {
                    return baseStep * 0.5 + Math.random() * 40 - 20;
                } else {
                    return baseStep * 1.3 + Math.random() * 80 - 40;
                }
            
            case "casual":
                return baseStep + Math.random() * 160 - 80;
            
            default: // balanced
                return baseStep + Math.random() * 120 - 60;
        }
    }

    /**
     * Calculate pause time between scrolls
     */
    calculateScrollPause(step, totalSteps, pattern, config) {
        const basePause = 1 + Math.random() * 2; // 1-3 seconds
        
        const patternAdjustments = {
            linear: 1.0,
            exploratory: 1.3,
            careful: 1.5,
            efficient: 0.8,
            scanning: 0.6,
            casual: 1.2,
            balanced: 1.0
        };

        const patternAdj = patternAdjustments[pattern] || 1.0;
        return basePause * patternAdj * config.thoroughnessMultiplier;
    }

    /**
     * Simulate simple scroll for short pages
     */
    async simulateSimpleScroll(targetScrollY, duration) {
        const startScrollY = window.pageYOffset;
        const scrollDistance = targetScrollY - startScrollY;
        const steps = Math.floor(duration / 16);

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const easeProgress = this.easeInOutQuad(progress);
            const currentScrollY = startScrollY + (scrollDistance * easeProgress);

            window.scrollTo(0, currentScrollY);
            this.scrollPosition = currentScrollY;

            await this.delay(16);
        }
    }

    /**
     * Detect new ads in viewport during scrolling
     */
    async detectNewAdsInViewport(detectedAds) {
        const adSelectors = [
            'ins.adsbygoogle',
            'div[class*="adsbygoogle"]',
            'div[id*="google_ads"]',
            'div[id*="div-gpt-ad"]',
            'div[data-google-ad-client]',
            'div[data-ad-slot]',
            'div[class*="ad-"]',
            'div[id*="ad-"]',
            'iframe[src*="googleads"]',
            'iframe[src*="doubleclick"]'
        ];

        const newAds = [];
        const viewportRect = {
            top: window.pageYOffset,
            bottom: window.pageYOffset + window.innerHeight,
            left: 0,
            right: window.innerWidth
        };

        for (const selector of adSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const elementTop = rect.top + window.pageYOffset;
                    const elementBottom = rect.bottom + window.pageYOffset;

                    // Check if ad is in viewport
                    if (elementTop < viewportRect.bottom && elementBottom > viewportRect.top) {
                        const uniqueId = element.id || element.className || `ad-${Date.now()}-${Math.random()}`;
                        
                        if (!detectedAds.has(uniqueId)) {
                            newAds.push({
                                element: element,
                                uniqueId: uniqueId,
                                rect: rect,
                                selector: selector,
                                timestamp: Date.now()
                            });
                        }
                    }
                });
            } catch (error) {
                console.debug(`Error detecting ads with selector ${selector}:`, error.message);
            }
        }

        return newAds;
    }

    /**
     * Handle real-time ad interaction during scrolling
     */
    async handleRealtimeAdInteraction(adInfo) {
        try {
            // Basic interaction simulation
            const interaction = {
                type: 'scroll_detection',
                adId: adInfo.uniqueId,
                timestamp: Date.now(),
                position: {
                    x: adInfo.rect.left + adInfo.rect.width / 2,
                    y: adInfo.rect.top + adInfo.rect.height / 2
                }
            };

            // Simulate hover (20% chance)
            if (Math.random() < 0.2) {
                interaction.action = 'hover';
                await this.simulateHover(adInfo.element);
            }

            // Simulate view (always track)
            interaction.action = interaction.action || 'view';
            
            return interaction;
        } catch (error) {
            console.error('Error handling real-time ad interaction:', error);
            return null;
        }
    }

    /**
     * Setup real-time ad detection observer
     */
    setupRealtimeAdObserver() {
        if (window.adDetectionObserver) {
            return; // Already setup
        }

        try {
            // Create intersection observer for real-time ad detection
            window.detectedAds = new Set();
            window.newAdsFound = [];

            window.adDetectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const adId = element.id || element.className || `ad-${Date.now()}`;
                        
                        if (!window.detectedAds.has(adId)) {
                            window.detectedAds.add(adId);
                            window.newAdsFound.push({
                                element: element,
                                id: adId,
                                rect: entry.boundingClientRect,
                                timestamp: Date.now()
                            });
                        }
                    }
                });
            }, {
                threshold: 0.1,  // Trigger when 10% visible
                rootMargin: '50px'  // Detect ads 50px before they enter viewport
            });

            // Observe all potential ad elements
            const adSelectors = [
                'ins.adsbygoogle',
                'div[class*="adsbygoogle"]',
                'div[id*="google_ads"]',
                'div[id*="div-gpt-ad"]',
                'div[data-google-ad-client]',
                'div[data-ad-slot]',
                'div[class*="ad-"]',
                'div[id*="ad-"]',
                'iframe[src*="googleads"]',
                'iframe[src*="doubleclick"]'
            ];

            adSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        window.adDetectionObserver.observe(element);
                    });
                } catch (error) {
                    console.debug(`Error observing ads with selector ${selector}:`, error.message);
                }
            });

            console.log('✅ Real-time ad detection observer setup complete');
        } catch (error) {
            console.error('Error setting up real-time ad observer:', error);
        }
    }

    /**
     * Get scroll behavior summary
     */
    getScrollBehaviorSummary() {
        return {
            patterns: {
                linear: 'Consistent scrolling speed',
                exploratory: 'Variable speed with pauses',
                careful: 'Slow, deliberate scrolling',
                efficient: 'Fast, purposeful scrolling',
                scanning: 'Quick scanning with stops',
                casual: 'Relaxed, variable scrolling',
                balanced: 'Moderate, natural scrolling',
                touch_scroll: 'Touch-based scrolling',
                mouse_scroll: 'Mouse-based scrolling'
            },
            contentTypes: {
                news: 'Fast, linear pattern',
                blog: 'Medium speed, exploratory',
                technology: 'Slow, careful pattern',
                business: 'Medium speed, efficient',
                product: 'Fast, scanning pattern',
                entertainment: 'Fast, casual pattern',
                general: 'Medium speed, balanced'
            },
            personalityAdjustments: {
                explorer: 'Faster, less thorough',
                researcher: 'Slower, more thorough',
                casual: 'Standard speed, less thorough',
                professional: 'Slightly faster, balanced'
            },
            deviceTypes: {
                mobile: 'Touch-based, smaller viewport, shorter sessions',
                tablet: 'Touch-based, medium viewport, moderate sessions',
                desktop: 'Mouse-based, large viewport, longer sessions'
            }
        };
    }

    /**
     * Get device information and behavior
     */
    getDeviceInfo() {
        const deviceBehavior = this.getDeviceSpecificBehavior();
        return {
            type: this.deviceType,
            viewport: this.behaviorConfig.device.viewport,
            touchCapable: this.behaviorConfig.device.touchCapable,
            orientation: this.behaviorConfig.device.orientation,
            behavior: deviceBehavior,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };
    }

    /**
     * Simulate device-specific scrolling
     */
    async simulateDeviceSpecificScrolling(targetScrollY, contentType = 'general') {
        const deviceBehavior = this.getDeviceSpecificBehavior();
        
        if (this.deviceType === 'mobile') {
            return await this.simulateMobileScrolling(targetScrollY, contentType);
        } else if (this.deviceType === 'tablet') {
            return await this.simulateTabletScrolling(targetScrollY, contentType);
        } else {
            return await this.simulateDesktopScrolling(targetScrollY, contentType);
        }
    }

    /**
     * Simulate mobile-specific scrolling
     */
    async simulateMobileScrolling(targetScrollY, contentType) {
        console.log('📱 Simulating mobile scrolling behavior');
        
        // Mobile-specific adjustments
        const scrollStep = 100; // Smaller steps for mobile
        const pauseTime = 0.5; // Shorter pauses
        const maxScrolls = 10; // Fewer scroll actions
        
        let currentPosition = window.pageYOffset;
        const scrollDistance = targetScrollY - currentPosition;
        const numScrolls = Math.min(maxScrolls, Math.ceil(Math.abs(scrollDistance) / scrollStep));
        
        for (let i = 0; i < numScrolls; i++) {
            const scrollAmount = scrollStep * (scrollDistance > 0 ? 1 : -1);
            currentPosition += scrollAmount;
            
            // Smooth scroll with touch behavior
            window.scrollTo({ top: currentPosition, behavior: 'smooth' });
            
            // Shorter pause for mobile
            await this.delay(pauseTime * 1000);
            
            // Occasional longer pause (mobile users pause to read)
            if (Math.random() < 0.2) {
                await this.delay(1000 + Math.random() * 2000);
            }
        }
        
        return { deviceType: 'mobile', scrolls: numScrolls };
    }

    /**
     * Simulate tablet-specific scrolling
     */
    async simulateTabletScrolling(targetScrollY, contentType) {
        console.log('📱 Simulating tablet scrolling behavior');
        
        // Tablet-specific adjustments
        const scrollStep = 150; // Medium steps for tablet
        const pauseTime = 0.8; // Medium pauses
        const maxScrolls = 15; // Moderate scroll actions
        
        let currentPosition = window.pageYOffset;
        const scrollDistance = targetScrollY - currentPosition;
        const numScrolls = Math.min(maxScrolls, Math.ceil(Math.abs(scrollDistance) / scrollStep));
        
        for (let i = 0; i < numScrolls; i++) {
            const scrollAmount = scrollStep * (scrollDistance > 0 ? 1 : -1);
            currentPosition += scrollAmount;
            
            // Smooth scroll with touch behavior
            window.scrollTo({ top: currentPosition, behavior: 'smooth' });
            
            // Medium pause for tablet
            await this.delay(pauseTime * 1000);
            
            // Reading pauses (tablet users read more)
            if (Math.random() < 0.3) {
                await this.delay(1500 + Math.random() * 3000);
            }
        }
        
        return { deviceType: 'tablet', scrolls: numScrolls };
    }

    /**
     * Simulate desktop-specific scrolling
     */
    async simulateDesktopScrolling(targetScrollY, contentType) {
        console.log('🖥️ Simulating desktop scrolling behavior');
        
        // Use comprehensive scrolling for desktop
        return await this.simulateNaturalScrolling(targetScrollY, 2000, contentType);
    }

    /**
     * Get device comparison summary
     */
    getDeviceComparisonSummary() {
        return {
            mobile: {
                scrollPattern: 'touch_scroll',
                clickPattern: 'touch_tap',
                hoverProbability: 0.1,
                pageDwellTime: { min: 15, max: 120 },
                maxPages: 4,
                scrollSpeed: 0.8,
                pauseFrequency: 0.4,
                characteristics: 'Small viewport, touch interface, shorter attention span'
            },
            tablet: {
                scrollPattern: 'touch_scroll',
                clickPattern: 'touch_tap',
                hoverProbability: 0.2,
                pageDwellTime: { min: 20, max: 180 },
                maxPages: 6,
                scrollSpeed: 0.9,
                pauseFrequency: 0.3,
                characteristics: 'Medium viewport, touch interface, moderate engagement'
            },
            desktop: {
                scrollPattern: 'mouse_scroll',
                clickPattern: 'mouse_click',
                hoverProbability: 0.4,
                pageDwellTime: { min: 30, max: 300 },
                maxPages: 8,
                scrollSpeed: 1.0,
                pauseFrequency: 0.2,
                characteristics: 'Large viewport, mouse interface, longer engagement'
            }
        };
    }

    /**
     * Easing function for smooth scrolling
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * Get scrolling delay based on personality
     */
    getScrollingDelay(personality) {
        const baseDelay = 16;
        
        switch (personality.scrollBehavior) {
            case 'quick':
                return baseDelay * 0.5;
            case 'analytical':
                return baseDelay * 2.0;
            case 'methodical':
                return baseDelay * 1.5;
            case 'continuous':
                return baseDelay * 0.8;
            default:
                return baseDelay;
        }
    }

    /**
     * Check if should pause at content
     */
    shouldPauseAtContent(personality) {
        if (!this.behaviorConfig.scrolling.pauseAtContent) return false;

        const pauseProbability = personality.attentionSpan === 'long' ? 0.3 : 0.1;
        return Math.random() < pauseProbability;
    }

    /**
     * Simulate pause at content
     */
    async simulateContentPause() {
        const pauseTime = 500 + Math.random() * 1500;
        await this.delay(pauseTime);
    }

    /**
     * Simulate natural click with device-specific behavior
     */
    async simulateNaturalClick(element, x, y) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const clickX = x || rect.left + rect.width / 2;
        const clickY = y || rect.top + rect.height / 2;
        const deviceBehavior = this.getDeviceSpecificBehavior();

        // Device-specific click simulation
        if (this.deviceType === 'mobile' || this.deviceType === 'tablet') {
            return await this.simulateTouchTap(element, clickX, clickY);
        } else {
            return await this.simulateMouseClick(element, clickX, clickY);
        }
    }

    /**
     * Simulate mouse click for desktop
     */
    async simulateMouseClick(element, x, y) {
        // Move mouse to element first
        await this.simulateMouseMovement(x, y, 800);

        // Simulate hover
        if (this.behaviorConfig.mouseMovement.hoverEffects) {
            await this.simulateHover(element);
        }

        // Click delay based on personality
        const clickDelay = this.getClickDelay();
        await this.delay(clickDelay);

        // Perform click
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: clickX,
            clientY: clickY
        });

        element.dispatchEvent(clickEvent);
        return true;
    }

    /**
     * Simulate hover effect
     */
    async simulateHover(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Mouse enter
        const mouseEnterEvent = new MouseEvent('mouseenter', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        });

        element.dispatchEvent(mouseEnterEvent);

        // Hover time based on personality
        const hoverTime = this.getHoverTime();
        await this.delay(hoverTime);

        // Mouse leave
        const mouseLeaveEvent = new MouseEvent('mouseleave', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(mouseLeaveEvent);
    }

    /**
     * Get click delay based on personality
     */
    getClickDelay() {
        if (!this.currentPersonality) return 200;

        const personality = this.currentPersonality;
        
        switch (personality.readingSpeed) {
            case 'slow':
                return 300 + Math.random() * 200;
            case 'fast':
                return 100 + Math.random() * 100;
            default:
                return 200 + Math.random() * 150;
        }
    }

    /**
     * Get hover time based on personality
     */
    getHoverTime() {
        if (!this.currentPersonality) return 500;

        const personality = this.currentPersonality;
        const baseTime = personality.hoverProbability > 0.7 ? 800 : 400;
        
        return baseTime + Math.random() * 500;
    }

    /**
     * Simulate realistic typing
     */
    async simulateRealisticTyping(text, element) {
        if (!this.behaviorConfig.reading.enabled || !element) return;

        const personality = this.currentPersonality;
        const typingSpeed = this.getTypingSpeed(personality);

        // Focus element
        element.focus();

        // Clear existing content
        element.value = '';
        element.textContent = '';

        // Type character by character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Simulate typo occasionally
            if (this.shouldMakeTypo(personality)) {
                const typoChar = this.generateTypo(char);
                this.insertText(element, typoChar);
                await this.delay(typingSpeed);
                
                // Backspace
                this.backspace(element);
                await this.delay(typingSpeed * 0.5);
            }

            // Insert correct character
            this.insertText(element, char);
            
            // Variable delay between characters
            const delay = typingSpeed + (Math.random() - 0.5) * 100;
            await this.delay(delay);

            // Occasional pause for thinking
            if (this.shouldPauseForThinking(personality)) {
                await this.delay(500 + Math.random() * 1000);
            }
        }
    }

    /**
     * Get typing speed based on personality
     */
    getTypingSpeed(personality) {
        const baseSpeed = 100; // ms per character
        
        switch (personality.readingSpeed) {
            case 'slow':
                return baseSpeed * 1.5;
            case 'fast':
                return baseSpeed * 0.7;
            default:
                return baseSpeed;
        }
    }

    /**
     * Check if should make typo
     */
    shouldMakeTypo(personality) {
        const typoProbability = personality.type === 'casual' ? 0.05 : 0.02;
        return Math.random() < typoProbability;
    }

    /**
     * Generate typo character
     */
    generateTypo(char) {
        const nearbyKeys = {
            'a': ['s', 'q', 'z'],
            's': ['a', 'd', 'z'],
            'd': ['s', 'f', 'e'],
            'f': ['d', 'g', 'r'],
            'g': ['f', 'h', 't'],
            'h': ['g', 'j', 'y'],
            'j': ['h', 'k', 'u'],
            'k': ['j', 'l', 'i'],
            'l': ['k', 'o'],
            'z': ['a', 's', 'x'],
            'x': ['z', 'c', 's'],
            'c': ['x', 'v', 'd'],
            'v': ['c', 'b', 'f'],
            'b': ['v', 'n', 'g'],
            'n': ['b', 'm', 'h'],
            'm': ['n', 'j']
        };

        const nearby = nearbyKeys[char.toLowerCase()];
        if (nearby) {
            return nearby[Math.floor(Math.random() * nearby.length)];
        }
        
        return char;
    }

    /**
     * Check if should pause for thinking
     */
    shouldPauseForThinking(personality) {
        const pauseProbability = personality.attentionSpan === 'long' ? 0.1 : 0.05;
        return Math.random() < pauseProbability;
    }

    /**
     * Insert text into element
     */
    insertText(element, text) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const start = element.selectionStart || 0;
            const end = element.selectionEnd || 0;
            const value = element.value;
            
            element.value = value.substring(0, start) + text + value.substring(end);
            element.selectionStart = element.selectionEnd = start + text.length;
        } else {
            element.textContent += text;
        }

        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    /**
     * Backspace from element
     */
    backspace(element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const start = element.selectionStart || 0;
            const end = element.selectionEnd || 0;
            const value = element.value;
            
            if (start === end && start > 0) {
                element.value = value.substring(0, start - 1) + value.substring(end);
                element.selectionStart = element.selectionEnd = start - 1;
            } else if (start !== end) {
                element.value = value.substring(0, start) + value.substring(end);
                element.selectionStart = element.selectionEnd = start;
            }
        } else {
            const text = element.textContent;
            if (text.length > 0) {
                element.textContent = text.substring(0, text.length - 1);
            }
        }

        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    /**
     * Simulate reading behavior
     */
    async simulateReadingBehavior(contentType = 'general', contentQuality = 'medium') {
        if (!this.behaviorConfig.reading.enabled) return;

        const personality = this.currentPersonality;
        const readingPattern = this.getReadingPattern(personality, contentType, contentQuality);

        // Simulate reading time
        const readingTime = this.calculateReadingTime(personality, contentType, contentQuality);
        await this.delay(readingTime);

        // Simulate text selection
        if (readingPattern.selectionProbability > Math.random()) {
            await this.simulateTextSelection();
        }

        // Simulate scrolling while reading
        if (readingPattern.scrollWhileReading) {
            await this.simulateReadingScroll();
        }
    }

    /**
     * Get reading pattern based on personality and content
     */
    getReadingPattern(personality, contentType, contentQuality) {
        const basePattern = {
            selectionProbability: 0.3,
            scrollWhileReading: true,
            reReadProbability: 0.2
        };

        // Adjust based on personality
        if (personality.type === 'researcher') {
            basePattern.selectionProbability = 0.8;
            basePattern.reReadProbability = 0.6;
        } else if (personality.type === 'casual') {
            basePattern.selectionProbability = 0.1;
            basePattern.reReadProbability = 0.1;
        }

        // Adjust based on content quality
        if (contentQuality === 'high') {
            basePattern.selectionProbability *= 1.5;
            basePattern.reReadProbability *= 1.3;
        }

        return basePattern;
    }

    /**
     * Calculate reading time based on personality and content
     */
    calculateReadingTime(personality, contentType, contentQuality) {
        let baseTime = 5000; // 5 seconds base

        // Adjust based on personality reading speed
        switch (personality.readingSpeed) {
            case 'slow':
                baseTime *= 1.8;
                break;
            case 'fast':
                baseTime *= 0.6;
                break;
        }

        // Adjust based on content type
        switch (contentType) {
            case 'article':
                baseTime *= 1.5;
                break;
            case 'technical':
                baseTime *= 2.0;
                break;
            case 'casual':
                baseTime *= 0.7;
                break;
        }

        // Adjust based on content quality
        if (contentQuality === 'high') {
            baseTime *= 1.3;
        }

        return Math.round(baseTime + (Math.random() - 0.5) * baseTime * 0.3);
    }

    /**
     * Simulate text selection
     */
    async simulateTextSelection() {
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Find text elements
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        const readableElements = Array.from(textElements).filter(el => 
            el.textContent && el.textContent.trim().length > 20
        );

        if (readableElements.length > 0) {
            const randomElement = readableElements[Math.floor(Math.random() * readableElements.length)];
            const text = randomElement.textContent;
            
            if (text.length > 10) {
                const start = Math.floor(Math.random() * (text.length - 10));
                const end = start + 5 + Math.floor(Math.random() * 10);
                
                range.setStart(randomElement.firstChild || randomElement, start);
                range.setEnd(randomElement.firstChild || randomElement, end);
                
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Hold selection for a moment
                await this.delay(1000 + Math.random() * 2000);
                
                // Clear selection
                selection.removeAllRanges();
            }
        }
    }

    /**
     * Simulate scrolling while reading
     */
    async simulateReadingScroll() {
        const scrollDistance = 100 + Math.random() * 200;
        await this.simulateNaturalScrolling(window.pageYOffset + scrollDistance, 1500);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current behavior status
     */
    getBehaviorStatus() {
        return {
            isSimulating: this.isSimulating,
            personality: this.currentPersonality,
            config: this.behaviorConfig,
            mousePosition: this.mousePosition,
            scrollPosition: this.scrollPosition
        };
    }

    /**
     * Start behavior simulation
     */
    startSimulation() {
        this.isSimulating = true;
    }

    /**
     * Stop behavior simulation
     */
    stopSimulation() {
        this.isSimulating = false;
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BehaviorSimulator;
} else if (typeof window !== 'undefined' && !window.BehaviorSimulator) {
    window.BehaviorSimulator = BehaviorSimulator;
}
