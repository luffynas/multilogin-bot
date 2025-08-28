/**
 * Session Manager - Handles session lifecycle and data persistence
 */

class SessionManager {
    constructor() {
        this.currentSession = null;
        this.sessionHistory = [];
        this.isActive = false;
        
        this.sessionConfig = {
            autoSave: true,
            saveInterval: 30000, // 30 seconds
            maxHistorySize: 100,
            dataRetention: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        
        this.saveTimer = null;
    }

    /**
     * Initialize session manager
     */
    async initialize() {
        // Load existing session if available
        await this.loadSession();
        
        // Start auto-save timer
        if (this.sessionConfig.autoSave) {
            this.startAutoSave();
        }
        
        return this.currentSession;
    }

    /**
     * Start new session
     */
    async startSession(options = {}) {
        const sessionId = this.generateSessionId();
        
        this.currentSession = {
            id: sessionId,
            startTime: Date.now(),
            endTime: null,
            status: 'active',
            personality: options.personality || null,
            deviceInfo: this.getDeviceInfo(),
            browserInfo: this.getBrowserInfo(),
            initialUrl: window.location.href,
            pages: [],
            interactions: [],
            adsenseData: {
                adsDetected: 0,
                adsClicked: 0,
                adsHovered: 0,
                rpmScore: 0,
                highValueClicks: 0
            },
            behaviorMetrics: {
                mouseMovements: 0,
                clicks: 0,
                scrolls: 0,
                typingEvents: 0,
                readingTime: 0
            },
            navigationData: {
                pagesVisited: 0,
                timeOnSite: 0,
                bounceRate: 0,
                exitPage: null
            },
            performance: {
                loadTimes: [],
                responseTimes: [],
                errors: []
            },
            settings: {
                personalityType: options.personalityType || 'auto',
                automationLevel: options.automationLevel || 'medium',
                targetRPM: options.targetRPM || 0
            }
        };
        
        this.isActive = true;
        
        // Save session immediately
        await this.saveSession();
        
        // Add to history
        this.addToHistory(this.currentSession);
        
        return this.currentSession;
    }

    /**
     * End current session
     */
    async endSession(reason = 'manual') {
        if (!this.currentSession || !this.isActive) return;
        
        this.currentSession.endTime = Date.now();
        this.currentSession.status = 'completed';
        this.currentSession.endReason = reason;
        
        // Calculate final metrics
        this.calculateFinalMetrics();
        
        // Save session
        await this.saveSession();
        
        this.isActive = false;
        
        // Stop auto-save
        this.stopAutoSave();
        
        return this.currentSession;
    }

    /**
     * Add page visit to session
     */
    addPageVisit(pageData) {
        if (!this.currentSession) return;
        
        const pageVisit = {
            url: pageData.url || window.location.href,
            title: pageData.title || document.title,
            timestamp: Date.now(),
            timeSpent: pageData.timeSpent || 0,
            interactions: pageData.interactions || [],
            adsenseData: pageData.adsenseData || {},
            scrollDepth: pageData.scrollDepth || 0,
            readingTime: pageData.readingTime || 0
        };
        
        this.currentSession.pages.push(pageVisit);
        this.currentSession.navigationData.pagesVisited = this.currentSession.pages.length;
        
        // Auto-save if enabled
        if (this.sessionConfig.autoSave) {
            this.scheduleSave();
        }
    }

    /**
     * Add interaction to session
     */
    addInteraction(interaction) {
        if (!this.currentSession) return;
        
        const sessionInteraction = {
            ...interaction,
            timestamp: Date.now(),
            sessionId: this.currentSession.id
        };
        
        this.currentSession.interactions.push(sessionInteraction);
        
        // Update behavior metrics
        this.updateBehaviorMetrics(interaction);
        
        // Auto-save if enabled
        if (this.sessionConfig.autoSave) {
            this.scheduleSave();
        }
    }

    /**
     * Update AdSense data
     */
    updateAdSenseData(adsenseData) {
        if (!this.currentSession) return;
        
        this.currentSession.adsenseData = {
            ...this.currentSession.adsenseData,
            ...adsenseData
        };
        
        // Auto-save if enabled
        if (this.sessionConfig.autoSave) {
            this.scheduleSave();
        }
    }

    /**
     * Update behavior metrics
     */
    updateBehaviorMetrics(interaction) {
        if (!this.currentSession) return;
        
        const metrics = this.currentSession.behaviorMetrics;
        
        switch (interaction.type) {
            case 'mouse_movement':
                metrics.mouseMovements++;
                break;
            case 'click':
                metrics.clicks++;
                break;
            case 'scroll':
                metrics.scrolls++;
                break;
            case 'typing':
                metrics.typingEvents++;
                break;
            case 'reading':
                metrics.readingTime += interaction.duration || 0;
                break;
        }
    }

    /**
     * Calculate final session metrics
     */
    calculateFinalMetrics() {
        if (!this.currentSession) return;
        
        const session = this.currentSession;
        const duration = session.endTime - session.startTime;
        
        // Calculate time on site
        session.navigationData.timeOnSite = duration;
        
        // Calculate bounce rate
        if (session.pages.length <= 1) {
            session.navigationData.bounceRate = 100;
        } else {
            session.navigationData.bounceRate = 0;
        }
        
        // Set exit page
        if (session.pages.length > 0) {
            const lastPage = session.pages[session.pages.length - 1];
            session.navigationData.exitPage = lastPage.url;
        }
        
        // Calculate RPM score
        if (session.adsenseData.adsDetected > 0) {
            const clickRate = session.adsenseData.adsClicked / session.adsenseData.adsDetected;
            const highValueRate = session.adsenseData.highValueClicks / session.adsenseData.adsClicked;
            const engagementRate = session.behaviorMetrics.readingTime / duration;
            
            session.adsenseData.rpmScore = (
                clickRate * 0.4 +
                highValueRate * 0.4 +
                engagementRate * 0.2
            ) * 100;
        }
    }

    /**
     * Save session to storage
     */
    async saveSession() {
        if (!this.currentSession) return;
        
        try {
            const sessionData = {
                ...this.currentSession,
                lastSaved: Date.now()
            };
            
            await chrome.storage.local.set({
                [`session_${this.currentSession.id}`]: sessionData
            });
            
            // Also save as current session
            await chrome.storage.local.set({
                'currentSession': sessionData
            });
            
            console.log('Session saved:', this.currentSession.id);
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    /**
     * Load session from storage
     */
    async loadSession() {
        try {
            const result = await chrome.storage.local.get(['currentSession']);
            
            if (result.currentSession) {
                this.currentSession = result.currentSession;
                this.isActive = this.currentSession.status === 'active';
                
                // Resume auto-save if session is active
                if (this.isActive && this.sessionConfig.autoSave) {
                    this.startAutoSave();
                }
                
                console.log('Session loaded:', this.currentSession.id);
            }
        } catch (error) {
            console.error('Error loading session:', error);
        }
    }

    /**
     * Load session history
     */
    async loadSessionHistory() {
        try {
            const result = await chrome.storage.local.get(null);
            const sessions = [];
            
            for (const [key, value] of Object.entries(result)) {
                if (key.startsWith('session_') && value.id) {
                    sessions.push(value);
                }
            }
            
            // Sort by start time (newest first)
            sessions.sort((a, b) => b.startTime - a.startTime);
            
            // Limit history size
            this.sessionHistory = sessions.slice(0, this.sessionConfig.maxHistorySize);
            
            return this.sessionHistory;
        } catch (error) {
            console.error('Error loading session history:', error);
            return [];
        }
    }

    /**
     * Add session to history
     */
    addToHistory(session) {
        this.sessionHistory.unshift(session);
        
        // Limit history size
        if (this.sessionHistory.length > this.sessionConfig.maxHistorySize) {
            this.sessionHistory = this.sessionHistory.slice(0, this.sessionConfig.maxHistorySize);
        }
    }

    /**
     * Start auto-save timer
     */
    startAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
        }
        
        this.saveTimer = setInterval(() => {
            if (this.isActive && this.currentSession) {
                this.saveSession();
            }
        }, this.sessionConfig.saveInterval);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }

    /**
     * Schedule save (debounced)
     */
    scheduleSave() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        
        this.saveTimer = setTimeout(() => {
            if (this.isActive && this.currentSession) {
                this.saveSession();
            }
        }, 5000); // Save after 5 seconds of inactivity
    }

