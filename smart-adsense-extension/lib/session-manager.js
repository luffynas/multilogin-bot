/**
 * Session Manager - Enhanced Mengelola dan tracking session otomatisasi
 * ENHANCED VERSION with comprehensive fixes and improvements
 */

class SessionManager {
    constructor() {
        // Enhanced configuration
        this.config = {
            // Session limits
            maxSessionDuration: 30 * 60 * 1000, // 30 minutes
            maxPostsPerSession: 5,
            maxAdClicksPerSession: 1,
            maxPagesPerSession: 20,
            
            // Performance optimization
            enableCaching: true,
            enableCompression: true,
            enableBackup: true,
            maxBackupCount: 5,
            
            // Monitoring settings
            monitoringInterval: 30000, // 30 seconds
            autoSaveInterval: 60000,   // 60 seconds
            cleanupInterval: 300000,   // 5 minutes
            
            // Analytics settings
            enableAdvancedAnalytics: true,
            enablePerformanceTracking: true,
            enableSessionOptimization: true,
            
            // Memory management
            maxSessionHistory: 100,
            enableMemoryOptimization: true,
            maxStoredSessions: 50
        };

        // Enhanced session data structure
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        this.sessionData = {
            id: this.sessionId,
            startTime: this.sessionStartTime,
            postsRead: 0,
            adClicks: 0,
            totalReadingTime: 0,
            pagesVisited: [],
            personalityType: null,
            deviceType: null,
            riskLevel: 'low',
            status: 'active',
            
            // Enhanced metrics
            performance: {
                averageReadingTime: 0,
                averagePageLoadTime: 0,
                cacheHitRate: 0,
                errorCount: 0,
                successRate: 0
            },
            
            // Advanced tracking
            userBehavior: {
                readingPatterns: [],
                clickPatterns: [],
                navigationPatterns: [],
                timeSpentPerPage: [],
                scrollDepth: []
            },
            
            // Session optimization
            optimization: {
                adaptiveLimits: {},
                performanceMetrics: {},
                recommendations: []
            }
        };
        
        // Performance optimization: caching system
        this.sessionCache = new Map();
        this.analyticsCache = new Map();
        this.performanceCache = new Map();
        this.lastCleanup = Date.now();
        
        // Session history management
        this.sessionHistory = [];
        this.performanceHistory = [];
        this.optimizationHistory = [];
        
        // Performance metrics
        this.performanceMetrics = {
            totalSessions: 0,
            totalPostsRead: 0,
            totalAdClicks: 0,
            totalReadingTime: 0,
            averageSessionDuration: 0,
            sessionSuccessRate: 0,
            cacheHits: 0,
            cacheMisses: 0,
            lastOptimization: null
        };
        
        // Initialize unified storage service
        this.storageService = new StorageService();
        
        // Missing properties for compatibility
        this.clickHistory = [];
        
        // Initialize enhanced session
        this.initializeSession();
        
        console.log('🚀 Enhanced Session Manager initialized with config:', this.config);
    }

    // Enhanced session initialization
    initializeSession() {
        console.log('📊 Initializing enhanced session manager...', {
            sessionId: this.sessionId,
            startTime: new Date(this.sessionStartTime).toLocaleTimeString(),
            config: this.config
        });

        // Load session data with enhanced error handling
        this.loadSessionDataEnhanced();
        
        // Setup enhanced session monitoring
        this.setupSessionMonitoringEnhanced();
        
        // Setup enhanced auto-save with compression
        this.setupAutoSaveEnhanced();
        
        // Setup performance optimization
        this.setupPerformanceOptimization();
        
        // Setup memory cleanup
        this.setupMemoryCleanup();
        
        // Load session history
        this.loadSessionHistory();
        
        // Initialize adaptive limits
        this.initializeAdaptiveLimits();
    }

    // Enhanced session ID generation
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const userAgent = navigator.userAgent.substring(0, 10);
        const hash = this.simpleHash(timestamp + random + userAgent);
        
