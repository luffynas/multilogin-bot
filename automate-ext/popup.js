/**
 * AdSense Automation Pro - Popup JavaScript
 * Handles popup interface interactions and communication with content script
 */

class PopupManager {
    constructor() {
        this.isInitialized = false;
        this.currentTab = null;
        this.status = {
            isInitialized: false,
            isRunning: false,
            config: {},
            personality: null,
            session: null,
            stealth: null,
            adsense: null
        };
        
        this.setupEventListeners();
        this.initialize();
    }

    /**
     * Initialize popup manager
     */
    async initialize() {
        try {
            this.showLoading(true);
            
            // Get current active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tabs[0];
            
            if (!this.currentTab) {
                throw new Error('No active tab found');
            }
            
            // Get status from content script
            await this.updateStatus();
            
            // Load configuration
            await this.loadConfiguration();
            
            // Update UI
            this.updateUI();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Popup initialization failed:', error);
            this.showNotification('Failed to initialize popup', 'error');
            this.updateStatusUI('error', 'Initialization failed');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle automation button
        document.getElementById('toggleBtn').addEventListener('click', () => {
            this.toggleAutomation();
        });
        
        // Configuration changes
        document.getElementById('personalityType').addEventListener('change', (e) => {
            this.updateConfig({ personalityType: e.target.value });
        });
        
        document.getElementById('automationLevel').addEventListener('change', (e) => {
            this.updateConfig({ automationLevel: e.target.value });
        });
        
        document.getElementById('targetRPM').addEventListener('input', (e) => {
            this.updateConfig({ targetRPM: parseFloat(e.target.value) || 0 });
        });
        
        document.getElementById('stealthMode').addEventListener('change', (e) => {
            this.updateConfig({ stealthMode: e.target.checked });
        });
        
        document.getElementById('autoStart').addEventListener('change', (e) => {
            this.updateConfig({ autoStart: e.target.checked });
        });
        
        // Action buttons
        document.getElementById('detectAdsBtn').addEventListener('click', () => {
            this.detectAds();
        });
        
        document.getElementById('simulateBehaviorBtn').addEventListener('click', () => {
            this.simulateBehavior();
        });
        
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('viewMetricsBtn').addEventListener('click', () => {
            this.toggleMetrics();
        });
        
        document.getElementById('closeMetricsBtn').addEventListener('click', () => {
            this.toggleMetrics();
        });
        
        // Footer links
        document.getElementById('settingsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openSettings();
        });
        
        document.getElementById('helpLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openHelp();
        });
        
