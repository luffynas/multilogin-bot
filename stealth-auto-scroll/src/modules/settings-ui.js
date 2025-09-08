/**
 * Settings UI Module - Stealth Extension
 * Provides UI for managing user settings and preferences
 */

class SettingsUIModule {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.isOpen = false;
    this.settingsContainer = null;
    this.init();
  }

  /**
   * Initialize settings UI
   */
  init() {
    this.createSettingsContainer();
    this.setupEventListeners();
  }

  /**
   * Create settings container
   */
  createSettingsContainer() {
    // Create shadow DOM container
    const shadowHost = document.createElement('div');
    shadowHost.id = 'stealth-settings-host';
    shadowHost.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      pointer-events: none;
      display: none;
    `;

    const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
    
    // Create settings panel
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'stealth-settings-panel';
    this.createSettingsDOM(settingsPanel);
    settingsPanel.style.cssText = this.getSettingsCSS();

    shadowRoot.appendChild(settingsPanel);
    document.body.appendChild(shadowHost);
    
    this.settingsContainer = shadowRoot;
    this.shadowHost = shadowHost;
  }

  /**
   * Create settings DOM structure
   */
  createSettingsDOM(container) {
    // Create main container
    const mainDiv = document.createElement('div');
    mainDiv.className = 'settings-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'settings-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Smart Scroll Settings';
    header.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => this.hide();
    header.appendChild(closeBtn);
    
    mainDiv.appendChild(header);
    
    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'settings-tabs';
    
    const behaviorTab = document.createElement('button');
    behaviorTab.className = 'tab-btn active';
    behaviorTab.textContent = 'Behavior';
    behaviorTab.onclick = () => this.switchTab('behavior');
    tabs.appendChild(behaviorTab);
    
    const statsTab = document.createElement('button');
    statsTab.className = 'tab-btn';
    statsTab.textContent = 'Statistics';
    statsTab.onclick = () => this.switchTab('stats');
    tabs.appendChild(statsTab);
    
    mainDiv.appendChild(tabs);
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'settings-content';
    
    // Behavior tab content
    const behaviorContent = document.createElement('div');
    behaviorContent.id = 'behavior-tab';
    behaviorContent.className = 'tab-content active';
    this.createBehaviorContent(behaviorContent);
    
    // Stats tab content
    const statsContent = document.createElement('div');
    statsContent.id = 'stats-tab';
    statsContent.className = 'tab-content';
    this.createStatsContent(statsContent);
    
    content.appendChild(behaviorContent);
    content.appendChild(statsContent);
    mainDiv.appendChild(content);
    
    // Create footer
    const footer = document.createElement('div');
    footer.className = 'settings-footer';
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary';
    resetBtn.textContent = 'Reset to Defaults';
    resetBtn.onclick = () => this.resetToDefaults();
    footer.appendChild(resetBtn);
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save Settings';
    saveBtn.onclick = () => this.saveSettings();
    footer.appendChild(saveBtn);
    
    mainDiv.appendChild(footer);
    
    container.appendChild(mainDiv);
  }

  /**
   * Create behavior content using DOM methods
   */
  createBehaviorContent(container) {
    const div = document.createElement('div');
    div.className = 'behavior-settings';
    
    const title = document.createElement('h3');
    title.textContent = 'Scroll Behavior Settings';
    div.appendChild(title);
    
    const info = document.createElement('p');
    info.textContent = 'Configure how the extension behaves when scrolling.';
    div.appendChild(info);
    
    container.appendChild(div);
  }

  /**
   * Create stats content using DOM methods
   */
  createStatsContent(container) {
    const div = document.createElement('div');
    div.className = 'stats-settings';
    
    const title = document.createElement('h3');
    title.textContent = 'Usage Statistics';
    div.appendChild(title);
    
    const info = document.createElement('p');
    info.textContent = 'View your extension usage statistics.';
    div.appendChild(info);
    
    container.appendChild(div);
  }

  /**
   * Get behavior settings HTML
   */
  getBehaviorHTML() {
    return `
      <div class="settings-overlay">
        <div class="settings-panel">
          <div class="settings-header">
            <h2>Stealth Scroll Settings</h2>
            <button class="close-btn" id="close-settings">×</button>
          </div>
          
          <div class="settings-content">
            <!-- Scroll Behavior Settings -->
            <div class="settings-section">
              <h3>Scroll Behavior</h3>
              
              <div class="setting-group">
                <label>Scroll Step (Min):</label>
                <input type="number" id="scroll-step-min" min="10" max="500" value="50">
              </div>
              
              <div class="setting-group">
                <label>Scroll Step (Max):</label>
                <input type="number" id="scroll-step-max" min="10" max="500" value="200">
              </div>
              
              <div class="setting-group">
                <label>Scroll Delay (Min ms):</label>
                <input type="number" id="scroll-delay-min" min="50" max="2000" value="100">
              </div>
              
              <div class="setting-group">
                <label>Scroll Delay (Max ms):</label>
                <input type="number" id="scroll-delay-max" min="50" max="2000" value="500">
              </div>
              
              <div class="setting-group">
                <label>Pause Chance:</label>
                <input type="range" id="pause-chance" min="0" max="0.5" step="0.01" value="0.1">
                <span id="pause-chance-value">10%</span>
              </div>
              
              <div class="setting-group">
                <label>Direction Change Chance:</label>
                <input type="range" id="direction-change" min="0" max="0.2" step="0.01" value="0.05">
                <span id="direction-change-value">5%</span>
              </div>
            </div>

            <!-- User Preferences -->
            <div class="settings-section">
              <h3>User Preferences</h3>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="auto-start">
                  Auto Start on Page Load
                </label>
              </div>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="show-notifications">
                  Show Notifications
                </label>
              </div>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enable-stealth">
                  Enable Stealth Mode
                </label>
              </div>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enable-risk-adaptation">
                  Enable Risk Adaptation
                </label>
              </div>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enable-site-specific">
                  Enable Site-Specific Behavior
                </label>
              </div>
              
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="enable-human-like">
                  Enable Human-Like Behavior
                </label>
              </div>
            </div>

            <!-- Site-Specific Settings -->
            <div class="settings-section">
              <h3>Site-Specific Settings</h3>
              
              <div class="setting-group">
                <label>Current Site:</label>
                <input type="text" id="current-site" readonly>
              </div>
              
              <div class="setting-group">
                <label>Pattern:</label>
                <select id="site-pattern">
                  <option value="browsing">Browsing</option>
                  <option value="reading">Reading</option>
                  <option value="shopping">Shopping</option>
                  <option value="social">Social</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label>Risk Level:</label>
                <select id="site-risk">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <button id="save-site-settings">Save Site Settings</button>
            </div>

            <!-- Statistics -->
            <div class="settings-section">
              <h3>Statistics</h3>
              
              <div class="stats-grid">
                <div class="stat-item">
                  <label>Total Scroll Time:</label>
                  <span id="total-scroll-time">0s</span>
                </div>
                
                <div class="stat-item">
                  <label>Total Scroll Distance:</label>
                  <span id="total-scroll-distance">0px</span>
                </div>
                
                <div class="stat-item">
                  <label>Sites Visited:</label>
                  <span id="sites-visited">0</span>
                </div>
                
                <div class="stat-item">
                  <label>Usage Count:</label>
                  <span id="usage-count">0</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="settings-actions">
              <button id="save-settings" class="btn-primary">Save Settings</button>
              <button id="reset-settings" class="btn-secondary">Reset to Defaults</button>
              <button id="export-settings" class="btn-secondary">Export Settings</button>
              <button id="import-settings" class="btn-secondary">Import Settings</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get settings CSS
   */
  getSettingsCSS() {
    return `
      .settings-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: all;
      }

      .settings-panel {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        pointer-events: all;
      }

      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
      }

      .settings-header h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #333;
      }

      .settings-content {
        padding: 20px;
      }

      .settings-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }

      .settings-section:last-child {
        border-bottom: none;
      }

      .settings-section h3 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 18px;
      }

      .setting-group {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .setting-group label {
        min-width: 150px;
        font-weight: 500;
        color: #555;
      }

      .setting-group input,
      .setting-group select {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .setting-group input[type="checkbox"] {
        flex: none;
        width: auto;
      }

      .setting-group input[type="range"] {
        flex: 1;
        margin-right: 10px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 4px;
      }

      .stat-item label {
        font-weight: 500;
        color: #555;
      }

      .stat-item span {
        font-weight: 600;
        color: #333;
      }

      .settings-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 20px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #545b62;
      }

      @media (max-width: 768px) {
        .settings-panel {
          width: 95%;
          margin: 20px;
        }
        
        .stats-grid {
          grid-template-columns: 1fr;
        }
        
        .settings-actions {
          flex-direction: column;
        }
      }
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    this.settingsContainer.addEventListener('click', (e) => {
      if (e.target.id === 'close-settings' || e.target.classList.contains('settings-overlay')) {
        this.close();
      }
    });

    // Range sliders
    this.settingsContainer.addEventListener('input', (e) => {
      if (e.target.id === 'pause-chance') {
        const value = (e.target.value * 100).toFixed(0);
        this.settingsContainer.querySelector('#pause-chance-value').textContent = value + '%';
      } else if (e.target.id === 'direction-change') {
        const value = (e.target.value * 100).toFixed(0);
        this.settingsContainer.querySelector('#direction-change-value').textContent = value + '%';
      }
    });

    // Save settings
    this.settingsContainer.addEventListener('click', (e) => {
      if (e.target.id === 'save-settings') {
        this.saveSettings();
      } else if (e.target.id === 'reset-settings') {
        this.resetSettings();
      } else if (e.target.id === 'export-settings') {
        this.exportSettings();
      } else if (e.target.id === 'import-settings') {
        this.importSettings();
      } else if (e.target.id === 'save-site-settings') {
        this.saveSiteSettings();
      }
    });
  }

  /**
   * Open settings panel
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.shadowHost.style.display = 'block';
    this.loadCurrentSettings();
    this.loadStatistics();
  }

  /**
   * Close settings panel
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.shadowHost.style.display = 'none';
  }

  /**
   * Load current settings
   */
  async loadCurrentSettings() {
    const scrollBehavior = this.storageManager.getScrollBehavior();
    const userPreferences = this.storageManager.getUserPreferences();
    const currentDomain = window.location.hostname;
    const sitePreferences = this.storageManager.getSitePreferences(currentDomain);

    // Load scroll behavior
    this.settingsContainer.querySelector('#scroll-step-min').value = scrollBehavior.scrollStep.min;
    this.settingsContainer.querySelector('#scroll-step-max').value = scrollBehavior.scrollStep.max;
    this.settingsContainer.querySelector('#scroll-delay-min').value = scrollBehavior.scrollDelay.min;
    this.settingsContainer.querySelector('#scroll-delay-max').value = scrollBehavior.scrollDelay.max;
    this.settingsContainer.querySelector('#pause-chance').value = scrollBehavior.pauseChance;
    this.settingsContainer.querySelector('#direction-change').value = scrollBehavior.directionChangeChance;

    // Update range values
    this.settingsContainer.querySelector('#pause-chance-value').textContent = (scrollBehavior.pauseChance * 100).toFixed(0) + '%';
    this.settingsContainer.querySelector('#direction-change-value').textContent = (scrollBehavior.directionChangeChance * 100).toFixed(0) + '%';

    // Load user preferences
    this.settingsContainer.querySelector('#auto-start').checked = userPreferences.autoStart;
    this.settingsContainer.querySelector('#show-notifications').checked = userPreferences.showNotifications;
    this.settingsContainer.querySelector('#enable-stealth').checked = userPreferences.enableStealthMode;
    this.settingsContainer.querySelector('#enable-risk-adaptation').checked = userPreferences.enableRiskAdaptation;
    this.settingsContainer.querySelector('#enable-site-specific').checked = userPreferences.enableSiteSpecificBehavior;
    this.settingsContainer.querySelector('#enable-human-like').checked = userPreferences.enableHumanLikeBehavior;

    // Load site preferences
    this.settingsContainer.querySelector('#current-site').value = currentDomain;
    if (sitePreferences) {
      this.settingsContainer.querySelector('#site-pattern').value = sitePreferences.pattern || 'browsing';
      this.settingsContainer.querySelector('#site-risk').value = sitePreferences.riskLevel || 'low';
    }
  }

  /**
   * Load statistics
   */
  async loadStatistics() {
    const stats = this.storageManager.getStatistics();
    
    this.settingsContainer.querySelector('#total-scroll-time').textContent = this.formatTime(stats.totalScrollTime || 0);
    this.settingsContainer.querySelector('#total-scroll-distance').textContent = this.formatDistance(stats.totalScrollDistance || 0);
    this.settingsContainer.querySelector('#sites-visited').textContent = (stats.sitesVisited || []).length;
    this.settingsContainer.querySelector('#usage-count').textContent = stats.usageCount || 0;
  }

  /**
   * Save settings
   */
  async saveSettings() {
    const scrollBehavior = {
      scrollStep: {
        min: parseInt(this.settingsContainer.querySelector('#scroll-step-min').value),
        max: parseInt(this.settingsContainer.querySelector('#scroll-step-max').value)
      },
      scrollDelay: {
        min: parseInt(this.settingsContainer.querySelector('#scroll-delay-min').value),
        max: parseInt(this.settingsContainer.querySelector('#scroll-delay-max').value)
      },
      pauseChance: parseFloat(this.settingsContainer.querySelector('#pause-chance').value),
      pauseDuration: { min: 1000, max: 3000 },
      directionChangeChance: parseFloat(this.settingsContainer.querySelector('#direction-change').value),
      maxScrollDistance: 10000
    };

    const userPreferences = {
      autoStart: this.settingsContainer.querySelector('#auto-start').checked,
      showNotifications: this.settingsContainer.querySelector('#show-notifications').checked,
      enableStealthMode: this.settingsContainer.querySelector('#enable-stealth').checked,
      enableRiskAdaptation: this.settingsContainer.querySelector('#enable-risk-adaptation').checked,
      enableSiteSpecificBehavior: this.settingsContainer.querySelector('#enable-site-specific').checked,
      enableHumanLikeBehavior: this.settingsContainer.querySelector('#enable-human-like').checked
    };

    await this.storageManager.setScrollBehavior(scrollBehavior);
    await this.storageManager.setUserPreferences(userPreferences);

    this.showNotification('Settings saved successfully!');
  }

  /**
   * Save site-specific settings
   */
  async saveSiteSettings() {
    const domain = this.settingsContainer.querySelector('#current-site').value;
    const pattern = this.settingsContainer.querySelector('#site-pattern').value;
    const riskLevel = this.settingsContainer.querySelector('#site-risk').value;

    await this.storageManager.setSitePreferences(domain, { pattern, riskLevel });
    this.showNotification('Site settings saved successfully!');
  }

  /**
   * Reset settings
   */
  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      await this.storageManager.resetToDefaults();
      this.loadCurrentSettings();
      this.showNotification('Settings reset to defaults!');
    }
  }

  /**
   * Export settings
   */
  exportSettings() {
    const data = this.storageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stealth-scroll-settings.json';
    a.click();
    
    URL.revokeObjectURL(url);
    this.showNotification('Settings exported successfully!');
  }

  /**
   * Import settings
   */
  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const text = await file.text();
        const success = await this.storageManager.importData(text);
        
        if (success) {
          this.loadCurrentSettings();
          this.showNotification('Settings imported successfully!');
        } else {
          this.showNotification('Failed to import settings!');
        }
      }
    };
    
    input.click();
  }

  /**
   * Show notification
   */
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 2147483648;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Format time
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format distance
   */
  formatDistance(px) {
    if (px > 1000) {
      return `${(px / 1000).toFixed(1)}k px`;
    } else {
      return `${px} px`;
    }
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsUIModule;
} else {
  window.SettingsUIModule = SettingsUIModule;
}