    /**
     * Clean up old sessions
     */
    async cleanupOldSessions() {
        try {
            const cutoffTime = Date.now() - this.sessionConfig.dataRetention;
            const result = await chrome.storage.local.get(null);
            const keysToDelete = [];
            
            for (const [key, value] of Object.entries(result)) {
                if (key.startsWith('session_') && value.startTime < cutoffTime) {
                    keysToDelete.push(key);
                }
            }
            
            if (keysToDelete.length > 0) {
                await chrome.storage.local.remove(keysToDelete);
                console.log(`Cleaned up ${keysToDelete.length} old sessions`);
            }
        } catch (error) {
            console.error('Error cleaning up old sessions:', error);
        }
    }

    /**
     * Get session summary
     */
    getSessionSummary() {
        if (!this.currentSession) return null;
        
        const session = this.currentSession;
        const duration = session.endTime ? 
            session.endTime - session.startTime : 
            Date.now() - session.startTime;
        
        return {
            id: session.id,
            status: session.status,
            duration: duration,
            pagesVisited: session.navigationData.pagesVisited,
            totalInteractions: session.interactions.length,
            adsenseData: session.adsenseData,
            behaviorMetrics: session.behaviorMetrics,
            navigationData: session.navigationData,
            personality: session.personality?.type || 'unknown'
        };
    }