        document.getElementById('aboutLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openAbout();
        });
    }

    /**
     * Update status from content script
     */
    async updateStatus() {
        try {
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'getStatus' });
            
            if (response.status === 'success') {
                this.status = response.data;
            } else {
                throw new Error(response.message || 'Failed to get status');
            }
            
        } catch (error) {
            console.error('Failed to update status:', error);
            // Set default status
            this.status = {
                isInitialized: false,
                isRunning: false,
                config: {},
                personality: null,
                session: null,
                stealth: null,
                adsense: null
            };
        }
    }

    /**
     * Update UI based on current status
     */
    updateUI() {
        // Update status indicator
        if (this.status.isInitialized) {
            this.updateStatusUI('online', 'Ready');
        } else {
            this.updateStatusUI('error', 'Not initialized');
        }
        
        // Update automation status
        this.updateAutomationUI();
        
        // Update stats
        this.updateStatsUI();
        
        // Update configuration
        this.updateConfigUI();
    }

    /**
     * Update status UI
     */
    updateStatusUI(status, text) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        // Remove all status classes
        statusDot.classList.remove('online', 'error', 'warning');
        
        // Add current status class
        statusDot.classList.add(status);
        statusText.textContent = text;
    }

    /**
     * Update automation UI
     */
    updateAutomationUI() {
        const automationText = document.getElementById('automationText');
        const toggleBtn = document.getElementById('toggleBtn');
        
        if (this.status.isRunning) {
            automationText.textContent = 'Running';
            toggleBtn.textContent = 'Stop';
            toggleBtn.classList.add('running');
        } else {
            automationText.textContent = 'Stopped';
            toggleBtn.textContent = 'Start';
            toggleBtn.classList.remove('running');
        }
    }

    /**
     * Update stats UI
     */
    updateStatsUI() {
        // RPM Score
        const rpmScore = this.status.adsense?.rpmScore || 0;
        document.getElementById('rpmScore').textContent = rpmScore.toFixed(2);
        
        // Ads Detected
        const adsDetected = this.status.adsense?.totalAds || 0;
        document.getElementById('adsDetected').textContent = adsDetected;
        
        // Stealth Score
        const stealthScore = this.status.stealth?.overallScore || 0;
        document.getElementById('stealthScore').textContent = stealthScore.toFixed(2);
    }

    /**
     * Update configuration UI
     */
    updateConfigUI() {
        const config = this.status.config;
        
        // Personality type
        const personalitySelect = document.getElementById('personalityType');
        personalitySelect.value = config.personalityType || 'auto';
        
        // Automation level
        const automationSelect = document.getElementById('automationLevel');
        automationSelect.value = config.automationLevel || 'medium';
        
        // Target RPM
        const targetRPMInput = document.getElementById('targetRPM');
        targetRPMInput.value = config.targetRPM || 0;
        
        // Stealth mode
        const stealthCheckbox = document.getElementById('stealthMode');
        stealthCheckbox.checked = config.stealthMode !== false;
        
        // Auto start
        const autoStartCheckbox = document.getElementById('autoStart');
        autoStartCheckbox.checked = config.autoStart || false;
    }

    /**
     * Toggle automation
     */
    async toggleAutomation() {
        try {
            this.showLoading(true);
            
            if (this.status.isRunning) {
                await this.stopAutomation();
            } else {
                await this.startAutomation();
            }
            
            // Update status
            await this.updateStatus();
            this.updateUI();
            
        } catch (error) {
            console.error('Failed to toggle automation:', error);
            this.showNotification('Failed to toggle automation', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Start automation
     */
    async startAutomation() {
        const response = await chrome.tabs.sendMessage(this.currentTab.id, {
            action: 'startAutomation',
            options: {
                personalityType: document.getElementById('personalityType').value,
                automationLevel: document.getElementById('automationLevel').value,
                targetRPM: parseFloat(document.getElementById('targetRPM').value) || 0
            }
        });
        
        if (response.status === 'success') {
            this.showNotification('Automation started successfully', 'success');
        } else {
            throw new Error(response.message || 'Failed to start automation');
        }
    }

    /**
     * Stop automation
     */
    async stopAutomation() {
        const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'stopAutomation' });
        
        if (response.status === 'success') {
            this.showNotification('Automation stopped', 'info');
        } else {
            throw new Error(response.message || 'Failed to stop automation');
        }
    }

    /**
     * Update configuration
     */
    async updateConfig(config) {
        try {
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'updateConfig',
                config: config
            });
            
            if (response.status === 'success') {
                this.showNotification('Configuration updated', 'success');
            } else {
                throw new Error(response.message || 'Failed to update configuration');
            }
            
        } catch (error) {
            console.error('Failed to update configuration:', error);
            this.showNotification('Failed to update configuration', 'error');
        }
    }

    /**
     * Load configuration
     */
    async loadConfiguration() {
        try {
            const result = await chrome.storage.local.get(['automationConfig']);
            if (result.automationConfig) {
                this.status.config = { ...this.status.config, ...result.automationConfig };
            }
        } catch (error) {
            console.warn('Failed to load configuration:', error);
        }
    }

    /**
     * Detect ads
     */
    async detectAds() {
        try {
            this.showLoading(true);
            
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'detectAds' });
            
            if (response.status === 'success') {
                const adsCount = response.data.length;
                this.showNotification(`Detected ${adsCount} AdSense ads`, 'success');
                
                // Update stats
                document.getElementById('adsDetected').textContent = adsCount;
            } else {
                throw new Error(response.message || 'Failed to detect ads');
            }
            
        } catch (error) {
            console.error('Failed to detect ads:', error);
            this.showNotification('Failed to detect ads', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Simulate behavior
     */
    async simulateBehavior() {
        try {
            this.showLoading(true);
            
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'simulateBehavior',
                behaviorType: 'reading',
                options: {
                    contentType: 'general',
                    contentQuality: 'medium'
                }
            });
            
            if (response.status === 'success') {
                this.showNotification('Behavior simulation completed', 'success');
            } else {
                throw new Error(response.message || 'Failed to simulate behavior');
            }
            
        } catch (error) {
            console.error('Failed to simulate behavior:', error);
            this.showNotification('Failed to simulate behavior', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Export data
     */
    async exportData() {
        try {
            this.showLoading(true);
            
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'exportData' });
            
            if (response.status === 'success') {
                // Create and download JSON file
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `adsense-automation-data-${Date.now()}.json`;
                link.click();
                
                URL.revokeObjectURL(url);
                
                this.showNotification('Data exported successfully', 'success');
            } else {
                throw new Error(response.message || 'Failed to export data');
            }
            
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showNotification('Failed to export data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Toggle metrics section
     */
    toggleMetrics() {
        const metricsSection = document.getElementById('metricsSection');
        const isVisible = metricsSection.style.display !== 'none';
        
        if (isVisible) {
            metricsSection.style.display = 'none';
        } else {
            this.loadMetrics();
            metricsSection.style.display = 'block';
        }
    }

    /**
     * Load detailed metrics
     */
    async loadMetrics() {
        try {
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'getMetrics' });
            
            if (response.status === 'success') {
                const metrics = response.data;
                
                // Update metrics UI
                if (metrics.session) {
                    document.getElementById('sessionDuration').textContent = this.formatDuration(metrics.session.duration);
                    document.getElementById('pagesVisited').textContent = metrics.session.pagesVisited || 0;
                    document.getElementById('totalInteractions').textContent = metrics.session.totalInteractions || 0;
                }
                
                if (metrics.adsense) {
                    document.getElementById('adClicks').textContent = metrics.adsense.clicks || 0;
                    document.getElementById('highValueClicks').textContent = metrics.adsense.highValueClicks || 0;
                }
                
                if (metrics.stealth) {
                    document.getElementById('humanBehaviorScore').textContent = (metrics.stealth.humanBehaviorScore || 0).toFixed(2);
                }
            }
            
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    /**
     * Format duration in HH:MM:SS
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Show loading overlay
     */
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = document.createElement('span');
        icon.className = 'notification-icon';
        
        switch (type) {
            case 'success':
                icon.textContent = '✓';
                break;
            case 'error':
                icon.textContent = '✕';
                break;
            case 'warning':
                icon.textContent = '⚠';
                break;
            default:
                icon.textContent = 'ℹ';
        }
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'notification-message';
        messageSpan.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(messageSpan);
        container.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Open settings page
     */
    openSettings() {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    }

    /**
     * Open help page
     */
    openHelp() {
        chrome.tabs.create({ url: 'https://github.com/your-repo/adsense-automation-pro#readme' });
    }

    /**
     * Open about page
     */
    openAbout() {
        chrome.tabs.create({ url: chrome.runtime.getURL('about.html') });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
