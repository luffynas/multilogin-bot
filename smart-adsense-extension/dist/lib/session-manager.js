/**
 * Session Manager - Mengelola dan tracking session otomatisasi
 */

class SessionManager {
    constructor() {
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
            status: 'active'
        };
        
        this.maxSessionDuration = 30 * 60 * 1000; // 30 minutes
        this.maxPostsPerSession = 5;
        this.maxAdClicksPerSession = 1;
        
        this.initializeSession();
    }

    initializeSession() {
        console.log('📊 Initializing session manager...', {
            sessionId: this.sessionId,
            startTime: new Date(this.sessionStartTime).toLocaleTimeString()
        });

        // Load session data from storage if exists
        this.loadSessionData();
        
        // Setup session monitoring
        this.setupSessionMonitoring();
        
        // Save session data periodically
        this.setupAutoSave();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadSessionData() {
        try {
            const savedData = localStorage.getItem('smartAdSense_session_' + this.sessionId);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.sessionData = { ...this.sessionData, ...parsed };
                console.log('📊 Loaded existing session data');
            }
        } catch (error) {
            console.error('Error loading session data:', error);
        }
    }

    saveSessionData() {
        try {
            const dataToSave = {
                ...this.sessionData,
                lastUpdate: Date.now(),
                sessionDuration: this.getSessionDuration()
            };
            
            localStorage.setItem('smartAdSense_session_' + this.sessionId, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving session data:', error);
        }
    }

    setupSessionMonitoring() {
        // Monitor session every 30 seconds
        this.monitoringInterval = setInterval(() => {
            this.checkSessionStatus();
            this.updateSessionStats();
        }, 30000);
    }

    setupAutoSave() {
        // Auto-save session data every 60 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveSessionData();
        }, 60000);
    }

    checkSessionStatus() {
        const currentTime = Date.now();
        const sessionDuration = currentTime - this.sessionStartTime;

        // Check if session has exceeded maximum duration
        if (sessionDuration > this.maxSessionDuration) {
            this.endSession('timeout');
            return;
        }

        // Check if maximum posts reached
        if (this.sessionData.postsRead >= this.maxPostsPerSession) {
            this.endSession('posts_limit');
            return;
        }

        // Check if maximum ad clicks reached
        if (this.sessionData.adClicks >= this.maxAdClicksPerSession) {
            this.endSession('clicks_limit');
            return;
        }

        // Update session status
        this.sessionData.status = 'active';
    }

    updateSessionStats() {
        const currentTime = Date.now();
        this.sessionData.sessionDuration = currentTime - this.sessionStartTime;
        
        console.log('📊 Session stats updated:', {
            duration: this.formatDuration(this.sessionData.sessionDuration),
            postsRead: this.sessionData.postsRead,
            adClicks: this.sessionData.adClicks,
            status: this.sessionData.status
        });
    }

    recordPageVisit(url, pageData) {
        const visit = {
            url: url,
            timestamp: Date.now(),
            deviceType: pageData.deviceType,
            contentLength: pageData.content ? pageData.content.length : 0,
            readingTime: pageData.readingTime || 0
        };

        this.sessionData.pagesVisited.push(visit);
        this.sessionData.postsRead++;

        console.log('📄 Page visit recorded:', {
            url: url,
            postsRead: this.sessionData.postsRead,
            totalVisits: this.sessionData.pagesVisited.length
        });
    }

    recordAdClick(adData) {
        this.sessionData.adClicks++;

        console.log('🖱️ Ad click recorded:', {
            adClicks: this.sessionData.adClicks,
            maxClicks: this.maxAdClicksPerSession
        });
    }

    recordReadingTime(readingTime) {
        this.sessionData.totalReadingTime += readingTime;

        console.log('📖 Reading time recorded:', {
            readingTime: readingTime,
            totalReadingTime: this.sessionData.totalReadingTime
        });
    }

    setPersonalityType(personalityType) {
        this.sessionData.personalityType = personalityType;
        console.log('🧠 Personality type set:', personalityType);
    }

    setDeviceType(deviceType) {
        this.sessionData.deviceType = deviceType;
        console.log('📱 Device type set:', deviceType);
    }

    updateRiskLevel(riskLevel) {
        this.sessionData.riskLevel = riskLevel;
        console.log('🛡️ Risk level updated:', riskLevel);
    }

    endSession(reason) {
        this.sessionData.status = 'completed';
        this.sessionData.endTime = Date.now();
        this.sessionData.endReason = reason;

        // Stop monitoring
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Save final session data
        this.saveSessionData();

        console.log('🏁 Session ended:', {
            reason: reason,
            duration: this.formatDuration(this.getSessionDuration()),
            postsRead: this.sessionData.postsRead,
            adClicks: this.sessionData.adClicks
        });

        // Send session completion message
        this.sendSessionCompletionMessage();
    }

    getSessionDuration() {
        const endTime = this.sessionData.endTime || Date.now();
        return endTime - this.sessionStartTime;
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    getSessionStats() {
        return {
            id: this.sessionId,
            status: this.sessionData.status,
            duration: this.formatDuration(this.getSessionDuration()),
            postsRead: this.sessionData.postsRead,
            adClicks: this.sessionData.adClicks,
            totalReadingTime: this.formatDuration(this.sessionData.totalReadingTime),
            pagesVisited: this.sessionData.pagesVisited.length,
            personalityType: this.sessionData.personalityType,
            deviceType: this.sessionData.deviceType,
            riskLevel: this.sessionData.riskLevel,
            startTime: new Date(this.sessionStartTime).toLocaleTimeString(),
            endTime: this.sessionData.endTime ? new Date(this.sessionData.endTime).toLocaleTimeString() : null
        };
    }

    getSessionProgress() {
        const postsProgress = (this.sessionData.postsRead / this.maxPostsPerSession) * 100;
        const clicksProgress = (this.sessionData.adClicks / this.maxAdClicksPerSession) * 100;
        const timeProgress = (this.getSessionDuration() / this.maxSessionDuration) * 100;

        return {
            postsProgress: Math.min(postsProgress, 100),
            clicksProgress: Math.min(clicksProgress, 100),
            timeProgress: Math.min(timeProgress, 100),
            isComplete: this.sessionData.status === 'completed'
        };
    }

    isSessionActive() {
        return this.sessionData.status === 'active';
    }

    isSessionComplete() {
        return this.sessionData.status === 'completed';
    }

    canReadMorePosts() {
        return this.sessionData.postsRead < this.maxPostsPerSession;
    }

    canClickMoreAds() {
        return this.sessionData.adClicks < this.maxAdClicksPerSession;
    }

    getRemainingPosts() {
        return Math.max(0, this.maxPostsPerSession - this.sessionData.postsRead);
    }

    getRemainingAdClicks() {
        return Math.max(0, this.maxAdClicksPerSession - this.sessionData.adClicks);
    }

    sendSessionCompletionMessage() {
        // Send message to background script about session completion
        chrome.runtime.sendMessage({
            action: 'sessionCompleted',
            sessionData: this.sessionData
        }).catch(() => {
            // Ignore errors if background script is not available
        });
    }

    exportSessionData() {
        const exportData = {
            ...this.sessionData,
            exportTime: new Date().toISOString(),
            sessionDuration: this.getSessionDuration(),
            progress: this.getSessionProgress()
        };

        return exportData;
    }

    resetSession() {
        // Clear current session data
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
            status: 'active'
        };

        // Save reset session
        this.saveSessionData();

        console.log('🔄 Session reset');
    }

    cleanup() {
        // Stop all intervals
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Save final data
        this.saveSessionData();

        console.log('🧹 Session manager cleaned up');
    }
}