    /**
     * Get session analytics
     */
    getSessionAnalytics() {
        if (!this.currentSession) return null;
        
        const session = this.currentSession;
        const duration = session.endTime ? 
            session.endTime - session.startTime : 
            Date.now() - session.startTime;
        
        return {
            sessionId: session.id,
            duration: duration,
            pagesPerMinute: (session.navigationData.pagesVisited / (duration / 60000)).toFixed(2),
            interactionsPerMinute: (session.interactions.length / (duration / 60000)).toFixed(2),
            averageTimeOnPage: duration / session.navigationData.pagesVisited,
            clickThroughRate: session.adsenseData.adsDetected > 0 ? 
                (session.adsenseData.adsClicked / session.adsenseData.adsDetected * 100).toFixed(2) : 0,
            rpmScore: session.adsenseData.rpmScore.toFixed(2),
            readingEngagement: session.behaviorMetrics.readingTime / duration * 100
        };
    }

    /**
     * Export session data
     */
    exportSessionData() {
        if (!this.currentSession) return null;
        
        return {
            session: this.currentSession,
            summary: this.getSessionSummary(),
            analytics: this.getSessionAnalytics(),
            exportTime: new Date().toISOString()
        };
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get device information
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: screen.width,
            screenHeight: screen.height,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        };
    }

    /**
     * Get browser information
     */
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';
        
        // Detect browser
        if (userAgent.includes('Chrome')) {
            browser = 'Chrome';
            version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
            version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
        } else if (userAgent.includes('Safari')) {
            browser = 'Safari';
            version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
        } else if (userAgent.includes('Edge')) {
            browser = 'Edge';
            version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'unknown';
        }
        
        return {
            name: browser,
            version: version,
            userAgent: userAgent
        };
    }

    /**
     * Get current session
     */
    getCurrentSession() {
        return this.currentSession ? { ...this.currentSession } : null;
    }

    /**
     * Check if session is active
     */
    isSessionActive() {
        return this.isActive && this.currentSession?.status === 'active';
    }

    /**
     * Get session duration
     */
    getSessionDuration() {
        if (!this.currentSession) return 0;
        
        const endTime = this.currentSession.endTime || Date.now();
        return endTime - this.currentSession.startTime;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
} else {
    window.SessionManager = SessionManager;
}