        return `session_${timestamp}_${random}_${hash}`;
    }

    // Simple hash function for session ID
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    // Enhanced session data loading
    async loadSessionDataEnhanced() {
        try {
            if (this.storageService) {
                const savedData = await this.storageService.get('session_' + this.sessionId);
                if (savedData) {
                    // Merge with existing data, preserving enhanced structure
                    this.sessionData = this.mergeSessionData(this.sessionData, savedData);
                    
                    console.log('📊 Enhanced session data loaded from unified storage successfully');
                    
                    // Validate loaded data
                    this.validateSessionData();
                }
            }
        } catch (error) {
            console.error('Error loading enhanced session data from unified storage:', error);
            this.handleDataCorruption();
        }
    }

    // Enhanced session data saving with compression
    async saveSessionDataEnhanced() {
        try {
            const dataToSave = {
                ...this.sessionData,
                lastUpdate: Date.now(),
                sessionDuration: this.getSessionDuration(),
                performance: this.getCurrentPerformanceMetrics(),
                optimization: this.getCurrentOptimizationData()
            };
            
            // Compress data if enabled
            let dataToStore = dataToSave;
            if (this.config.enableCompression) {
                dataToStore = this.compressSessionData(dataToSave);
            }
            
            // Save to unified storage
            if (this.storageService) {
                await this.storageService.set('session_' + this.sessionId, dataToStore);
                
                // Create backup if enabled
                if (this.config.enableBackup) {
                    this.createSessionBackup(dataToSave);
                }
            }
            
            // Update cache
            this.sessionCache.set(this.sessionId, {
                data: dataToSave,
                timestamp: Date.now(),
                compressed: this.config.enableCompression
            });
            
            console.log('💾 Enhanced session data saved successfully');
            
        } catch (error) {
            console.error('Error saving enhanced session data:', error);
            this.handleSaveError(error);
        }
    }

    // Data compression for storage optimization
    compressSessionData(data) {
        try {
            // Remove unnecessary fields for compression
            const compressedData = {
                id: data.id,
                startTime: data.startTime,
                postsRead: data.postsRead,
                adClicks: data.adClicks,
                totalReadingTime: data.totalReadingTime,
                pagesVisited: data.pagesVisited.slice(-10), // Keep only last 10 pages
                personalityType: data.personalityType,
                deviceType: data.deviceType,
                riskLevel: data.riskLevel,
                status: data.status,
                lastUpdate: data.lastUpdate,
                sessionDuration: data.sessionDuration
            };
            
            return compressedData;
        } catch (error) {
            console.warn('Compression failed, using original data:', error);
            return data;
        }
    }

    // Session backup creation
    createSessionBackup(data) {
        try {
            const backupKey = `smartAdSense_backup_${this.sessionId}_${Date.now()}`;
            const backupData = {
                ...data,
                backupTime: Date.now(),
                originalSessionId: this.sessionId
            };
            
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // Limit backup count
            this.cleanupOldBackups();
            
            console.log('💾 Session backup created');
        } catch (error) {
            console.warn('Failed to create session backup:', error);
        }
    }

    // Cleanup old backups
    cleanupOldBackups() {
        try {
            const backupKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('smartAdSense_backup_')
            );
            
            if (backupKeys.length > this.config.maxBackupCount) {
                // Sort by timestamp and remove oldest
                backupKeys.sort((a, b) => {
                    const timeA = parseInt(a.split('_').pop());
                    const timeB = parseInt(b.split('_').pop());
                    return timeA - timeB;
                });
                
                const toRemove = backupKeys.slice(0, backupKeys.length - this.config.maxBackupCount);
                toRemove.forEach(key => localStorage.removeItem(key));
                
                console.log(`🧹 Cleaned up ${toRemove.length} old backups`);
            }
        } catch (error) {
            console.warn('Error cleaning up backups:', error);
        }
    }

    // Enhanced session monitoring
    setupSessionMonitoringEnhanced() {
        // Monitor session with configurable interval
        this.monitoringInterval = setInterval(() => {
            this.checkSessionStatusEnhanced();
            this.updateSessionStatsEnhanced();
            this.analyzePerformance();
            this.optimizeSession();
        }, this.config.monitoringInterval);
    }

    // Enhanced auto-save with optimization
    setupAutoSaveEnhanced() {
        // Auto-save session data with adaptive intervals
        this.autoSaveInterval = setInterval(() => {
            this.saveSessionDataEnhanced();
            this.updatePerformanceMetrics();
        }, this.config.autoSaveInterval);
    }

    // Performance optimization setup
    setupPerformanceOptimization() {
        // Optimize session performance periodically
        this.optimizationInterval = setInterval(() => {
            this.optimizeSessionPerformance();
            this.updateAdaptiveLimits();
        }, this.config.cleanupInterval);
    }

    // Memory cleanup setup
    setupMemoryCleanup() {
        // Clean up memory periodically
        this.cleanupInterval = setInterval(() => {
            this.cleanupMemory();
        }, this.config.cleanupInterval);
    }

    // Initialize adaptive limits for session optimization
    initializeAdaptiveLimits() {
        try {
            // Initialize adaptive limits based on configuration
            this.sessionData.optimization.adaptiveLimits = {
                // Reading limits
                readingSpeed: {
                    min: this.config.minReadingTime,
                    max: this.config.maxReadingTime,
                    current: this.config.defaultReadingTime,
                    adaptive: true
                },
                
                // Interaction limits
                interactionFrequency: {
                    min: this.config.minInteractionDelay,
                    max: this.config.maxInteractionDelay,
                    current: this.config.defaultInteractionDelay,
                    adaptive: true
                },
                
                // Navigation limits
                navigationDelay: {
                    min: this.config.minNavigationDelay,
                    max: this.config.maxNavigationDelay,
                    current: this.config.defaultNavigationDelay,
                    adaptive: true
                },
                
                // Performance thresholds
                performanceThresholds: {
                    memoryUsage: this.config.maxMemoryUsage,
                    cpuUsage: this.config.maxCpuUsage,
                    responseTime: this.config.maxResponseTime,
                    adaptive: true
                },
                
                // Risk management
                riskThresholds: {
                    maxRiskLevel: this.config.maxRiskLevel,
                    riskIncreaseRate: this.config.riskIncreaseRate,
                    riskDecreaseRate: this.config.riskDecreaseRate,
                    adaptive: true
                }
            };

            // Initialize optimization recommendations
            this.sessionData.optimization.recommendations = [
                {
                    type: 'performance',
                    priority: 'high',
                    message: 'Monitor session performance for optimization opportunities',
                    action: 'monitor'
                },
                {
                    type: 'memory',
                    priority: 'medium',
                    message: 'Regular memory cleanup recommended',
                    action: 'cleanup'
                },
                {
                    type: 'risk',
                    priority: 'low',
                    message: 'Session risk level is acceptable',
                    action: 'monitor'
                }
            ];

            console.log('🔄 Adaptive limits initialized successfully');
            
        } catch (error) {
            console.error('Error initializing adaptive limits:', error);
            // Fallback to default limits
            this.initializeDefaultLimits();
        }
    }

    // Fallback to default limits if adaptive initialization fails
    initializeDefaultLimits() {
        this.sessionData.optimization.adaptiveLimits = {
            readingSpeed: {
                min: 2000,
                max: 10000,
                current: 5000,
                adaptive: false
            },
            interactionFrequency: {
                min: 1000,
                max: 5000,
                current: 2000,
                adaptive: false
            },
            navigationDelay: {
                min: 2000,
                max: 8000,
                current: 4000,
                adaptive: false
            },
            performanceThresholds: {
                memoryUsage: 50,
                cpuUsage: 80,
                responseTime: 1000,
                adaptive: false
            },
            riskThresholds: {
                maxRiskLevel: 0.7,
                riskIncreaseRate: 0.1,
                riskDecreaseRate: 0.05,
                adaptive: false
            }
        };

        this.sessionData.optimization.recommendations = [
            {
                type: 'fallback',
                priority: 'high',
                message: 'Using default limits due to initialization error',
                action: 'retry'
            }
        ];

        console.log('⚠️ Default limits initialized as fallback');
    }

    // Enhanced session status checking
    checkSessionStatusEnhanced() {
        const currentTime = Date.now();
        const sessionDuration = currentTime - this.sessionStartTime;

        // Check if session has exceeded maximum duration
        if (sessionDuration > this.config.maxSessionDuration) {
            this.endSession('timeout');
            return;
        }

        // Check if session has reached post limit
        if (this.sessionData.postsRead >= this.config.maxPostsPerSession) {
            this.endSession('posts_limit');
            return;
        }

        // Check if session has reached ad click limit
        if (this.sessionData.adClicks >= this.config.maxAdClicksPerSession) {
            this.endSession('clicks_limit');
            return;
        }

        // Check if session has reached page limit
        if (this.sessionData.pagesVisited.length >= this.config.maxPagesPerSession) {
            this.endSession('pages_limit');
            return;
        }

        // Update risk level based on behavior
        this.updateRiskLevel();
        
        // Check for performance issues
        this.checkPerformanceIssues();
    }

    // Enhanced session stats update
    updateSessionStatsEnhanced() {
        const currentTime = Date.now();
        const sessionDuration = currentTime - this.sessionStartTime;
        
        // Update performance metrics
        this.sessionData.performance.sessionDuration = sessionDuration;
        this.sessionData.performance.averageReadingTime = 
            this.sessionData.postsRead > 0 ? 
            this.sessionData.totalReadingTime / this.sessionData.postsRead : 0;
        
        // Update user behavior patterns
        this.updateUserBehaviorPatterns();
        
        // Update optimization data
        this.updateOptimizationData();
        
        // Update performance history
        this.updatePerformanceHistory();
    }

    // Performance analysis
    analyzePerformance() {
        try {
            const currentMetrics = this.getCurrentPerformanceMetrics();
            
            // Analyze reading patterns
            const readingEfficiency = this.analyzeReadingEfficiency();
            
            // Analyze click patterns
            const clickEfficiency = this.analyzeClickEfficiency();
            
            // Analyze navigation patterns
            const navigationEfficiency = this.analyzeNavigationEfficiency();
            
            // Update performance cache
            this.performanceCache.set('current', {
                metrics: currentMetrics,
                efficiency: {
                    reading: readingEfficiency,
                    clicks: clickEfficiency,
                    navigation: navigationEfficiency
                },
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.warn('Error analyzing performance:', error);
        }
    }

    // Session optimization
    optimizeSession() {
        try {
            const currentPerformance = this.performanceCache.get('current');
            if (!currentPerformance) return;
            
            const recommendations = [];
            
            // Check reading efficiency
            if (currentPerformance.efficiency.reading < 0.7) {
                recommendations.push({
                    type: 'reading',
                    priority: 'medium',
                    message: 'Consider adjusting reading speed for better efficiency',
                    action: 'adjustReadingSpeed'
                });
            }
            
            // Check click efficiency
            if (currentPerformance.efficiency.clicks < 0.8) {
                recommendations.push({
                    type: 'clicks',
                    priority: 'high',
                    message: 'Ad click success rate could be improved',
                    action: 'improveClickAccuracy'
                });
            }
            
            // Check navigation efficiency
            if (currentPerformance.efficiency.navigation < 0.6) {
                recommendations.push({
                    type: 'navigation',
                    priority: 'medium',
                    message: 'Navigation patterns could be optimized',
                    action: 'optimizeNavigation'
                });
            }
            
            // Update optimization data
            this.sessionData.optimization.recommendations = recommendations;
            this.sessionData.optimization.lastUpdate = Date.now();
            
            // Store optimization history
            this.optimizationHistory.push({
                timestamp: Date.now(),
                recommendations: recommendations,
                performance: currentPerformance
            });
            
        } catch (error) {
            console.warn('Error optimizing session:', error);
        }
    }

    // Performance optimization
    optimizeSessionPerformance() {
        try {
            // Analyze historical performance
            const historicalPerformance = this.analyzeHistoricalPerformance();
            
            // Update adaptive limits based on performance
            this.updateAdaptiveLimits(historicalPerformance);
            
            // Optimize intervals based on performance
            this.optimizeIntervals(historicalPerformance);
            
            // Update performance metrics
            this.performanceMetrics.lastOptimization = Date.now();
            
        } catch (error) {
            console.warn('Error optimizing session performance:', error);
        }
    }

    // Update adaptive limits
    updateAdaptiveLimits(historicalPerformance = null) {
        try {
            if (!historicalPerformance) {
                historicalPerformance = this.analyzeHistoricalPerformance();
            }
            
            const adaptiveLimits = {
                readingTime: this.calculateOptimalReadingTime(historicalPerformance),
                clickDelay: this.calculateOptimalClickDelay(historicalPerformance),
                navigationDelay: this.calculateOptimalNavigationDelay(historicalPerformance),
                riskThreshold: this.calculateOptimalRiskThreshold(historicalPerformance)
            };
            
            this.sessionData.optimization.adaptiveLimits = adaptiveLimits;
            
            // Apply adaptive limits
            this.applyAdaptiveLimits(adaptiveLimits);
            
        } catch (error) {
            console.warn('Error updating adaptive limits:', error);
        }
    }

    // Memory cleanup
    cleanupMemory() {
        const now = Date.now();
        const cutoffTime = now - (this.config.cleanupInterval * 2);

        // Cleanup session cache
        for (const [key, value] of this.sessionCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.sessionCache.delete(key);
            }
        }

        // Cleanup analytics cache
        for (const [key, value] of this.analyticsCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.analyticsCache.delete(key);
            }
        }

        // Cleanup performance cache
        for (const [key, value] of this.performanceCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.performanceCache.delete(key);
            }
        }

        // Limit session history
        if (this.sessionHistory.length > this.config.maxSessionHistory) {
            this.sessionHistory = this.sessionHistory.slice(-this.config.maxSessionHistory);
        }

        // Limit performance history
        if (this.performanceHistory.length > this.config.maxSessionHistory) {
            this.performanceHistory = this.performanceHistory.slice(-this.config.maxSessionHistory);
        }

        // Limit optimization history
        if (this.optimizationHistory.length > this.config.maxSessionHistory) {
            this.optimizationHistory = this.optimizationHistory.slice(-this.config.maxSessionHistory);
        }

        this.lastCleanup = now;
        console.log('🧹 Session Manager memory cleanup completed');
    }

    // Enhanced session ending
    endSession(reason) {
        const endTime = Date.now();
        const sessionDuration = endTime - this.sessionStartTime;
        
        this.sessionData.status = 'completed';
        this.sessionData.endTime = endTime;
        this.sessionData.endReason = reason;
        this.sessionData.sessionDuration = sessionDuration;
        
        // Calculate final metrics
        this.calculateFinalMetrics();

        // Save final session data
        this.saveSessionDataEnhanced();
        
        // Add to session history
        this.addToSessionHistory();
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Send completion message
        this.sendSessionCompletionMessage();
        
        // Cleanup
        this.cleanup();
        
        console.log(`🏁 Session ended: ${reason}`, {
            duration: this.formatDuration(sessionDuration),
            postsRead: this.sessionData.postsRead,
            adClicks: this.sessionData.adClicks
        });
    }

    // Calculate final metrics
    calculateFinalMetrics() {
        try {
            const sessionDuration = this.sessionData.sessionDuration;
            
            // Calculate success rate
            const totalActions = this.sessionData.postsRead + this.sessionData.adClicks;
            this.sessionData.performance.successRate = 
                totalActions > 0 ? (this.sessionData.postsRead / totalActions) : 0;
            
            // Calculate efficiency metrics
            this.sessionData.performance.efficiency = {
                postsPerMinute: this.sessionData.postsRead / (sessionDuration / 60000),
                clicksPerMinute: this.sessionData.adClicks / (sessionDuration / 60000),
                averageTimePerPost: this.sessionData.totalReadingTime / this.sessionData.postsRead || 0
            };
            
            // Calculate quality metrics
            this.sessionData.performance.quality = {
                readingConsistency: this.calculateReadingConsistency(),
                clickAccuracy: this.calculateClickAccuracy(),
                navigationEfficiency: this.calculateNavigationEfficiency()
            };
            
        } catch (error) {
            console.warn('Error calculating final metrics:', error);
        }
    }

    // Add to session history
    addToSessionHistory() {
        try {
            const historyEntry = {
            id: this.sessionId,
                startTime: this.sessionStartTime,
                endTime: this.sessionData.endTime,
                duration: this.sessionData.sessionDuration,
            postsRead: this.sessionData.postsRead,
            adClicks: this.sessionData.adClicks,
                performance: this.sessionData.performance,
                optimization: this.sessionData.optimization,
                endReason: this.sessionData.endReason
            };
            
            this.sessionHistory.push(historyEntry);
            
            // Update performance metrics
            this.performanceMetrics.totalSessions++;
            this.performanceMetrics.totalPostsRead += this.sessionData.postsRead;
            this.performanceMetrics.totalAdClicks += this.sessionData.adClicks;
            this.performanceMetrics.totalReadingTime += this.sessionData.totalReadingTime;
            
            // Calculate averages
            this.performanceMetrics.averageSessionDuration = 
                this.performanceMetrics.totalSessions > 0 ? 
                this.performanceMetrics.totalReadingTime / this.performanceMetrics.totalSessions : 0;
            
            // Calculate success rate
            const totalActions = this.performanceMetrics.totalPostsRead + this.performanceMetrics.totalAdClicks;
            this.performanceMetrics.sessionSuccessRate = 
                totalActions > 0 ? 
                this.performanceMetrics.totalPostsRead / totalActions : 0;
            
        } catch (error) {
            console.warn('Error adding to session history:', error);
        }
    }

    // Enhanced utility methods
    getSessionProgress() {
        const postsProgress = (this.sessionData.postsRead / this.config.maxPostsPerSession) * 100;
        const clicksProgress = (this.sessionData.adClicks / this.config.maxAdClicksPerSession) * 100;
        const timeProgress = (this.getSessionDuration() / this.config.maxSessionDuration) * 100;
        const pagesProgress = (this.sessionData.pagesVisited.length / this.config.maxPagesPerSession) * 100;

        return {
            postsProgress: Math.min(postsProgress, 100),
            clicksProgress: Math.min(clicksProgress, 100),
            timeProgress: Math.min(timeProgress, 100),
            pagesProgress: Math.min(pagesProgress, 100),
            isComplete: this.sessionData.status === 'completed',
            overallProgress: Math.min((postsProgress + clicksProgress + timeProgress + pagesProgress) / 4, 100)
        };
    }

    // Enhanced session validation
    isSessionActive() {
        return this.sessionData.status === 'active' && 
               this.getSessionDuration() < this.config.maxSessionDuration;
    }

    isSessionComplete() {
        return this.sessionData.status === 'completed';
    }

    canReadMorePosts() {
        return this.sessionData.postsRead < this.config.maxPostsPerSession;
    }

    canClickMoreAds() {
        return this.sessionData.adClicks < this.config.maxAdClicksPerSession;
    }

    canVisitMorePages() {
        return this.sessionData.pagesVisited.length < this.config.maxPagesPerSession;
    }

    // Enhanced remaining calculations
    getRemainingPosts() {
        return Math.max(0, this.config.maxPostsPerSession - this.sessionData.postsRead);
    }

    getRemainingAdClicks() {
        return Math.max(0, this.config.maxAdClicksPerSession - this.sessionData.adClicks);
    }

    getRemainingPages() {
        return Math.max(0, this.config.maxPagesPerSession - this.sessionData.pagesVisited.length);
    }

    getRemainingTime() {
        return Math.max(0, this.config.maxSessionDuration - this.getSessionDuration());
    }

    // Enhanced session data export
    exportSessionData() {
        const exportData = {
            ...this.sessionData,
            exportTime: new Date().toISOString(),
            sessionDuration: this.getSessionDuration(),
            progress: this.getSessionProgress(),
            performance: this.getCurrentPerformanceMetrics(),
            optimization: this.getCurrentOptimizationData(),
            history: this.sessionHistory.slice(-10), // Last 10 sessions
            recommendations: this.getOptimizationRecommendations()
        };

        return exportData;
    }

    // Enhanced session reset
    resetSession() {
        // Store current session in history before reset
        if (this.sessionData.status === 'active') {
            this.addToSessionHistory();
        }
        
        // Generate new session ID
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        
        // Reset session data with enhanced structure
        this.sessionData = {
            id: this.sessionId,
            startTime: this.sessionStartTime,
            postsRead: 0,
            adClicks: 0,
            totalReadingTime: 0,
            pagesVisited: [],
            personalityType: null,
            deviceType: null,
            riskLevel: 'low',
            status: 'active',
            
            // Enhanced metrics
            performance: {
                averageReadingTime: 0,
                averagePageLoadTime: 0,
                cacheHitRate: 0,
                errorCount: 0,
                successRate: 0
            },
            
            // Advanced tracking
            userBehavior: {
                readingPatterns: [],
                clickPatterns: [],
                navigationPatterns: [],
                timeSpentPerPage: [],
                scrollDepth: []
            },
            
            // Session optimization
            optimization: {
                adaptiveLimits: {},
                performanceMetrics: {},
                recommendations: []
            }
        };

        // Save reset session
        this.saveSessionDataEnhanced();

        // Initialize adaptive limits for new session
        this.initializeAdaptiveLimits();

        console.log('🔄 Enhanced session reset completed');
    }

    // Enhanced cleanup
    cleanup() {
        // Stop all intervals
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        if (this.optimizationInterval) {
            clearInterval(this.optimizationInterval);
        }

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Save final data
        this.saveSessionDataEnhanced();
        
        // Final memory cleanup
        this.cleanupMemory();

        console.log('🧹 Enhanced session manager cleaned up');
    }

    // Enhanced utility methods
    getSessionDuration() {
        return Date.now() - this.sessionStartTime;
    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Performance monitoring methods
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            currentSession: {
                id: this.sessionId,
                duration: this.getSessionDuration(),
                progress: this.getSessionProgress(),
                performance: this.sessionData.performance
            },
            cache: {
                sessionCacheSize: this.sessionCache.size,
                analyticsCacheSize: this.analyticsCache.size,
                performanceCacheSize: this.performanceCache.size
            }
        };
    }

    getSessionHistory() {
        return {
            sessions: this.sessionHistory,
            totalSessions: this.sessionHistory.length,
            averageDuration: this.performanceMetrics.averageSessionDuration,
            successRate: this.performanceMetrics.sessionSuccessRate
        };
    }

    getOptimizationRecommendations() {
        return {
            current: this.sessionData.optimization.recommendations,
            historical: this.optimizationHistory.slice(-10),
            adaptiveLimits: this.sessionData.optimization.adaptiveLimits
        };
    }

    // Configuration management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Session Manager config updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Cache management
    clearCache() {
        this.sessionCache.clear();
        this.analyticsCache.clear();
        this.performanceCache.clear();
        console.log('🧹 All Session Manager caches cleared');
    }

    getCacheStats() {
        return {
            sessionCacheSize: this.sessionCache.size,
            analyticsCacheSize: this.analyticsCache.size,
            performanceCacheSize: this.performanceCache.size,
            lastCleanup: this.lastCleanup
        };
    }

    // Legacy method compatibility
    loadSessionData() {
        return this.loadSessionDataEnhanced();
    }

    saveSessionData() {
        return this.saveSessionDataEnhanced();
    }

    setupSessionMonitoring() {
        return this.setupSessionMonitoringEnhanced();
    }

    setupAutoSave() {
        return this.setupAutoSaveEnhanced();
    }

    checkSessionStatus() {
        return this.checkSessionStatusEnhanced();
    }

    updateSessionStats() {
        return this.updateSessionStatsEnhanced();
    }

    // Missing methods implementation
    mergeSessionData(existingData, newData) {
        try {
            // Deep merge with enhanced structure preservation
            const merged = { ...existingData };
            
            // Merge basic properties
            Object.keys(newData).forEach(key => {
                if (key === 'performance' || key === 'userBehavior' || key === 'optimization') {
                    // Deep merge for complex objects
                    merged[key] = { ...existingData[key], ...newData[key] };
                } else if (Array.isArray(newData[key])) {
                    // Merge arrays
                    merged[key] = [...(existingData[key] || []), ...newData[key]];
                } else {
                    // Simple property merge
                    merged[key] = newData[key];
                }
            });
            
            return merged;
        } catch (error) {
            console.warn('Error merging session data, using existing data:', error);
            return existingData;
        }
    }

    validateSessionData() {
        try {
            // Validate required fields
            const requiredFields = ['id', 'startTime', 'postsRead', 'adClicks', 'status'];
            const missingFields = requiredFields.filter(field => !this.sessionData[field]);
            
            if (missingFields.length > 0) {
                console.warn('Missing required session data fields:', missingFields);
                this.handleDataCorruption();
                return false;
            }
            
            // Validate data types
            if (typeof this.sessionData.postsRead !== 'number' || 
                typeof this.sessionData.adClicks !== 'number' ||
                typeof this.sessionData.startTime !== 'number') {
                console.warn('Invalid data types in session data');
                this.handleDataCorruption();
                return false;
            }
            
            console.log('✅ Session data validation passed');
            return true;
        } catch (error) {
            console.error('Error validating session data:', error);
            this.handleDataCorruption();
            return false;
        }
    }

    handleDataCorruption() {
        try {
            console.warn('🚨 Handling session data corruption...');
            
            // Create backup of corrupted data
            const backupKey = `smartAdSense_corrupted_${this.sessionId}_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(this.sessionData));
            
            // Reset to safe defaults
            this.sessionData = {
                id: this.sessionId,
                startTime: Date.now(),
                postsRead: 0,
                adClicks: 0,
                totalReadingTime: 0,
                pagesVisited: [],
                personalityType: null,
                deviceType: null,
                riskLevel: 'low',
                status: 'active',
                performance: {
                    averageReadingTime: 0,
                    averagePageLoadTime: 0,
                    cacheHitRate: 0,
                    errorCount: 0,
                    successRate: 0
                },
                userBehavior: {
                    readingPatterns: [],
                    clickPatterns: [],
                    navigationPatterns: [],
                    timeSpentPerPage: [],
                    scrollDepth: []
                },
                optimization: {
                    adaptiveLimits: {},
                    performanceMetrics: {},
                    recommendations: []
                }
            };
            
            console.log('✅ Session data corruption handled, reset to defaults');
        } catch (error) {
            console.error('Error handling data corruption:', error);
        }
    }

    handleSaveError(error) {
        try {
            console.error('🚨 Handling session save error:', error);
            
            // Increment error count
            this.sessionData.performance.errorCount++;
            
            // Try alternative save method
            try {
                const simpleData = {
                    id: this.sessionId,
                    startTime: this.sessionStartTime,
                    postsRead: this.sessionData.postsRead,
                    adClicks: this.sessionData.adClicks,
                    status: this.sessionData.status,
                    lastUpdate: Date.now()
                };
                
                localStorage.setItem('smartAdSense_session_simple_' + this.sessionId, JSON.stringify(simpleData));
                console.log('✅ Alternative save method succeeded');
            } catch (altError) {
                console.error('Alternative save method also failed:', altError);
            }
        } catch (error) {
            console.error('Error handling save error:', error);
        }
    }

    getCurrentPerformanceMetrics() {
        try {
            return {
                sessionDuration: this.getSessionDuration(),
                averageReadingTime: this.sessionData.performance.averageReadingTime,
                averagePageLoadTime: this.sessionData.performance.averagePageLoadTime,
                cacheHitRate: this.sessionData.performance.cacheHitRate,
                errorCount: this.sessionData.performance.errorCount,
                successRate: this.sessionData.performance.successRate,
                postsRead: this.sessionData.postsRead,
                adClicks: this.sessionData.adClicks,
                pagesVisited: this.sessionData.pagesVisited.length
            };
        } catch (error) {
            console.warn('Error getting current performance metrics:', error);
            return {};
        }
    }

    getCurrentOptimizationData() {
        try {
            return {
                recommendations: this.sessionData.optimization.recommendations || [],
                adaptiveLimits: this.sessionData.optimization.adaptiveLimits || {},
                performanceMetrics: this.sessionData.optimization.performanceMetrics || {},
                lastUpdate: this.sessionData.optimization.lastUpdate || null
            };
        } catch (error) {
            console.warn('Error getting current optimization data:', error);
            return {};
        }
    }

    updateRiskLevel() {
        try {
            // Calculate risk level based on behavior patterns
            let riskScore = 0;
            
            // Check for suspicious patterns
            if (this.sessionData.postsRead > this.config.maxPostsPerSession * 0.8) {
                riskScore += 0.2;
            }
            
            if (this.sessionData.adClicks > this.config.maxAdClicksPerSession * 0.8) {
                riskScore += 0.3;
            }
            
            if (this.sessionData.pagesVisited.length > this.config.maxPagesPerSession * 0.8) {
                riskScore += 0.1;
            }
            
            // Update risk level
            if (riskScore > 0.6) {
                this.sessionData.riskLevel = 'high';
            } else if (riskScore > 0.3) {
                this.sessionData.riskLevel = 'medium';
            } else {
                this.sessionData.riskLevel = 'low';
            }
            
            console.log(`🛡️ Risk level updated: ${this.sessionData.riskLevel} (score: ${riskScore.toFixed(2)})`);
        } catch (error) {
            console.warn('Error updating risk level:', error);
        }
    }

    checkPerformanceIssues() {
        try {
            const issues = [];
            const currentMetrics = this.getCurrentPerformanceMetrics();
            
            // Check for performance degradation
            if (currentMetrics.errorCount > 5) {
                issues.push({
                    type: 'error_count',
                    severity: 'high',
                    message: 'High error count detected',
                    action: 'investigate_errors'
                });
            }
            
            if (currentMetrics.cacheHitRate < 0.5) {
                issues.push({
                    type: 'cache_performance',
                    severity: 'medium',
                    message: 'Low cache hit rate',
                    action: 'optimize_caching'
                });
            }
            
            // Store issues for optimization
            if (issues.length > 0) {
                this.sessionData.optimization.performanceMetrics.issues = issues;
                console.log('⚠️ Performance issues detected:', issues);
            }
        } catch (error) {
            console.warn('Error checking performance issues:', error);
        }
    }

    analyzeHistoricalPerformance() {
        try {
            if (this.performanceHistory.length === 0) {
                return {
                    averageSessionDuration: 0,
                    averagePostsRead: 0,
                    averageAdClicks: 0,
                    successRate: 0
                };
            }
            
            const recentHistory = this.performanceHistory.slice(-10); // Last 10 entries
            
            const avgSessionDuration = recentHistory.reduce((sum, entry) => 
                sum + (entry.sessionDuration || 0), 0) / recentHistory.length;
            
            const avgPostsRead = recentHistory.reduce((sum, entry) => 
                sum + (entry.postsRead || 0), 0) / recentHistory.length;
            
            const avgAdClicks = recentHistory.reduce((sum, entry) => 
                sum + (entry.adClicks || 0), 0) / recentHistory.length;
            
            const successRate = recentHistory.reduce((sum, entry) => 
                sum + (entry.success ? 1 : 0), 0) / recentHistory.length;
            
            return {
                averageSessionDuration: avgSessionDuration,
                averagePostsRead: avgPostsRead,
                averageAdClicks: avgAdClicks,
                successRate: successRate
            };
        } catch (error) {
            console.warn('Error analyzing historical performance:', error);
            return {};
        }
    }

    optimizeIntervals(historicalPerformance) {
        try {
            // Optimize intervals based on historical performance
            if (historicalPerformance.successRate < 0.7) {
                // Reduce intervals for better monitoring
                this.config.monitoringInterval = Math.max(15000, this.config.monitoringInterval * 0.8);
                this.config.autoSaveInterval = Math.max(45000, this.config.autoSaveInterval * 0.8);
                console.log('⚡ Intervals optimized for better performance monitoring');
            } else if (historicalPerformance.successRate > 0.9) {
                // Increase intervals for efficiency
                this.config.monitoringInterval = Math.min(60000, this.config.monitoringInterval * 1.2);
                this.config.autoSaveInterval = Math.min(90000, this.config.autoSaveInterval * 1.2);
                console.log('⚡ Intervals optimized for efficiency');
            }
        } catch (error) {
            console.warn('Error optimizing intervals:', error);
        }
    }

    applyAdaptiveLimits(adaptiveLimits) {
        try {
            // Apply adaptive limits to current session
            if (adaptiveLimits.readingTime) {
                this.config.maxSessionDuration = Math.max(
                    this.config.maxSessionDuration * 0.8,
                    this.config.maxSessionDuration * adaptiveLimits.readingTime
                );
            }
            
            if (adaptiveLimits.clickDelay) {
                // Apply to click-related delays
                console.log('⚡ Adaptive click delays applied');
            }
            
            if (adaptiveLimits.navigationDelay) {
                // Apply to navigation-related delays
                console.log('⚡ Adaptive navigation delays applied');
            }
            
            console.log('✅ Adaptive limits applied:', adaptiveLimits);
        } catch (error) {
            console.warn('Error applying adaptive limits:', error);
        }
    }

    calculateReadingConsistency() {
        try {
            if (this.sessionData.userBehavior.readingPatterns.length === 0) {
                return 0.5; // Default consistency
            }
            
            const patterns = this.sessionData.userBehavior.readingPatterns;
            const timeSpent = patterns.map(p => p.timeSpent || 0);
            const avgTime = timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length;
            
            // Calculate variance
            const variance = timeSpent.reduce((sum, time) => 
                sum + Math.pow(time - avgTime, 2), 0) / timeSpent.length;
            
            // Lower variance = higher consistency
            const consistency = Math.max(0, 1 - (variance / (avgTime * avgTime)));
            return Math.min(1, consistency);
        } catch (error) {
            console.warn('Error calculating reading consistency:', error);
            return 0.5;
        }
    }

    calculateClickAccuracy() {
        try {
            if (this.clickHistory && this.clickHistory.length > 0) {
                const successfulClicks = this.clickHistory.filter(click => click.success).length;
                return successfulClicks / this.clickHistory.length;
            }
            return 1.0; // Default accuracy
        } catch (error) {
            console.warn('Error calculating click accuracy:', error);
            return 1.0;
        }
    }

    calculateNavigationEfficiency() {
        try {
            if (this.sessionData.userBehavior.navigationPatterns.length === 0) {
                return 0.5; // Default efficiency
            }
            
            const patterns = this.sessionData.userBehavior.navigationPatterns;
            const successfulNavigations = patterns.filter(p => p.success).length;
            return successfulNavigations / patterns.length;
        } catch (error) {
            console.warn('Error calculating navigation efficiency:', error);
            return 0.5;
        }
    }

    sendSessionCompletionMessage() {
        try {
            // Send message to background script about session completion
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({
                    action: 'sessionCompleted',
                    sessionData: this.sessionData
                }).catch(() => {
                    // Ignore errors if background script is not available
                    console.log('ℹ️ Background script not available for session completion message');
                });
            } else {
                console.log('ℹ️ Chrome runtime not available for session completion message');
            }
        } catch (error) {
            console.warn('Error sending session completion message:', error);
        }
    }

    loadSessionHistory() {
        try {
            // Load session history from localStorage
            const historyKey = 'smartAdSense_sessionHistory';
            const savedHistory = localStorage.getItem(historyKey);
            
            if (savedHistory) {
                this.sessionHistory = JSON.parse(savedHistory);
                console.log('📊 Session history loaded:', this.sessionHistory.length, 'sessions');
            }
        } catch (error) {
            console.warn('Error loading session history:', error);
            this.sessionHistory = [];
        }
    }

    updateUserBehaviorPatterns() {
        try {
            // Update user behavior patterns based on current session
            const currentTime = Date.now();
            
            // Reading pattern
            if (this.sessionData.postsRead > 0) {
                this.sessionData.userBehavior.readingPatterns.push({
                    timestamp: currentTime,
                    postsRead: this.sessionData.postsRead,
                    timeSpent: this.sessionData.totalReadingTime,
                    pattern: 'progressive'
                });
            }
            
            // Click pattern
            if (this.sessionData.adClicks > 0) {
                this.sessionData.userBehavior.clickPatterns.push({
                    timestamp: currentTime,
                    clicks: this.sessionData.adClicks,
                    pattern: 'selective'
                });
            }
            
            // Navigation pattern
            if (this.sessionData.pagesVisited.length > 0) {
                this.sessionData.userBehavior.navigationPatterns.push({
                    timestamp: currentTime,
                    pagesVisited: this.sessionData.pagesVisited.length,
                    pattern: 'exploratory'
                });
            }
            
            // Limit pattern arrays
            ['readingPatterns', 'clickPatterns', 'navigationPatterns'].forEach(key => {
                if (this.sessionData.userBehavior[key].length > 20) {
                    this.sessionData.userBehavior[key] = this.sessionData.userBehavior[key].slice(-20);
                }
            });
        } catch (error) {
            console.warn('Error updating user behavior patterns:', error);
        }
    }

    updateOptimizationData() {
        try {
            // Update optimization data based on current performance
            const currentMetrics = this.getCurrentPerformanceMetrics();
            
            this.sessionData.optimization.performanceMetrics = {
                ...this.sessionData.optimization.performanceMetrics,
                current: currentMetrics,
                lastUpdate: Date.now()
            };
            
            // Generate new recommendations if needed
            if (!this.sessionData.optimization.recommendations || 
                this.sessionData.optimization.recommendations.length === 0) {
                this.generateOptimizationRecommendations();
            }
        } catch (error) {
            console.warn('Error updating optimization data:', error);
        }
    }

    updatePerformanceHistory() {
        try {
            const currentEntry = {
                timestamp: Date.now(),
                sessionDuration: this.getSessionDuration(),
                postsRead: this.sessionData.postsRead,
                adClicks: this.sessionData.adClicks,
                success: this.sessionData.status === 'active',
                performance: this.getCurrentPerformanceMetrics()
            };
            
            this.performanceHistory.push(currentEntry);
            
            // Limit history size
            if (this.performanceHistory.length > this.config.maxSessionHistory) {
                this.performanceHistory = this.performanceHistory.slice(-this.config.maxSessionHistory);
            }
        } catch (error) {
            console.warn('Error updating performance history:', error);
        }
    }

    generateOptimizationRecommendations() {
        try {
            const recommendations = [];
            const currentMetrics = this.getCurrentPerformanceMetrics();
            
            // Reading efficiency recommendations
            if (currentMetrics.averageReadingTime < 30000) { // Less than 30 seconds
                recommendations.push({
                    type: 'reading',
                    priority: 'medium',
                    message: 'Consider spending more time reading posts for better engagement',
                    action: 'increase_reading_time'
                });
            }
            
            // Click efficiency recommendations
            if (currentMetrics.adClicks === 0) {
                recommendations.push({
                    type: 'clicks',
                    priority: 'high',
                    message: 'No ad clicks detected. Consider enabling ad interaction',
                    action: 'enable_ad_clicks'
                });
            }
            
            // Session duration recommendations
            if (currentMetrics.sessionDuration < 300000) { // Less than 5 minutes
                recommendations.push({
                    type: 'session',
                    priority: 'low',
                    message: 'Session duration is short. Consider longer engagement',
                    action: 'extend_session'
                });
            }
            
            this.sessionData.optimization.recommendations = recommendations;
        } catch (error) {
            console.warn('Error generating optimization recommendations:', error);
        }
    }

    updatePerformanceMetrics() {
        try {
            // Update global performance metrics
            this.performanceMetrics.lastUpdate = Date.now();
            
            // Update cache metrics
            const totalCacheSize = this.sessionCache.size + this.analyticsCache.size + this.performanceCache.size;
            this.performanceMetrics.cacheSize = totalCacheSize;
            
            // Calculate cache hit rate
            const totalRequests = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
            if (totalRequests > 0) {
                this.performanceMetrics.cacheHitRate = this.performanceMetrics.cacheHits / totalRequests;
            }
        } catch (error) {
            console.warn('Error updating performance metrics:', error);
        }
    }

    // Missing efficiency analysis methods
    analyzeReadingEfficiency() {
        try {
            if (this.sessionData.userBehavior.readingPatterns.length === 0) {
                return 0.5; // Default efficiency
            }
            
            const patterns = this.sessionData.userBehavior.readingPatterns;
            const timeSpent = patterns.map(p => p.timeSpent || 0);
            const avgTime = timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length;
            
            // Calculate efficiency based on reading time consistency
            // Lower variance = higher efficiency
            const variance = timeSpent.reduce((sum, time) => 
                sum + Math.pow(time - avgTime, 2), 0) / timeSpent.length;
            
            const efficiency = Math.max(0, 1 - (variance / (avgTime * avgTime)));
            return Math.min(1, efficiency);
        } catch (error) {
            console.warn('Error analyzing reading efficiency:', error);
            return 0.5;
        }
    }

    analyzeClickEfficiency() {
        try {
            // Analyze click efficiency based on success rate
            if (this.sessionData.adClicks === 0) {
                return 1.0; // No clicks means no failures
            }
            
            // For now, return a default efficiency
            // In a real implementation, this would analyze actual click success rates
            return 0.8; // Default 80% efficiency
        } catch (error) {
            console.warn('Error analyzing click efficiency:', error);
            return 0.8;
        }
    }

    analyzeNavigationEfficiency() {
        try {
            if (this.sessionData.userBehavior.navigationPatterns.length === 0) {
                return 0.5; // Default efficiency
            }
            
            const patterns = this.sessionData.userBehavior.navigationPatterns;
            const successfulNavigations = patterns.filter(p => p.success).length;
            const efficiency = successfulNavigations / patterns.length;
            
            return Math.max(0, Math.min(1, efficiency));
        } catch (error) {
            console.warn('Error analyzing navigation efficiency:', error);
            return 0.5;
        }
    }

    // Calculate optimal reading time based on historical performance
    calculateOptimalReadingTime(historicalPerformance) {
        try {
            if (!historicalPerformance || !historicalPerformance.readingEfficiency) {
                return this.config.defaultReadingTime;
            }

            const baseTime = this.config.defaultReadingTime;
            const efficiency = historicalPerformance.readingEfficiency;
            
            // Adjust reading time based on efficiency
            // Higher efficiency = shorter reading time (user reads faster)
            // Lower efficiency = longer reading time (user needs more time)
            const efficiencyMultiplier = 1 + (0.5 - efficiency); // 0.5 to 1.5 range
            
            const optimalTime = Math.round(baseTime * efficiencyMultiplier);
            
            // Ensure within bounds
            const minTime = this.config.minReadingTime;
            const maxTime = this.config.maxReadingTime;
            
            return Math.max(minTime, Math.min(maxTime, optimalTime));
            
        } catch (error) {
            console.warn('Error calculating optimal reading time:', error);
            return this.config.defaultReadingTime;
        }
    }

    // Calculate optimal click delay based on historical performance
    calculateOptimalClickDelay(historicalPerformance) {
        try {
            if (!historicalPerformance || !historicalPerformance.clickEfficiency) {
                return this.config.defaultClickDelay;
            }

            const baseDelay = this.config.defaultClickDelay;
            const efficiency = historicalPerformance.clickEfficiency;
            
            // Adjust click delay based on efficiency
            // Higher efficiency = shorter delay (user clicks more naturally)
            // Lower efficiency = longer delay (user needs more time between clicks)
            const efficiencyMultiplier = 1 + (0.3 - efficiency * 0.6); // 0.7 to 1.3 range
            
            const optimalDelay = Math.round(baseDelay * efficiencyMultiplier);
            
            // Ensure within bounds
            const minDelay = this.config.minClickDelay;
            const maxDelay = this.config.maxClickDelay;
            
            return Math.max(minDelay, Math.min(maxDelay, optimalDelay));
            
        } catch (error) {
            console.warn('Error calculating optimal click delay:', error);
            return this.config.defaultClickDelay;
        }
    }

    // Calculate optimal navigation delay based on historical performance
    calculateOptimalNavigationDelay(historicalPerformance) {
        try {
            if (!historicalPerformance || !historicalPerformance.navigationEfficiency) {
                return this.config.defaultNavigationDelay;
            }

            const baseDelay = this.config.defaultNavigationDelay;
            const efficiency = historicalPerformance.navigationEfficiency;
            
            // Adjust navigation delay based on efficiency
            // Higher efficiency = shorter delay (user navigates more naturally)
            // Lower efficiency = longer delay (user needs more time to process)
            const efficiencyMultiplier = 1 + (0.4 - efficiency * 0.8); // 0.6 to 1.4 range
            
            const optimalDelay = Math.round(baseDelay * efficiencyMultiplier);
            
            // Ensure within bounds
            const minDelay = this.config.minNavigationDelay;
            const maxDelay = this.config.maxNavigationDelay;
            
            return Math.max(minDelay, Math.min(maxDelay, optimalDelay));
            
        } catch (error) {
            console.warn('Error calculating optimal navigation delay:', error);
            return this.config.defaultNavigationDelay;
        }
    }

    // Calculate optimal risk threshold based on historical performance
    calculateOptimalRiskThreshold(historicalPerformance) {
        try {
            if (!historicalPerformance || !historicalPerformance.overallEfficiency) {
                return this.config.defaultRiskThreshold;
            }

            const baseThreshold = this.config.defaultRiskThreshold;
            const efficiency = historicalPerformance.overallEfficiency;
            
            // Adjust risk threshold based on efficiency
            // Higher efficiency = higher threshold (user can handle more risk)
            // Lower efficiency = lower threshold (user needs safer approach)
            const efficiencyMultiplier = 0.8 + (efficiency * 0.4); // 0.8 to 1.2 range
            
            const optimalThreshold = baseThreshold * efficiencyMultiplier;
            
            // Ensure within bounds
            const minThreshold = this.config.minRiskThreshold;
            const maxThreshold = this.config.maxRiskThreshold;
            
            return Math.max(minThreshold, Math.min(maxThreshold, optimalThreshold));
            
        } catch (error) {
            console.warn('Error calculating optimal risk threshold:', error);
            return this.config.defaultRiskThreshold;
        }
    }

    // Apply adaptive limits to current session
    applyAdaptiveLimits(adaptiveLimits) {
        try {
            if (!adaptiveLimits) {
                console.warn('No adaptive limits provided to apply');
                return;
            }

            // Apply reading time limits
            if (adaptiveLimits.readingTime) {
                this.sessionData.optimization.currentReadingTime = adaptiveLimits.readingTime;
                console.log(`📖 Applied optimal reading time: ${adaptiveLimits.readingTime}ms`);
            }

            // Apply click delay limits
            if (adaptiveLimits.clickDelay) {
                this.sessionData.optimization.currentClickDelay = adaptiveLimits.clickDelay;
                console.log(`🖱️ Applied optimal click delay: ${adaptiveLimits.clickDelay}ms`);
            }

            // Apply navigation delay limits
            if (adaptiveLimits.navigationDelay) {
                this.sessionData.optimization.currentNavigationDelay = adaptiveLimits.navigationDelay;
                console.log(`🧭 Applied optimal navigation delay: ${adaptiveLimits.navigationDelay}ms`);
            }

            // Apply risk threshold limits
            if (adaptiveLimits.riskThreshold) {
                this.sessionData.optimization.currentRiskThreshold = adaptiveLimits.riskThreshold;
                console.log(`⚠️ Applied optimal risk threshold: ${adaptiveLimits.riskThreshold}`);
            }

            // Update session data
            this.sessionData.optimization.lastAdaptiveUpdate = Date.now();
            this.sessionData.optimization.adaptiveLimitsApplied = true;

            console.log('✅ Adaptive limits applied successfully');
            
        } catch (error) {
            console.error('Error applying adaptive limits:', error);
        }
    }
}
