/**
 * Background Service Worker - Stealth Extension
 * Central control hub for the extension
 * No direct DOM access - only triggers injections
 */

class StealthController {
  constructor() {
    this.isActive = false;
    this.injectedTabs = new Set();
    this.init();
  }

  init() {
    // Listen for extension icon clicks
    chrome.action.onClicked.addListener((tab) => {
      this.toggleExtension(tab);
    });

    // Listen for tab updates to clean up
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') {
        this.injectedTabs.delete(tabId);
      }
    });

    // Listen for tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.injectedTabs.delete(tabId);
    });

    // Load saved state
    this.loadState();
  }

  async loadState() {
    try {
      const result = await chrome.storage.local.get(['isActive']);
      this.isActive = result.isActive || false;
      this.updateIcon();
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  async saveState() {
    try {
      await chrome.storage.local.set({ isActive: this.isActive });
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  updateIcon() {
    const iconPath = this.isActive ? 'icons/active' : 'icons/inactive';
    chrome.action.setIcon({
      path: {
        16: `${iconPath}16.png`,
        32: `${iconPath}32.png`,
        48: `${iconPath}48.png`,
        128: `${iconPath}128.png`
      }
    });
  }

  async toggleExtension(tab) {
    try {
      console.log('toggleExtension called, current state:', this.isActive);
      if (this.isActive) {
        console.log('Deactivating extension...');
        await this.deactivateExtension(tab);
      } else {
        console.log('Activating extension...');
        await this.activateExtension(tab);
      }
      console.log('Toggle completed, new state:', this.isActive);
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  }

  async activateExtension(tab) {
    try {
      console.log('Activating extension for tab:', tab.id, 'URL:', tab.url);
      
      // Check if URL is injectable
      if (!this.isInjectableUrl(tab.url)) {
        console.error('URL is not injectable:', tab.url);
        throw new Error('URL is not injectable');
      }
      
      // Inject bootstrap script
      console.log('Injecting injector.bundle.js...');
      
      // First, try to inject a simple test script to verify injection works
      try {
        console.log('Testing script injection with simple script...');
        const testResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            console.log('Test script executed successfully in page context');
            return 'test-success';
          }
        });
        console.log('Test script results:', testResults);
        
        // Check if test script actually logged to page console
        if (testResults && testResults.length > 0) {
          console.log('Test script executed, result:', testResults[0].result);
        }
      } catch (testError) {
        console.error('Test script injection failed:', testError);
      }
      
      // Inject bootstrap script (ChatGPT compliant - single small injection)
      try {
        console.log('Injecting bootstrap.bundle.js...');
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['bootstrap.bundle.js']
        });
        console.log('Bootstrap script injected successfully, results:', results);
        
        // Check if script actually executed
        if (results && results.length > 0) {
          console.log('Script execution result:', results[0]);
        }
        
        // Wait a bit and then check if bootstrap and inpage scripts ran
        setTimeout(async () => {
          try {
            console.log('Checking if bootstrap and inpage scripts ran...');
            const checkResults = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                console.log('Bootstrap check: Script executed in page context');
                const isBootstrapInjected = window.__page_nav_bootstrap_injected;
                const isInpageActive = window.__page_nav_active;
                console.log('Bootstrap check: __page_nav_bootstrap_injected =', isBootstrapInjected);
                console.log('Bootstrap check: __page_nav_active =', isInpageActive);
                
                // Check for any scripts in head
                const scripts = Array.from(document.head.querySelectorAll('script')).map(s => s.src);
                console.log('Bootstrap check: scripts in head =', scripts);
                
                // Check if bootstrap script is still in head (should be self-removed)
                const bootstrapScripts = Array.from(document.head.querySelectorAll('script')).filter(s => 
                  s.src && s.src.includes('bootstrap.bundle.js')
                );
                console.log('Bootstrap check: bootstrap scripts in head =', bootstrapScripts.length);
                
                // Check if inpage script is in head
                const inpageScripts = Array.from(document.head.querySelectorAll('script')).filter(s => 
                  s.src && s.src.includes('inpage.bundle.js')
                );
                console.log('Bootstrap check: inpage scripts in head =', inpageScripts.length);
                
                return { 
                  bootstrapInjected: isBootstrapInjected, 
                  inpageActive: isInpageActive,
                  scripts: scripts,
                  bootstrapScripts: bootstrapScripts.length,
                  inpageScripts: inpageScripts.length,
                  timestamp: Date.now() 
                };
              }
            });
            console.log('Bootstrap check results:', checkResults);
            if (checkResults && checkResults.length > 0) {
              console.log('Bootstrap status:', checkResults[0].result);
              if (checkResults[0].result && checkResults[0].result.bootstrapInjected) {
                console.log('✅ Bootstrap script ran successfully');
                if (checkResults[0].result.inpageActive) {
                  console.log('✅ Inpage script is also active');
                } else {
                  console.log('❌ Inpage script is not active');
                }
                
                // Check if bootstrap self-removed
                if (checkResults[0].result.bootstrapScripts === 0) {
                  console.log('✅ Bootstrap script self-removed (ChatGPT compliant)');
                } else {
                  console.log('❌ Bootstrap script still in head (not self-removed)');
                }
              } else {
                console.log('❌ Bootstrap script did not run or failed');
              }
            }
          } catch (checkError) {
            console.error('Failed to check bootstrap status:', checkError);
          }
        }, 2000); // Increased delay to allow inpage script to fully initialize
        
      } catch (injectionError) {
        console.error('Failed to inject bootstrap script:', injectionError);
        throw injectionError;
      }

      this.isActive = true;
      this.injectedTabs.add(tab.id);
      await this.saveState();
      this.updateIcon();

      console.log('Extension activated for tab:', tab.id);
    } catch (error) {
      console.error('Activation failed:', error);
    }
  }

  // Check if URL is injectable
  isInjectableUrl(url) {
    if (!url) return false;
    
    // Blocked URL patterns
    const blockedPatterns = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'edge://',
      'about:',
      'file://',
      'data:',
      'javascript:',
      'vbscript:'
    ];
    
    // Check if URL matches any blocked pattern
    for (const pattern of blockedPatterns) {
      if (url.startsWith(pattern)) {
        return false;
      }
    }
    
    // Allow http and https URLs
    return url.startsWith('http://') || url.startsWith('https://');
  }

  async deactivateExtension(tab) {
    try {
      // Send deactivation signal to injected script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: this.sendDeactivationSignal
      });

      this.isActive = false;
      this.injectedTabs.delete(tab.id);
      await this.saveState();
      this.updateIcon();

      console.log('Extension deactivated for tab:', tab.id);
    } catch (error) {
      console.error('Deactivation failed:', error);
    }
  }

  // Function to be injected for deactivation
  sendDeactivationSignal() {
    window.dispatchEvent(new CustomEvent('page-nav-deactivate'));
  }

  // Handle messages from popup
  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'GET_STATE':
        sendResponse({ isActive: this.isActive });
        break;
      
      case 'TOGGLE_STATE':
        console.log('TOGGLE_STATE message received, current state:', this.isActive);
        console.log('Message data:', message);
        
        let targetTab = null;
        
        // Try to get tab from message first, then from sender
        if (message.tab) {
          targetTab = message.tab;
          console.log('Using tab from message:', targetTab.id);
        } else if (sender.tab) {
          targetTab = sender.tab;
          console.log('Using tab from sender:', targetTab.id);
        } else {
          console.log('No tab found, trying to get active tab...');
          try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab) {
              targetTab = activeTab;
              console.log('Using active tab:', targetTab.id);
            }
          } catch (error) {
            console.error('Failed to get active tab:', error);
          }
        }
        
        if (targetTab) {
          console.log('Toggling extension for tab:', targetTab.id);
          await this.toggleExtension(targetTab);
        } else {
          console.log('No target tab found');
        }
        
        console.log('New state after toggle:', this.isActive);
        sendResponse({ isActive: this.isActive });
        break;
      
      case 'GET_INJECTED_TABS':
        sendResponse({ tabs: Array.from(this.injectedTabs) });
        break;
      
      case 'OPEN_SETTINGS':
        try {
          // Get current active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          if (tab && this.injectedTabs.has(tab.id)) {
            // Tab has extension injected, send settings event
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                window.dispatchEvent(new CustomEvent('page-nav-settings'));
              }
            });
            sendResponse({ success: true, message: 'Settings opened in page' });
          } else {
            // Tab doesn't have extension, show popup settings
            sendResponse({ success: false, message: 'Extension not active on this tab' });
          }
        } catch (error) {
          console.error('Failed to open settings:', error);
          sendResponse({ success: false, message: 'Failed to open settings' });
        }
        break;
      
      case 'RESIZE_POPUP':
        // Handle popup resize request
        console.log(`Popup resize requested: ${message.width}x${message.height}px`);
        sendResponse({ success: true });
        break;
      
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }
}

// Initialize controller
const controller = new StealthController();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  controller.handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Stealth Scroll Extension installed');
  } else if (details.reason === 'update') {
    console.log('Stealth Scroll Extension updated');
  }
});
