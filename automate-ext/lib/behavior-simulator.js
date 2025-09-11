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
        this.stealthDelay = new (window._stealth_delay || (() => {
            // Fallback delay function if stealth delay is not available
            return {
                wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
                waitRandom: (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min))
            };
        })());
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

        // Adjust navigation based on personality and device
        this.behaviorConfig.navigation.hoverProbability = this.adjustHoverProbabilityForPersonality(personality.hoverProbability, deviceBehavior.hoverProbability);
        this.behaviorConfig.navigation.viewportBehavior = deviceBehavior.viewportBehavior;
        this.behaviorConfig.navigation.style = patterns.navigation.style;
        this.behaviorConfig.navigation.tabUsage = patterns.navigation.tabUsage;
        // this.behaviorConfig.navigation.backForwardUsage = patterns.navigation.backForwardUsage;
        this.behaviorConfig.navigation.bookmarkUsage = patterns.navigation.bookmarkUsage;
        this.behaviorConfig.navigation.searchUsage = patterns.navigation.searchUsage;

        // Store personality-specific configurations
        this.behaviorConfig.personality = {
            type: personality.type,
            clickProbability: personality.clickProbability,
            hoverProbability: personality.hoverProbability,
            readingSpeed: personality.readingSpeed,
            attentionSpan: personality.attentionSpan,
            navigationStyle: personality.navigationStyle,
            scrollBehavior: personality.scrollBehavior,
            searchBehavior: personality.searchBehavior,
            tabSwitching: personality.tabSwitching
        };

        console.log(`🎭 Updated behavior config for ${personality.type} personality on ${this.deviceType} device`);
    }

    /**
     * Adjust hover probability based on personality and device
     */
    adjustHoverProbabilityForPersonality(personalityHoverProbability, deviceHoverProbability) {
        // Combine personality and device hover probabilities
        const combinedProbability = (personalityHoverProbability + deviceHoverProbability) / 2;
        
        // Add some randomness for realism
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        
        return Math.max(0, Math.min(1, combinedProbability + variation));
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
     * Simulate natural scrolling with browser compatibility
     */
    async simulateNaturalScrolling(targetScrollY, duration = 2000, contentType = 'general') {
        if (!this.behaviorConfig.scrolling.enabled) {
            this.safeScrollTo(0, targetScrollY);
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
     * Safe scroll method with browser compatibility
     */
    safeScrollTo(x, y) {
        try {
            // Try modern smooth scrolling first
            if (window.scrollTo && typeof window.scrollTo === 'function') {
                if (window.scrollTo.length >= 2) {
                    // Modern browsers support options object
                    window.scrollTo({ top: y, left: x, behavior: 'smooth' });
                } else {
                    // Fallback for older browsers
                    window.scrollTo(x, y);
                }
            } else {
                // Fallback for very old browsers
                window.scrollTop = y;
                window.scrollLeft = x;
            }
        } catch (error) {
            console.debug('Smooth scrolling not supported, using fallback:', error.message);
            // Ultimate fallback
            try {
                window.scrollTo(x, y);
            } catch (fallbackError) {
                console.warn('All scrolling methods failed:', fallbackError.message);
            }
        }
    }

    /**
     * Safe touch event creation with fallbacks
     */
    createSafeTouchEvent(type, element, x, y, options = {}) {
        try {
            // Try modern TouchEvent constructor
            if (typeof TouchEvent !== 'undefined') {
                return new TouchEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    touches: options.touches || [],
                    changedTouches: options.changedTouches || [],
                    ...options
                });
            } else {
                // Fallback for browsers without TouchEvent support
                const event = document.createEvent('Event');
                event.initEvent(type, true, true);
                event.touches = options.touches || [];
                event.changedTouches = options.changedTouches || [];
                return event;
            }
        } catch (error) {
            console.debug('TouchEvent creation failed, using mouse event fallback:', error.message);
            // Fallback to mouse events
            return new MouseEvent(type === 'touchstart' ? 'mousedown' : 
                                type === 'touchend' ? 'mouseup' : 'mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y
            });
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

        // Calculate number of scroll actions to cover entire page
        const pageHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxScrollDistance = pageHeight - viewportHeight;
        
        // Ensure we scroll through the entire page content
        let numScrolls = Math.max(5, Math.floor(maxScrollDistance / scrollStep));
        
        // Adjust based on thoroughness
        if (config.thoroughness === "high") {
            numScrolls = Math.floor(numScrolls * 1.8); // Increased from 1.5 to 1.8
        } else if (config.thoroughness === "low") {
            numScrolls = Math.floor(numScrolls * 0.8); // Increased from 0.7 to 0.8
        }

        let currentPosition = window.pageYOffset;
        const detectedAds = new Set();
        const adInteractions = [];
        let hasReachedBottom = false;
        let hasReachedTop = false;
        const startTime = Date.now();

        if (this.behaviorConfig.debugMode) {
            console.log(`📖 Starting comprehensive reading: ${numScrolls} scrolls, ${maxScrollDistance}px total distance`);
        }

        for (let i = 0; i < numScrolls; i++) {
            // Calculate scroll amount based on pattern and current position
            const scrollAmount = this.calculateReadingScrollAmount(
                i, numScrolls, scrollStep, config.pattern, currentPosition, maxScrollDistance
            );

            // Apply scroll
            currentPosition += scrollAmount;
            
            // Ensure we don't go beyond page boundaries
            if (currentPosition >= maxScrollDistance) {
                currentPosition = maxScrollDistance;
                hasReachedBottom = true;
            } else if (currentPosition <= 0) {
                currentPosition = 0;
                hasReachedTop = true;
            }

            // Smooth scroll to position
            window.scrollTo({ top: currentPosition, behavior: 'smooth' });

            // Real-time ad detection during scroll with variable timing
            const scrollDetectionDelay = 800 + Math.random() * 1400; // 0.8-2.2 seconds
            await this.delay(scrollDetectionDelay);
            const newAds = await this.detectNewAdsInViewport(detectedAds);
            
            if (newAds.length > 0) {
                if (this.behaviorConfig.debugMode) {
                    console.log(`🎯 Found ${newAds.length} new ads at position ${currentPosition}px`);
                }
                
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

            // Pause based on pattern and content with human-like variation
            const basePauseTime = this.calculateReadingPause(i, numScrolls, config.pattern, config, currentPosition, maxScrollDistance);
            const pauseVariation = 0.7 + Math.random() * 0.6; // 70-130% of base time
            const pauseTime = basePauseTime * pauseVariation;
            
            // Add occasional longer pauses (human reading behavior)
            const longPauseChance = Math.random() < 0.15; // 15% chance
            const finalPauseTime = longPauseChance ? pauseTime * (2 + Math.random() * 2) : pauseTime;
            
            await this.delay(finalPauseTime * 1000);

            // Reading pause with variable frequency and duration
            const readingPauseChance = 0.3 + Math.random() * 0.4; // 30-70% chance (variable)
            if (Math.random() < readingPauseChance) {
                const baseReadingPause = (2 + Math.random() * 6) * config.thoroughnessMultiplier; // 2-8 seconds
                const readingPauseVariation = 0.5 + Math.random() * 1.0; // 50-150% variation
                const readingPause = baseReadingPause * readingPauseVariation;
                
                if (this.behaviorConfig.debugMode) {
                    console.log(`📖 Reading pause at ${currentPosition}px: ${readingPause.toFixed(1)}s`);
                }
                
                // Additional ad check during reading
                const additionalAds = await this.detectNewAdsInViewport(detectedAds);
                if (additionalAds.length > 0 && this.behaviorConfig.debugMode) {
                    console.log(`🎯 READING PAUSE: Found ${additionalAds.length} additional ads`);
                }
                
                await this.delay(readingPause * 1000);
            }

            // Occasional scroll back for re-reading (reduced frequency)
            if (Math.random() < 0.1 && !hasReachedBottom) { // Reduced from 15% to 10% chance
                const backAmount = Math.random() * 100 + 50; // Reduced from 150+50 to 100+50
                currentPosition = Math.max(0, currentPosition - backAmount);
                console.log(`⬅️ Re-reading scroll back: ${backAmount.toFixed(0)}px → Position: ${currentPosition}px`);
                
                window.scrollTo({ top: currentPosition, behavior: 'smooth' });
                await this.delay(1000);
                
                const backAds = await this.detectNewAdsInViewport(detectedAds);
                if (backAds.length > 0) {
                    console.log(`🎯 SCROLL BACK: Found ${backAds.length} ads`);
                }
                
                await this.delay(Math.random() * 1000 + 1000);
            }

            // Progress logging
            if (i % Math.floor(numScrolls / 4) === 0) {
                const progress = ((i / numScrolls) * 100).toFixed(1);
                console.log(`📊 Reading progress: ${progress}% (${currentPosition}/${maxScrollDistance}px)`);
            }
        }

        // Ensure we reach the bottom of the page
        if (!hasReachedBottom) {
            console.log("⬇️ Final scroll to bottom of page");
            window.scrollTo({ top: maxScrollDistance, behavior: 'smooth' });
            await this.delay(2000);
            
            // Final reading pause at bottom
            const finalReadingPause = 5000 + Math.random() * 5000; // 5-10 seconds
            console.log(`📖 Final reading pause at bottom: ${Math.round(finalReadingPause/1000)}s`);
            await this.delay(finalReadingPause);
        }

        // Scroll back to top for navigation
        console.log("⬆️ Scroll back to top for navigation");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await this.delay(2000);

        // Final ad detection
        const finalAds = await this.detectNewAdsInViewport(detectedAds);
        if (finalAds.length > 0) {
            console.log(`🎯 FINAL CHECK: Found ${finalAds.length} ads at top`);
        }

        console.log(`✅ Comprehensive reading completed: ${detectedAds.size} ads detected, ${adInteractions.length} interactions, ${currentPosition}px covered`);

        return {
            success: true,
            totalScrolls: numScrolls,
            adsDetected: detectedAds.size,
            interactions: adInteractions.length,
            adInteractions: adInteractions,
            finalPosition: currentPosition,
            maxScrollDistance: maxScrollDistance,
            pageCoverage: `${currentPosition}/${maxScrollDistance}px`,
            coveragePercentage: Math.round((currentPosition / maxScrollDistance) * 100),
            duration: Date.now() - startTime,
            personality: personality.type,
            config: config,
            timestamp: Date.now()
        };
    }

    /**
     * Calculate reading scroll amount to ensure complete page coverage
     */
    calculateReadingScrollAmount(step, totalSteps, baseStep, pattern, currentPos, maxDistance) {
        const progress = step / totalSteps;
        const remainingDistance = maxDistance - currentPos;
        
        // Ensure we move forward most of the time
        if (remainingDistance > 0) {
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
        } else {
            // If we're at the bottom, occasionally scroll back up for re-reading
            return -(baseStep * 0.5 + Math.random() * 100);
        }
    }

    /**
     * Calculate reading pause time based on content and position
     */
    calculateReadingPause(step, totalSteps, pattern, config, currentPos, maxDistance) {
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
        let pauseTime = basePause * patternAdj * config.thoroughnessMultiplier;
        
        // Add extra pause when reading important content (headings, etc.)
        if (this.isReadingImportantContent(currentPos)) {
            pauseTime *= 1.5;
        }
        
        // Add extra pause near the end of the page
        const progress = currentPos / maxDistance;
        if (progress > 0.8) {
            pauseTime *= 1.3; // 30% longer pause near the end
        }
        
        return pauseTime;
    }

    /**
     * Check if we're reading important content at current position
     */
    isReadingImportantContent(currentPos) {
        try {
            const viewportRect = {
                top: currentPos,
                bottom: currentPos + window.innerHeight
            };
            
            // Check for headings in viewport
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            for (const heading of headings) {
                const rect = heading.getBoundingClientRect();
                const headingTop = rect.top + window.pageYOffset;
                
                if (headingTop >= viewportRect.top && headingTop <= viewportRect.bottom) {
                    return true;
                }
            }
            
            // Check for images or important elements
            const importantElements = document.querySelectorAll('img, blockquote, .highlight, .important');
            for (const element of importantElements) {
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + window.pageYOffset;
                
                if (elementTop >= viewportRect.top && elementTop <= viewportRect.bottom) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            return false;
        }
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
            const personality = this.currentPersonality;
            const interactionProbability = personality ? personality.clickProbability : 0.1;
            
            // Standardized interaction object
            const interaction = {
                success: true,
                type: 'scroll_detection',
                adId: adInfo.uniqueId,
                action: 'view', // Default action
                timestamp: Date.now(),
                position: {
                    x: adInfo.rect.left + adInfo.rect.width / 2,
                    y: adInfo.rect.top + adInfo.rect.height / 2
                },
                element: {
                    tagName: adInfo.element.tagName,
                    className: adInfo.element.className,
                    id: adInfo.element.id
                },
                viewport: {
                    width: adInfo.rect.width,
                    height: adInfo.rect.height,
                    visible: adInfo.rect.top >= 0 && adInfo.rect.bottom <= window.innerHeight
                },
                personality: personality ? personality.type : 'unknown',
                probability: interactionProbability
            };

            // Simulate hover (20% chance)
            if (Math.random() < 0.2) {
                interaction.action = 'hover';
                interaction.hoverDuration = 500 + Math.random() * 1000;
                await this.simulateHover(adInfo.element);
            }

            // Simulate click (based on personality probability)
            if (Math.random() < interactionProbability) {
                interaction.action = 'click';
                interaction.clickDelay = 200 + Math.random() * 800;
                await this.delay(interaction.clickDelay);
                // Note: Actual click would be handled by calling function
            }

            // Always track view
            if (interaction.action === 'view') {
                interaction.viewDuration = 1000 + Math.random() * 2000;
            }
            
            return interaction;
        } catch (error) {
            console.error('Error handling real-time ad interaction:', error);
            return {
                success: false,
                error: error.message,
                timestamp: Date.now(),
                adId: adInfo.uniqueId || 'unknown'
            };
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
                pageDwellTime: { min: 45, max: 180 }, // Increased from 15-120 to 45-180 seconds
                maxPages: 8,
                scrollSpeed: 0.7, // Reduced from 1.0 to 0.7 for less aggressive scrolling
                pauseFrequency: 0.3, // Increased from 0.2 to 0.3 for more pauses
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
     * Simulate pause at content (optimized for realistic timing)
     */
    async simulateContentPause() {
        const pauseTime = 200 + Math.random() * 800; // Reduced from 500-2000ms to 200-1000ms
        await this.delay(pauseTime);
    }

    /**
     * Analyze content complexity for reading comprehension
     */
    analyzeContentComplexity(content) {
        if (!content) return 1;
        
        const wordCount = content.split(' ').length;
        const sentenceCount = content.split(/[.!?]+/).length;
        const avgWordsPerSentence = wordCount / sentenceCount;
        
        // Complexity scoring
        let complexity = 1;
        if (avgWordsPerSentence > 20) complexity += 1;
        if (wordCount > 100) complexity += 1;
        if (content.includes('technical') || content.includes('complex')) complexity += 1;
        if (content.includes('analysis') || content.includes('research')) complexity += 1;
        if (content.includes('algorithm') || content.includes('methodology')) complexity += 1;
        
        return Math.min(complexity, 5); // Max complexity of 5
    }

    /**
     * Simulate comprehension pause based on content complexity
     */
    async simulateComprehensionPause(content, personality) {
        const contentComplexity = this.analyzeContentComplexity(content);
        const basePause = contentComplexity * 200; // 200ms per complexity unit
        const personalityMultiplier = personality.readingSpeed === 'slow' ? 1.8 : 1.0;
        
        const pauseTime = basePause * personalityMultiplier;
        await this.delay(pauseTime);
        
        return {
            duration: pauseTime,
            complexity: contentComplexity,
            personality: personality.type,
            contentLength: content ? content.length : 0,
            timestamp: Date.now()
        };
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
        // Calculate click coordinates
        const rect = element.getBoundingClientRect();
        const clickX = x || rect.left + rect.width / 2;
        const clickY = y || rect.top + rect.height / 2;

        // Move mouse to element first
        await this.simulateMouseMovement(clickX, clickY, 800);

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
                await this.simulateThinkingPause(personality, 'typing');
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
     * Simulate thinking pause with personality-based timing
     */
    async simulateThinkingPause(personality, context = 'typing') {
        const basePause = context === 'typing' ? 500 : 1000;
        const variation = Math.random() * 1000;
        const personalityMultiplier = personality.attentionSpan === 'long' ? 1.5 : 1.0;
        
        const pauseTime = (basePause + variation) * personalityMultiplier;
        await this.delay(pauseTime);
        
        return {
            duration: pauseTime,
            context: context,
            personality: personality.type,
            timestamp: Date.now()
        };
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
     * Simulate reading behavior with enhanced parameters
     */
    async simulateReadingBehavior(contentType = 'general', contentQuality = 'medium', options = {}) {
        if (!this.behaviorConfig.reading.enabled) return {
            success: false,
            reason: 'reading_disabled',
            timestamp: Date.now()
        };

        const {
            enableTextSelection = true,
            enableComprehensionPauses = true,
            enableReReading = true,
            customReadingTime = null,
            content = null
        } = options;

        const personality = this.currentPersonality;
        const readingPattern = this.getReadingPattern(personality, contentType, contentQuality);

        // Simulate reading time
        const readingTime = customReadingTime || this.calculateReadingTime(personality, contentType, contentQuality);
        await this.delay(readingTime);

        const results = {
            success: true,
            readingTime: readingTime,
            textSelection: false,
            comprehensionPauses: 0,
            reReading: false,
            scrollActions: 0,
            timestamp: Date.now()
        };

        // Simulate text selection
        if (enableTextSelection && readingPattern.selectionProbability > Math.random()) {
            await this.simulateTextSelection();
            results.textSelection = true;
        }

        // Simulate comprehension pauses
        if (enableComprehensionPauses && content) {
            const comprehensionPause = await this.simulateComprehensionPause(content, personality);
            results.comprehensionPauses = 1;
            results.comprehensionDuration = comprehensionPause.duration;
        }

        // Simulate scrolling while reading (reduced frequency)
        if (readingPattern.scrollWhileReading && Math.random() < 0.3) { // Only 30% chance
            await this.simulateReadingScroll();
            results.scrollActions = 1;
        }

        // Simulate re-reading
        if (enableReReading && readingPattern.reReadProbability > Math.random()) {
            await this.delay(readingTime * 0.3); // 30% of original reading time
            results.reReading = true;
        }

        return results;
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

    /**
     * Simulate touch tap for mobile/tablet devices
     */
    async simulateTouchTap(element, clickX, clickY) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const tapX = clickX || rect.left + rect.width / 2;
        const tapY = clickY || rect.top + rect.height / 2;

        try {
            // Create touch start event
            const touchStartEvent = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [new Touch({
                    identifier: 0,
                    target: element,
                    clientX: tapX,
                    clientY: tapY,
                    screenX: tapX,
                    screenY: tapY,
                    pageX: tapX,
                    pageY: tapY,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    force: 1.0
                })]
            });

            // Create touch end event
            const touchEndEvent = new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true,
                touches: [],
                changedTouches: [new Touch({
                    identifier: 0,
                    target: element,
                    clientX: tapX,
                    clientY: tapY,
                    screenX: tapX,
                    screenY: tapY,
                    pageX: tapX,
                    pageY: tapY,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    force: 0.0
                })]
            });

            // Dispatch touch events
            element.dispatchEvent(touchStartEvent);
            await this.delay(50 + Math.random() * 100); // Touch duration
            element.dispatchEvent(touchEndEvent);

            // Also dispatch click event for compatibility
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: tapX,
                clientY: tapY
            });

            element.dispatchEvent(clickEvent);

            return true;
        } catch (error) {
            console.warn('Touch tap simulation failed, falling back to click:', error.message);
            // Fallback to regular click
            return await this.simulateMouseClick(element, tapX, tapY);
        }
    }

    /**
     * Simulate mobile gesture (swipe, pinch, etc.)
     */
    async simulateMobileGesture(element, gestureType, options = {}) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        try {
            switch (gestureType) {
                case 'swipe_left':
                    return await this.simulateSwipeGesture(element, centerX, centerY, 'left', options);
                case 'swipe_right':
                    return await this.simulateSwipeGesture(element, centerX, centerY, 'right', options);
                case 'swipe_up':
                    return await this.simulateSwipeGesture(element, centerX, centerY, 'up', options);
                case 'swipe_down':
                    return await this.simulateSwipeGesture(element, centerX, centerY, 'down', options);
                case 'pinch_zoom_in':
                    return await this.simulatePinchGesture(element, centerX, centerY, 'in', options);
                case 'pinch_zoom_out':
                    return await this.simulatePinchGesture(element, centerX, centerY, 'out', options);
                case 'long_press':
                    return await this.simulateLongPress(element, centerX, centerY, options);
                default:
                    console.warn(`Unknown gesture type: ${gestureType}`);
                    return false;
            }
        } catch (error) {
            console.warn('Mobile gesture simulation failed:', error.message);
            return false;
        }
    }

    /**
     * Simulate swipe gesture
     */
    async simulateSwipeGesture(element, startX, startY, direction, options = {}) {
        const distance = options.distance || 100;
        const duration = options.duration || 300;
        const steps = options.steps || 10;

        let endX = startX;
        let endY = startY;

        // Calculate end position based on direction
        switch (direction) {
            case 'left':
                endX = startX - distance;
                break;
            case 'right':
                endX = startX + distance;
                break;
            case 'up':
                endY = startY - distance;
                break;
            case 'down':
                endY = startY + distance;
                break;
        }

        // Create touch start event
        const touchStartEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [new Touch({
                identifier: 0,
                target: element,
                clientX: startX,
                clientY: startY,
                screenX: startX,
                screenY: startY,
                pageX: startX,
                pageY: startY,
                radiusX: 10,
                radiusY: 10,
                rotationAngle: 0,
                force: 1.0
            })]
        });

        element.dispatchEvent(touchStartEvent);

        // Simulate touch move events
        for (let i = 1; i <= steps; i++) {
            const progress = i / steps;
            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;

            const touchMoveEvent = new TouchEvent('touchmove', {
                bubbles: true,
                cancelable: true,
                touches: [new Touch({
                    identifier: 0,
                    target: element,
                    clientX: currentX,
                    clientY: currentY,
                    screenX: currentX,
                    screenY: currentY,
                    pageX: currentX,
                    pageY: currentY,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    force: 1.0
                })]
            });

            element.dispatchEvent(touchMoveEvent);
            await this.delay(duration / steps);
        }

        // Create touch end event
        const touchEndEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            changedTouches: [new Touch({
                identifier: 0,
                target: element,
                clientX: endX,
                clientY: endY,
                screenX: endX,
                screenY: endY,
                pageX: endX,
                pageY: endY,
                radiusX: 10,
                radiusY: 10,
                rotationAngle: 0,
                force: 0.0
            })]
        });

        element.dispatchEvent(touchEndEvent);
        return true;
    }

    /**
     * Simulate pinch gesture
     */
    async simulatePinchGesture(element, centerX, centerY, direction, options = {}) {
        const distance = options.distance || 50;
        const duration = options.duration || 500;
        const steps = options.steps || 10;

        // Create two touch points for pinch
        const touch1StartX = centerX - distance;
        const touch1StartY = centerY;
        const touch2StartX = centerX + distance;
        const touch2StartY = centerY;

        let touch1EndX, touch1EndY, touch2EndX, touch2EndY;

        if (direction === 'in') {
            // Pinch in - fingers move closer
            touch1EndX = centerX - distance / 2;
            touch1EndY = centerY;
            touch2EndX = centerX + distance / 2;
            touch2EndY = centerY;
        } else {
            // Pinch out - fingers move apart
            touch1EndX = centerX - distance * 1.5;
            touch1EndY = centerY;
            touch2EndX = centerX + distance * 1.5;
            touch2EndY = centerY;
        }

        // Create touch start event with two touches
        const touchStartEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [
                new Touch({
                    identifier: 0,
                    target: element,
                    clientX: touch1StartX,
                    clientY: touch1StartY,
                    screenX: touch1StartX,
                    screenY: touch1StartY,
                    pageX: touch1StartX,
                    pageY: touch1StartY,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    force: 1.0
                }),
                new Touch({
                    identifier: 1,
                    target: element,
                    clientX: touch2StartX,
                    clientY: touch2StartY,
                    screenX: touch2StartX,
                    screenY: touch2StartY,
                    pageX: touch2StartX,
                    pageY: touch2StartY,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    force: 1.0
                })
            ]
        });

        element.dispatchEvent(touchStartEvent);

        // Simulate touch move events
        for (let i = 1; i <= steps; i++) {
            const progress = i / steps;
            const touch1CurrentX = touch1StartX + (touch1EndX - touch1StartX) * progress;
            const touch1CurrentY = touch1StartY + (touch1EndY - touch1StartY) * progress;
            const touch2CurrentX = touch2StartX + (touch2EndX - touch2StartX) * progress;
            const touch2CurrentY = touch2StartY + (touch2EndY - touch2StartY) * progress;

            const touchMoveEvent = new TouchEvent('touchmove', {
                bubbles: true,
                cancelable: true,
                touches: [
                    new Touch({
                        identifier: 0,
                        target: element,
                        clientX: touch1CurrentX,
                        clientY: touch1CurrentY,
                        screenX: touch1CurrentX,
                        screenY: touch1CurrentY,
                        pageX: touch1CurrentX,
                        pageY: touch1CurrentY,
                        radiusX: 10,
                        radiusY: 10,
                        rotationAngle: 0,
                        force: 1.0
                    }),
                    new Touch({
                        identifier: 1,
                        target: element,
                        clientX: touch2CurrentX,
                        clientY: touch2CurrentY,
                        screenX: touch2CurrentX,
                        screenY: touch2CurrentY,
                        pageX: touch2CurrentX,
                        pageY: touch2CurrentY,
                        radiusX: 10,
                        radiusY: 10,
                        rotationAngle: 0,
                        force: 1.0
                    })
                ]
            });

            element.dispatchEvent(touchMoveEvent);
            await this.delay(duration / steps);
        }

        // Create touch end event
        const touchEndEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            changedTouches: [
                new Touch({
                    identifier: 0,
                    target: element,
                    clientX: touch1EndX,
                    clientY: touch1EndY,
                    screenX: touch1EndX,
                    screenY: touch1EndY,
                    pageX: touch1EndX,
                    pageY: touch1EndY,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    force: 0.0
                }),
                new Touch({
                    identifier: 1,
                    target: element,
                    clientX: touch2EndX,
                    clientY: touch2EndY,
                    screenX: touch2EndX,
                    screenY: touch2EndY,
                    pageX: touch2EndX,
                    pageY: touch2EndY,
                    radiusX: 10,
                    radiusY: 10,
                    rotationAngle: 0,
                    force: 0.0
                })
            ]
        });

        element.dispatchEvent(touchEndEvent);
        return true;
    }

    /**
     * Simulate long press gesture
     */
    async simulateLongPress(element, x, y, options = {}) {
        const duration = options.duration || 1000; // 1 second long press

        // Create touch start event
        const touchStartEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [new Touch({
                identifier: 0,
                target: element,
                clientX: x,
                clientY: y,
                screenX: x,
                screenY: y,
                pageX: x,
                pageY: y,
                radiusX: 10,
                radiusY: 10,
                rotationAngle: 0,
                force: 1.0
            })]
        });

        element.dispatchEvent(touchStartEvent);

        // Hold for duration
        await this.delay(duration);

        // Create touch end event
        const touchEndEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            changedTouches: [new Touch({
                identifier: 0,
                target: element,
                clientX: x,
                clientY: y,
                screenX: x,
                screenY: y,
                pageX: x,
                pageY: y,
                radiusX: 10,
                radiusY: 10,
                rotationAngle: 0,
                force: 0.0
            })]
        });

        element.dispatchEvent(touchEndEvent);

        // Trigger context menu event for long press
        const contextMenuEvent = new MouseEvent('contextmenu', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });

        element.dispatchEvent(contextMenuEvent);
        return true;
    }

    /**
     * Get mobile-specific behavior patterns
     */
    getMobileBehaviorPatterns() {
        return {
            touch: {
                tapDuration: { min: 50, max: 150 },
                longPressDuration: { min: 800, max: 1200 },
                swipeDistance: { min: 80, max: 200 },
                pinchDistance: { min: 40, max: 100 }
            },
            gestures: {
                swipeProbability: 0.3,
                pinchProbability: 0.1,
                longPressProbability: 0.2,
                doubleTapProbability: 0.15
            },
            navigation: {
                preferSwipe: true,
                preferTap: true,
                avoidHover: true,
                useGestures: true
            }
        };
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BehaviorSimulator;
} else if (typeof window !== 'undefined' && !window.BehaviorSimulator) {
    window.BehaviorSimulator = BehaviorSimulator;
}
