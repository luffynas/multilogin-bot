/**
 * Inpage Script - ChatGPT Compliant
 * Self-contained scrolling logic with no global variables
 * Follows: Human-like behavior, no native function patching
 */

(function() {
  'use strict';
  
  console.log('Inpage: Script started');
  
  // Prevent multiple injections
  if (window.__page_nav_active) {
    console.log('Inpage: Already active, skipping');
    return;
  }
  window.__page_nav_active = true;
  console.log('Inpage: Marked as active');
  
  // State management (local scope only)
  let isActive = false;
  let currentDirection = 1;
  let totalMoved = 0;
  let lastMoveTime = 0;
  let isAdSenseDetected = false;
  let isCloudflareDetected = false;
  
  // Configuration - ChatGPT compliant (no global variables)
  const CONFIG = {
    moveStep: { min: 30, max: 100 },
    moveDelay: { min: 500, max: 1500 },
    pauseChance: 0.2,
    pauseDuration: { min: 1000, max: 3000 },
    directionChangeChance: 0.15,
    maxMoveDistance: 5000,
    humanLikeChance: 0.4,
    mouseMovementChance: 0.2
  };

  // Scroll behavior integration
  let scrollBehaviorModule = null;
  let currentScrollPattern = null;

  // Initialize scroll behavior integration
  function initializeScrollBehavior() {
    if (typeof ScrollBehaviorModule !== 'undefined') {
      scrollBehaviorModule = new ScrollBehaviorModule();
      console.log('Inpage: Scroll behavior module initialized');
      
      // Listen for variant changes
      window.addEventListener('reader-variant-changed', (event) => {
        const variant = event.detail.variant;
        console.log('Inpage: Reader variant changed to', variant);
        updateScrollPattern(variant);
      });
      
      // Set initial pattern if variant is already available
      if (window.readerVariantSystem && window.readerVariantSystem.currentVariant) {
        updateScrollPattern(window.readerVariantSystem.currentVariant);
      }
    }
  }

  // Update scroll pattern based on variant
  function updateScrollPattern(variant) {
    if (scrollBehaviorModule) {
      currentScrollPattern = scrollBehaviorModule.getPattern(variant);
      console.log('Inpage: Scroll pattern updated for variant', variant, currentScrollPattern);
    }
  }
  
  // Utility functions
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Detect sensitive systems (ChatGPT compliant)
  function detectSensitiveSystems() {
    const adsenseScripts = document.querySelectorAll('script[src*="adsense"], script[src*="googlesyndication"]');
    const adsenseElements = document.querySelectorAll('[id*="adsense"], [class*="adsense"], [id*="google_ads"]');
    
    if (adsenseScripts.length > 0 || adsenseElements.length > 0) {
      isAdSenseDetected = true;
      console.log('AdSense detected - using gentle mode');
    }
    
    const cloudflareScripts = document.querySelectorAll('script[src*="cloudflare"], script[src*="challenges.cloudflare"]');
    const cloudflareElements = document.querySelectorAll('[id*="cf-"], [class*="cf-"]');
    
    if (cloudflareScripts.length > 0 || cloudflareElements.length > 0) {
      isCloudflareDetected = true;
      console.log('Cloudflare detected - using gentle mode');
    }
  }
  
  // Get move step with gentle mode and variant-based pattern
  function getMoveStep() {
    let baseStep;
    
    // Use scroll pattern if available, otherwise use default CONFIG
    if (currentScrollPattern && scrollBehaviorModule) {
      baseStep = scrollBehaviorModule.generateScrollStep(currentScrollPattern);
    } else {
      baseStep = randomBetween(CONFIG.moveStep.min, CONFIG.moveStep.max);
    }
    
    if (isAdSenseDetected || isCloudflareDetected) {
      baseStep = Math.floor(baseStep * 0.6);
      baseStep = Math.max(baseStep, 15);
    }
    
    const speedFactor = Math.min(totalMoved / 1000, 1);
    return Math.floor(baseStep * (0.8 + speedFactor * 0.2));
  }

  // Get move delay with gentle mode and variant-based pattern
  function getMoveDelay() {
    let baseDelay;
    
    // Use scroll pattern if available, otherwise use default CONFIG
    if (currentScrollPattern && scrollBehaviorModule) {
      baseDelay = scrollBehaviorModule.generateDelay(currentScrollPattern);
    } else {
      baseDelay = randomBetween(CONFIG.moveDelay.min, CONFIG.moveDelay.max);
    }
    
    if (isAdSenseDetected || isCloudflareDetected) {
      baseDelay = Math.floor(baseDelay * 1.5);
    }
    
    const speedFactor = Math.min(totalMoved / 1000, 1);
    return Math.floor(baseDelay * (1 + speedFactor * 0.5));
  }
  
  // Check if should pause
  function shouldPause() {
    let pauseChance = CONFIG.pauseChance;
    
    // Use scroll pattern if available
    if (currentScrollPattern && scrollBehaviorModule) {
      pauseChance = currentScrollPattern.pauseChance;
    }
    
    if (isAdSenseDetected || isCloudflareDetected) {
      pauseChance = Math.min(pauseChance + 0.1, 0.4); // Increase pause chance for sensitive systems
    }
    
    return Math.random() < pauseChance;
  }
  
  // Perform move (ChatGPT compliant - no native function patching)
  function performMove() {
    if (!isActive) {
      console.log('performMove: Extension not active, skipping');
      return;
    }
    
    console.log('performMove: Executing move...');
    const now = Date.now();
    
    if (shouldPause()) {
      let pauseDuration;
      
      // Use scroll pattern if available
      if (currentScrollPattern && scrollBehaviorModule) {
        pauseDuration = randomBetween(currentScrollPattern.pauseDuration.min, currentScrollPattern.pauseDuration.max);
      } else {
        pauseDuration = randomBetween(CONFIG.pauseDuration.min, CONFIG.pauseDuration.max);
      }
      
      console.log('performMove: Pausing for', pauseDuration + 'ms');
      setTimeout(() => {
        if (isActive) performMove();
      }, pauseDuration);
      return;
    }
    
    // Check direction change chance
    let directionChangeChance = CONFIG.directionChangeChance;
    if (currentScrollPattern && scrollBehaviorModule) {
      directionChangeChance = currentScrollPattern.directionChangeChance;
    }
    
    if (Math.random() < directionChangeChance) {
      currentDirection *= -1;
      console.log('performMove: Direction changed to', currentDirection > 0 ? 'down' : 'up');
    }
    
    const moveAmount = getMoveStep() * currentDirection;
    
    console.log('performMove: Moving', moveAmount, 'pixels', currentDirection > 0 ? 'down' : 'up');
    // ChatGPT compliant - use native scrollBy without patching
    window.scrollBy({ top: moveAmount, behavior: 'auto' });
    
    totalMoved += Math.abs(moveAmount);
    lastMoveTime = now;
    
    // Update scroll behavior tracking
    if (scrollBehaviorModule) {
      scrollBehaviorModule.updateTotalScrolled(moveAmount);
    }
    
    console.log('performMove: Total moved so far:', totalMoved);
    
    // Check max distance
    let maxDistance = CONFIG.maxMoveDistance;
    if (currentScrollPattern && scrollBehaviorModule) {
      maxDistance = currentScrollPattern.maxScrollDistance;
    }
    
    if (totalMoved > maxDistance) {
      console.log('performMove: Max distance reached, stopping');
      stopMoving();
      return;
    }
    
    const nextDelay = getMoveDelay();
    console.log('performMove: Scheduling next move in', nextDelay + 'ms');
    setTimeout(performMove, nextDelay);
  }
  
  // Start moving
  function startMoving() {
    if (isActive) {
      console.log('Page navigation already active, skipping start');
      return;
    }
    
    console.log('Starting page navigation...');
    isActive = true;
    totalMoved = 0;
    lastMoveTime = 0;
    
    // Detect sensitive systems first
    detectSensitiveSystems();
    
    let initialDelay = randomBetween(500, 1500);
    if (isAdSenseDetected || isCloudflareDetected) {
      initialDelay = randomBetween(1000, 3000);
      console.log('AdSense/Cloudflare detected, using longer initial delay:', initialDelay + 'ms');
    } else {
      console.log('Using normal initial delay:', initialDelay + 'ms');
    }
    
    console.log('Scheduling first move in', initialDelay + 'ms');
    setTimeout(performMove, initialDelay);
    console.log('Page navigation started');
  }
  
  // Stop moving
  function stopMoving() {
    if (isActive) {
      isActive = false;
      console.log('Page navigation stopped');
    }
  }
  
  // Setup event listeners (ChatGPT compliant)
  window.addEventListener('page-nav-deactivate', stopMoving);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMoving();
  });
  window.addEventListener('beforeunload', stopMoving);
  
  // Initialize
  function initialize() {
    console.log('Inpage: Initializing...');
    
    // Initialize scroll behavior integration
    initializeScrollBehavior();
    
    // Detect sensitive systems
    detectSensitiveSystems();
    
    // Start moving immediately
    startMoving();
    console.log('Inpage: Page navigation system initialized');
  }
  
  // Start initialization immediately (no waiting for DOM)
  try {
    console.log('Inpage: Starting initialization immediately');
    console.log('Inpage: Setting __page_nav_active = true');
    window.__page_nav_active = true;
    console.log('Inpage: __page_nav_active set to:', window.__page_nav_active);
    
    initialize();
    console.log('Inpage: Script setup complete');
  } catch (error) {
    console.error('Inpage: Error in initialization:', error);
    console.error('Inpage: Error stack:', error.stack);
  }
  
})();
