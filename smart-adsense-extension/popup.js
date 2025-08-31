/**
 * Smart AdSense Pro - Popup JavaScript
 * Mengatur interaksi user dan menampilkan data real-time
 */

class SmartAdSensePopup {
    constructor() {
        this.isInitialized = false;
        this.updateInterval = null;
        this.config = {
            autoStart: true,
            stealthMode: true,
            personalityType: 'auto',
            maxPostsPerSession: 5,
            readingTimeRange: { min: 2, max: 5 }
        };
        
        this.init();
    }

    async init() {
        try {
            // Load configuration
            await this.loadConfig();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            this.isInitialized = true;
            console.log('✅ Popup initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing popup:', error);
            this.showError('Failed to initialize popup');
        }
    }

    async loadConfig() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
            if (response && response.config) {
                this.config = { ...this.config, ...response.config };
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    setupEventListeners() {
        // Toggle switches
        document.getElementById('autoStartToggle').addEventListener('change', (e) => {
            this.config.autoStart = e.target.checked;
            this.saveConfig();
        });

        document.getElementById('stealthModeToggle').addEventListener('change', (e) => {
            this.config.stealthMode = e.target.checked;
            this.saveConfig();
        });

        // Personality select
        document.getElementById('personalitySelect').addEventListener('change', (e) => {
            this.config.personalityType = e.target.value;
            this.saveConfig();
        });

        // Number inputs
        document.getElementById('maxPostsInput').addEventListener('change', (e) => {
            this.config.maxPostsPerSession = parseInt(e.target.value);
            this.saveConfig();
        });

        document.getElementById('readingTimeMin').addEventListener('change', (e) => {
            this.config.readingTimeRange.min = parseInt(e.target.value);
            this.saveConfig();
        });

        document.getElementById('readingTimeMax').addEventListener('change', (e) => {
            this.config.readingTimeRange.max = parseInt(e.target.value);
            this.saveConfig();
        });

        // Action buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startAutomation();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopAutomation();
        });

