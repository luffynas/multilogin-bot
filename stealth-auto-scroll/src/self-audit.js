/**
 * Self-Audit Script - Stealth Extension
 * Based on ChatGPT template for testing stealth capabilities
 */

(function selfAudit(){
  'use strict';
  
  console.log('🔍 Starting Stealth Extension Self-Audit...');
  
  // 1) Check for globals (excluding native browser properties)
  const suspicious = [];
  const nativeProps = ['scrollbars', 'external', 'scrollX', 'scrollY', 'scroll', 'scrollBy', 'scrollTo', 'innerWidth', 'innerHeight', 'outerWidth', 'outerHeight'];
  
  for(let k in window){
    if(/^(ext|auto|scroll|myext|stealth|bot|page_nav)/i.test(k) && !nativeProps.includes(k)) {
      suspicious.push(k);
    }
  }
  console.log('possible window globals', suspicious);

  // 2) Check native function patching
  ['scrollTo','fetch','XMLHttpRequest'].forEach(fn => {
    try{
      if(Function.prototype.toString.call(window[fn]).indexOf('[native code]') === -1){
        console.warn(fn, 'may be patched');
      }
    }catch(e){}
  });

  // 3) Resource check (attempt fetch chrome-extension resource should fail on unrelated pages)
  // 4) Dummy ad element check
  const d = document.createElement('div'); 
  d.className='ads-banner-test'; 
  document.body.appendChild(d);
  const hidden = window.getComputedStyle(d).display === 'none';
  console.log('dummy ads hidden?', hidden);
  d.remove();
  
  // 5) Check for chrome-extension resources
  const scripts = document.querySelectorAll('script[src]');
  let hasExtensionResources = false;
  scripts.forEach(script => {
    if (script.src.includes('chrome-extension://')) {
      hasExtensionResources = true;
      console.warn('Extension resource detected:', script.src);
    }
  });
  
  if (!hasExtensionResources) {
    console.log('✅ No extension resources detected');
  }
  
  // 6) Performance check
  const startTime = performance.now();
  for(let i = 0; i < 1000; i++) {
    Math.random();
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  if (executionTime > 10) {
    console.warn('⚠️ Performance impact detected:', executionTime + 'ms');
  } else {
    console.log('✅ Performance impact minimal:', executionTime + 'ms');
  }
  
  // Summary
  const hasIssues = suspicious.length > 0 || hasExtensionResources || executionTime > 10;
  console.log('🎯 Overall Status:', hasIssues ? 'FAIL' : 'PASS');
  
  if (!hasIssues) {
    console.log('🎉 Extension appears to be stealthy!');
  } else {
    console.log('❌ Extension may be detectable. Review the warnings above.');
  }
})();
