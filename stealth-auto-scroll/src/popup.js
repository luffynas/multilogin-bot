/**
 * Popup Script - Stealth Extension
 * Handles the popup UI interactions
 */

class PopupController {
  constructor() {
    this.isActive = false;
    this.init();
  }

  async init() {
    this.setupPopupSize();
    await this.loadState();
    this.setupEventListeners();
    this.updateUI();
    
    // Recalculate height after DOM is fully rendered
    setTimeout(() => {
      this.adjustPopupSize();
    }, 100);
  }

  setupPopupSize() {
    // Set popup size programmatically
    const popupWidth = 360;
    const popupHeight = 480; // Increased height to accommodate all content
    
    // Set body dimensions
    document.body.style.width = `${popupWidth}px`;
    document.body.style.height = `${popupHeight}px`;
    document.body.style.minHeight = `${popupHeight}px`;
    document.body.style.maxHeight = `${popupHeight}px`;
    document.body.style.overflow = 'hidden';
    
    // Set container dimensions
    const container = document.querySelector('.container');
    if (container) {
      container.style.width = `${popupWidth}px`;
      container.style.height = `${popupHeight}px`;
      container.style.minHeight = `${popupHeight}px`;
      container.style.maxHeight = `${popupHeight}px`;
      container.style.overflow = 'hidden';
    }
    
    // Set viewport meta tag dynamically
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = `width=${popupWidth}, initial-scale=1.0`;
    
    // Ensure popup window size (Chrome extension specific)
    this.resizePopupWindow(popupWidth, popupHeight);
    
    console.log(`Popup size set to: ${popupWidth}x${popupHeight}px`);
  }

  resizePopupWindow(width, height) {
    // Try to resize the popup window if possible
    try {
      // For Chrome extensions, we can try to resize the popup
      if (window.chrome && window.chrome.runtime) {
        // Send message to background script to resize popup
        chrome.runtime.sendMessage({
          type: 'RESIZE_POPUP',
          width: width,
          height: height
        });
      }
    } catch (error) {
      console.log('Popup resize not supported:', error);
    }
  }

  async loadState() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
      this.isActive = response.isActive;
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Toggle button
    const toggleBtn = document.getElementById('toggleBtn');
    console.log('Toggle button found:', !!toggleBtn);
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        console.log('Toggle button clicked');
        this.toggleExtension();
      });
    } else {
      console.error('Toggle button not found!');
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    console.log('Settings button found:', !!settingsBtn);
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        console.log('Settings button clicked');
        this.openSettings();
      });
    }

    // Info button
    const infoBtn = document.getElementById('infoBtn');
    console.log('Info button found:', !!infoBtn);
    if (infoBtn) {
      infoBtn.addEventListener('click', () => {
        console.log('Info button clicked');
        this.showInfo();
      });
    }
  }

  async toggleExtension() {
    try {
      console.log('Sending TOGGLE_STATE message...');
      
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current tab:', tab);
      
      const response = await chrome.runtime.sendMessage({ 
        type: 'TOGGLE_STATE',
        tabId: tab.id,
        tab: tab
      });
      console.log('Toggle response:', response);
      this.isActive = response.isActive;
      this.updateUI();
      console.log('Extension toggled, new state:', this.isActive);
    } catch (error) {
      console.error('Failed to toggle extension:', error);
    }
  }

  async openSettings() {
    try {
      // Send message to background script to open settings
      const response = await chrome.runtime.sendMessage({ type: 'OPEN_SETTINGS' });
      
      if (response.success) {
        console.log('Settings opened successfully:', response.message);
        // Close popup after opening settings
        window.close();
      } else {
        console.log('Settings not available:', response.message);
        // Show fallback settings info
        this.showSettingsInfo();
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
      // Fallback: show settings info in popup
      this.showSettingsInfo();
    }
  }

  updateUI() {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');

    if (toggleBtn) {
      toggleBtn.textContent = this.isActive ? 'Stop' : 'Start';
      toggleBtn.className = this.isActive ? 'btn btn-danger' : 'btn btn-primary';
    }

    if (statusText) {
      statusText.textContent = this.isActive ? 'Active' : 'Inactive';
    }

    if (statusIcon) {
      statusIcon.className = this.isActive ? 'icon-active' : 'icon-inactive';
    }

    // Adjust popup size based on state
    this.adjustPopupSize();
  }

  adjustPopupSize() {
    // Calculate optimal height based on actual content
    const baseWidth = 360;
    const calculatedHeight = this.calculateOptimalHeight();
    
    // Apply dynamic sizing
    document.body.style.height = `${calculatedHeight}px`;
    document.body.style.minHeight = `${calculatedHeight}px`;
    document.body.style.maxHeight = `${calculatedHeight}px`;
    
    const container = document.querySelector('.container');
    if (container) {
      container.style.height = `${calculatedHeight}px`;
      container.style.minHeight = `${calculatedHeight}px`;
      container.style.maxHeight = `${calculatedHeight}px`;
    }
    
    console.log(`Popup size adjusted to: ${baseWidth}x${calculatedHeight}px`);
  }

  calculateOptimalHeight() {
    // Calculate height based on actual DOM elements
    let totalHeight = 0;
    
    // Get header height
    const header = document.querySelector('.header');
    if (header) {
      totalHeight += header.offsetHeight;
    } else {
      totalHeight += 64; // Fallback
    }
    
    // Get main content height
    const main = document.querySelector('.main');
    if (main) {
      totalHeight += main.offsetHeight;
    } else {
      totalHeight += 200; // Fallback
    }
    
    // Get footer height
    const footer = document.querySelector('.footer');
    if (footer) {
      totalHeight += footer.offsetHeight;
    } else {
      totalHeight += 64; // Fallback
    }
    
    // Add extra spacing for better UX
    totalHeight += 20;
    
    // Add extra space for active state
    if (this.isActive) {
      totalHeight += 40;
    }
    
    // Ensure minimum height
    const minHeight = 480;
    return Math.max(totalHeight, minHeight);
  }

  openSettingsInTab() {
    // Open settings UI in current tab
    this.openSettings();
  }

  showSettingsInfo() {
    // Show settings information in popup
    const settingsInfo = `
      Smart Scroll Assistant - Settings
      
      Current Settings:
      • Scroll Speed: Human-like (50-200px)
      • Scroll Delay: Natural (100-500ms)
      • Pause Chance: 10%
      • Direction Change: 5%
      
      Advanced settings will be available in the page.
      Make sure the extension is active on the current tab.
    `;
    
    alert(settingsInfo);
  }

  showInfo() {
    // Show information about the extension
    const info = `
      Smart Scroll Assistant v1.0.0
      
      Features:
      • Human-like scrolling behavior
      • Stealth mode (undetectable)
      • Automatic start/stop
      • Smart pause detection
      
      Click the toggle button to start/stop scrolling.
    `;
    
    alert(info);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