        // Footer buttons
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSession();
        });
    }

    initializeUI() {
        // Set initial values
        document.getElementById('autoStartToggle').checked = this.config.autoStart;
        document.getElementById('stealthModeToggle').checked = this.config.stealthMode;
        document.getElementById('personalitySelect').value = this.config.personalityType;
        document.getElementById('maxPostsInput').value = this.config.maxPostsPerSession;
        document.getElementById('readingTimeMin').value = this.config.readingTimeRange.min;
        document.getElementById('readingTimeMax').value = this.config.readingTimeRange.max;

        // Update status
        this.updateStatus('Initializing...', 'initializing');
    }

    startRealTimeUpdates() {
        // Update data every 2 seconds
        this.updateInterval = setInterval(() => {
            this.updateSessionData();
            this.updateActivityLog();
        }, 2000);

        // Initial update
        this.updateSessionData();
    }

    async updateSessionData() {
        try {
            // Get session data from background script
            const response = await chrome.runtime.sendMessage({ action: 'getSessionData' });
            
            if (response && response.sessionData) {
                const data = response.sessionData;
                
                // Update stats
                document.getElementById('postsReadValue').textContent = data.postsRead || 0;
                document.getElementById('adClicksValue').textContent = data.adClicks || 0;
                document.getElementById('sessionTimeValue').textContent = this.formatDuration(data.startTime);
                document.getElementById('riskLevelValue').textContent = this.capitalizeFirst(data.riskLevel || 'low');

                // Update progress bars
                this.updateProgressBars(data);

                // Update status
                this.updateStatusFromData(data);
            }
        } catch (error) {
            console.error('Error updating session data:', error);
        }
    }

    updateProgressBars(data) {
        const maxPosts = this.config.maxPostsPerSession;
        const maxClicks = 1; // Max 1 ad click per session

        const postsProgress = Math.min((data.postsRead || 0) / maxPosts * 100, 100);
        const clicksProgress = Math.min((data.adClicks || 0) / maxClicks * 100, 100);

        // Update progress fills
        document.getElementById('postsProgressFill').style.width = `${postsProgress}%`;
        document.getElementById('clicksProgressFill').style.width = `${clicksProgress}%`;

        // Update progress text
        document.getElementById('postsProgressText').textContent = `${data.postsRead || 0}/${maxPosts}`;
        document.getElementById('clicksProgressText').textContent = `${data.adClicks || 0}/${maxClicks}`;
    }

    updateStatusFromData(data) {
        if (data.startTime) {
            this.updateStatus('Active', 'active');
        } else {
            this.updateStatus('Inactive', 'inactive');
        }
    }

    async updateActivityLog() {
        try {
            // Get recent activity from background script
            const response = await chrome.runtime.sendMessage({ action: 'getActivityLog' });
            
            if (response && response.activities) {
                this.displayActivityLog(response.activities);
            }
        } catch (error) {
            console.error('Error updating activity log:', error);
        }
    }

    displayActivityLog(activities) {
        const activityLog = document.getElementById('activityLog');
        
        if (!activities || activities.length === 0) {
            activityLog.innerHTML = `
                <div class="activity-item">
                    <span class="activity-time">--:--</span>
                    <span class="activity-text">Waiting for activity...</span>
                </div>
            `;
            return;
        }

        // Display last 5 activities
        const recentActivities = activities.slice(-5);
        
        activityLog.innerHTML = recentActivities.map(activity => `
            <div class="activity-item fade-in">
                <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
                <span class="activity-text">${activity.message}</span>
            </div>
        `).join('');

        // Scroll to bottom
        activityLog.scrollTop = activityLog.scrollHeight;
    }

    async startAutomation() {
        try {
            this.updateStatus('Starting...', 'starting');
            
            const response = await chrome.runtime.sendMessage({ action: 'startAutomation' });
            
            if (response && response.status === 'started') {
                this.updateStatus('Active', 'active');
                this.updateButtonStates(true);
                this.addActivityLog('Automation started');
            } else {
                this.updateStatus('Failed to start', 'error');
                this.showError('Failed to start automation');
            }
        } catch (error) {
            console.error('Error starting automation:', error);
            this.updateStatus('Error', 'error');
            this.showError('Failed to start automation');
        }
    }

    async stopAutomation() {
        try {
            this.updateStatus('Stopping...', 'stopping');
            
            const response = await chrome.runtime.sendMessage({ action: 'stopAutomation' });
            
            if (response && response.status === 'stopped') {
                this.updateStatus('Inactive', 'inactive');
                this.updateButtonStates(false);
                this.addActivityLog('Automation stopped');
            } else {
                this.updateStatus('Failed to stop', 'error');
                this.showError('Failed to stop automation');
            }
        } catch (error) {
            console.error('Error stopping automation:', error);
            this.updateStatus('Error', 'error');
            this.showError('Failed to stop automation');
        }
    }

    async exportData() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'exportSessionData' });
            
            if (response && response.data) {
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `smart-adsense-session-${Date.now()}.json`;
                link.click();
                
                URL.revokeObjectURL(url);
                this.addActivityLog('Session data exported');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Failed to export data');
        }
    }

    async resetSession() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'resetSession' });
            
            if (response && response.status === 'reset') {
                this.updateSessionData();
                this.addActivityLog('Session reset');
            } else {
                this.showError('Failed to reset session');
            }
        } catch (error) {
            console.error('Error resetting session:', error);
            this.showError('Failed to reset session');
        }
    }

    async saveConfig() {
        try {
            await chrome.runtime.sendMessage({
                action: 'updateConfig',
                config: this.config
            });
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    updateStatus(status, type) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        
        statusText.textContent = status;
        
        // Remove all status classes
        statusDot.classList.remove('active', 'inactive', 'starting', 'stopping', 'error');
        
        // Add appropriate class
        if (type) {
            statusDot.classList.add(type);
        }
    }

    updateButtonStates(isRunning) {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        startBtn.disabled = isRunning;
        stopBtn.disabled = !isRunning;
    }

    addActivityLog(message) {
        const activityLog = document.getElementById('activityLog');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.innerHTML = `
            <span class="activity-time">${this.formatTime(Date.now())}</span>
            <span class="activity-text">${message}</span>
        `;
        
        activityLog.appendChild(activityItem);
        
        // Keep only last 10 activities
        while (activityLog.children.length > 10) {
            activityLog.removeChild(activityLog.firstChild);
        }
        
        // Scroll to bottom
        activityLog.scrollTop = activityLog.scrollHeight;
    }

    showError(message) {
        this.addActivityLog(`Error: ${message}`);
        this.updateStatus('Error', 'error');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatDuration(startTime) {
        if (!startTime) return '0m 0s';
        
        const duration = Date.now() - startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        return `${minutes}m ${seconds}s`;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const popup = new SmartAdSensePopup();
    
    // Cleanup when popup is closed
    window.addEventListener('beforeunload', () => {
        popup.cleanup();
    });
});
