/**
 * Bootstrap Script - ChatGPT Compliant
 * Small file that loads inpage.bundle.js and self-removes
 * Follows: Background → Bootstrap → Inpage → Self-remove pattern
 */

(function() {
  'use strict';
  
  console.log('Bootstrap: Starting injection process');
  
  // Prevent multiple injections
  if (window.__page_nav_bootstrap_injected) {
    console.log('Bootstrap: Already injected, skipping');
    return;
  }
  window.__page_nav_bootstrap_injected = true;
  
  // Load reader variant system modules first
  const moduleScripts = [
    'content-analyzer.bundle.js',
    'intent-analyzer.bundle.js', 
    'variant-predictor.bundle.js',
    'adaptive-behavior.bundle.js',
    'scroll-behavior.bundle.js',
    'reader-variant-system.bundle.js'
  ];
  
  let loadedModules = 0;
  
  const loadModule = (moduleName) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(moduleName);
      script.onload = () => {
        console.log(`Bootstrap: ${moduleName} loaded successfully`);
        resolve();
      };
      script.onerror = (error) => {
        console.error(`Bootstrap: Failed to load ${moduleName}:`, error);
        reject(error);
      };
      (document.head || document.documentElement).appendChild(script);
    });
  };
  
  // Load all modules sequentially
  const loadAllModules = async () => {
    try {
      for (const module of moduleScripts) {
        await loadModule(module);
        loadedModules++;
      }
      console.log('Bootstrap: All reader variant modules loaded');
      
      // Now load the main inpage script
      loadInpageScript();
      
    } catch (error) {
      console.error('Bootstrap: Failed to load modules, loading inpage script anyway', error);
      loadInpageScript();
    }
  };
  
  const loadInpageScript = () => {
    // Create script element to load inpage bundle
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inpage.bundle.js');
    script.onload = function() {
      console.log('Bootstrap: Inpage script loaded successfully');
      
      // Wait longer and check multiple times for inpage script to initialize
      let checkCount = 0;
      const maxChecks = 20; // Check for 2 seconds (20 * 100ms)
      
      const checkInpageActive = () => {
        checkCount++;
        console.log(`Bootstrap: Check ${checkCount}/${maxChecks} - __page_nav_active =`, window.__page_nav_active);
        
        if (window.__page_nav_active) {
          console.log('Bootstrap: Inpage script is now active!');
          // Self-remove bootstrap script
          const bootstrapScripts = document.querySelectorAll('script[src*="bootstrap.bundle.js"]');
          bootstrapScripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
              console.log('Bootstrap: Self-removed after inpage initialization confirmed');
            }
          });
        } else if (checkCount < maxChecks) {
          setTimeout(checkInpageActive, 100);
        } else {
          console.error('Bootstrap: Inpage script failed to activate after 2 seconds');
          // Still self-remove on timeout
          const bootstrapScripts = document.querySelectorAll('script[src*="bootstrap.bundle.js"]');
          bootstrapScripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
              console.log('Bootstrap: Self-removed after timeout');
            }
          });
        }
      };
      
      // Start checking after a small delay
      setTimeout(checkInpageActive, 100);
    };
    script.onerror = function(error) {
      console.error('Bootstrap: Failed to load inpage script:', error);
      // Still self-remove on error
      const bootstrapScripts = document.querySelectorAll('script[src*="bootstrap.bundle.js"]');
      bootstrapScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
    
    // Inject script into page
    (document.head || document.documentElement).appendChild(script);
    console.log('Bootstrap: Inpage script injection initiated');
  };
  
  // Start loading modules
  loadAllModules();
  
})();
