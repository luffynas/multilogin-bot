/**
 * Link parser for normalizing and validating links
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice } from '@core/randomizer.js';

const logger = createLogger('link-parser');

/**
 * Link Parser
 * Parses, normalizes, and validates links
 */
export class LinkParser {
  constructor() {
    this.config = {
      enabled: true,
      maxLinkLength: 2048,
      allowedProtocols: ['http:', 'https:', 'mailto:', 'tel:'],
      blockedDomains: [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1'
      ],
      blockedExtensions: [
        '.exe', '.dmg', '.pkg', '.deb', '.rpm',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx',
        '.ppt', '.pptx', '.mp3', '.mp4', '.avi',
        '.mov', '.wmv', '.flv', '.mkv'
      ],
      blockedPatterns: [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /file:/i,
        /ftp:/i
      ],
      normalization: {
        removeFragment: true,
        removeQueryParams: false,
        removeTrailingSlash: true,
        lowercaseHostname: true,
        preservePath: true
      },
      validation: {
        checkProtocol: true,
        checkDomain: true,
        checkPath: true,
        checkQuery: true,
        checkFragment: true
      }
    };
    
    this.stats = {
      totalLinksParsed: 0,
      validLinks: 0,
      invalidLinks: 0,
      blockedLinks: 0,
      normalizedLinks: 0,
      errors: 0
    };
  }

  /**
   * Parse link
   * @param {string|HTMLElement} link - Link URL or element
   * @returns {Object|null} - Parsed link object or null
   */
  parseLink(link) {
    try {
      let url, element;
      
      if (typeof link === 'string') {
        url = link;
        element = null;
      } else if (link && link.href) {
        url = link.href;
        element = link;
      } else {
        logger.warn('Invalid link input', { link });
        return null;
      }
      
      // Parse URL
      const parsedUrl = this.parseUrl(url);
      if (!parsedUrl) {
        this.stats.invalidLinks++;
        return null;
      }
      
      // Validate link
      if (!this.validateLink(parsedUrl)) {
        this.stats.blockedLinks++;
        return null;
      }
      
      // Normalize link
      const normalizedUrl = this.normalizeUrl(parsedUrl);
      
      // Create link object
      const linkObj = {
        original: url,
        normalized: normalizedUrl,
        parsed: parsedUrl,
        element: element,
        text: element?.textContent?.trim() || '',
        title: element?.title || '',
        ariaLabel: element?.getAttribute('aria-label') || '',
        target: element?.target || '_self',
        rel: element?.rel || '',
        type: this.determineLinkType(normalizedUrl, element),
        category: this.categorizeLink(normalizedUrl, element),
        confidence: this.calculateLinkConfidence(normalizedUrl, element),
        timestamp: Date.now(),
        metadata: this.extractMetadata(normalizedUrl, element)
      };
      
      this.stats.totalLinksParsed++;
      this.stats.validLinks++;
      
      if (normalizedUrl !== url) {
        this.stats.normalizedLinks++;
      }
      
      logger.debug('Link parsed', { 
        original: url, 
        normalized: normalizedUrl,
        type: linkObj.type,
        category: linkObj.category
      });
      
      return linkObj;
    } catch (error) {
      logger.error('Error parsing link', { error, link });
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Parse URL
   * @param {string} url - URL to parse
   * @returns {Object|null} - Parsed URL object or null
   */
  parseUrl(url) {
    try {
      if (!url || typeof url !== 'string') {
        return null;
      }
      
      // Clean URL
      const cleanUrl = url.trim();
      if (!cleanUrl) {
        return null;
      }
      
      // Try to parse as URL
      let parsedUrl;
      try {
        parsedUrl = new URL(cleanUrl);
      } catch (urlError) {
        // Try to parse as relative URL
        try {
          parsedUrl = new URL(cleanUrl, window.location.origin);
        } catch (relativeError) {
          logger.warn('Failed to parse URL', { url: cleanUrl, error: relativeError });
          return null;
        }
      }
      
      return {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
        hash: parsedUrl.hash,
        href: parsedUrl.href,
        origin: parsedUrl.origin
      };
    } catch (error) {
      logger.error('Error parsing URL', { error, url });
      return null;
    }
  }

  /**
   * Validate link
   * @param {Object} parsedUrl - Parsed URL object
   * @returns {boolean} - True if valid
   */
  validateLink(parsedUrl) {
    try {
      // Check protocol
      if (this.config.validation.checkProtocol) {
        if (!this.config.allowedProtocols.includes(parsedUrl.protocol)) {
          logger.debug('Blocked protocol', { protocol: parsedUrl.protocol });
          return false;
        }
      }
      
      // Check domain
      if (this.config.validation.checkDomain) {
        if (this.config.blockedDomains.includes(parsedUrl.hostname)) {
          logger.debug('Blocked domain', { hostname: parsedUrl.hostname });
          return false;
        }
      }
      
      // Check path
      if (this.config.validation.checkPath) {
        for (const extension of this.config.blockedExtensions) {
          if (parsedUrl.pathname.toLowerCase().endsWith(extension)) {
            logger.debug('Blocked extension', { pathname: parsedUrl.pathname, extension });
            return false;
          }
        }
      }
      
      // Check query
      if (this.config.validation.checkQuery) {
        for (const pattern of this.config.blockedPatterns) {
          if (pattern.test(parsedUrl.search)) {
            logger.debug('Blocked query pattern', { search: parsedUrl.search });
            return false;
          }
        }
      }
      
      // Check fragment
      if (this.config.validation.checkFragment) {
        for (const pattern of this.config.blockedPatterns) {
          if (pattern.test(parsedUrl.hash)) {
            logger.debug('Blocked fragment pattern', { hash: parsedUrl.hash });
            return false;
          }
        }
      }
      
      // Check URL length
      if (parsedUrl.href.length > this.config.maxLinkLength) {
        logger.debug('URL too long', { length: parsedUrl.href.length });
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error validating link', { error, parsedUrl });
      return false;
    }
  }

  /**
   * Normalize URL
   * @param {Object} parsedUrl - Parsed URL object
   * @returns {string} - Normalized URL
   */
  normalizeUrl(parsedUrl) {
    try {
      let normalized = parsedUrl.href;
      
      // Remove fragment
      if (this.config.normalization.removeFragment) {
        normalized = normalized.split('#')[0];
      }
      
      // Remove query parameters
      if (this.config.normalization.removeQueryParams) {
        normalized = normalized.split('?')[0];
      }
      
      // Remove trailing slash
      if (this.config.normalization.removeTrailingSlash) {
        if (normalized.endsWith('/') && normalized.length > 1) {
          normalized = normalized.slice(0, -1);
        }
      }
      
      // Lowercase hostname
      if (this.config.normalization.lowercaseHostname) {
        const url = new URL(normalized);
        url.hostname = url.hostname.toLowerCase();
        normalized = url.href;
      }
      
      return normalized;
    } catch (error) {
      logger.error('Error normalizing URL', { error, parsedUrl });
      return parsedUrl.href;
    }
  }

  /**
   * Determine link type
   * @param {string} url - Normalized URL
   * @param {HTMLElement} element - Link element
   * @returns {string} - Link type
   */
  determineLinkType(url, element) {
    try {
      const parsedUrl = new URL(url);
      
      // Check for external links
      if (parsedUrl.origin !== window.location.origin) {
        return 'external';
      }
      
      // Check for internal links
      if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') {
        return 'home';
      }
      
      // Check for navigation links
      if (element) {
        const text = element.textContent?.trim().toLowerCase() || '';
        const title = element.title?.toLowerCase() || '';
        const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
        const rel = element.rel?.toLowerCase() || '';
        
        // Check for next/previous links
        if (rel.includes('next') || text.includes('next') || title.includes('next')) {
          return 'next';
        }
        
        if (rel.includes('prev') || text.includes('prev') || title.includes('prev')) {
          return 'previous';
        }
        
        // Check for related links
        if (rel.includes('related') || text.includes('related') || title.includes('related')) {
          return 'related';
        }
        
        // Check for recent links
        if (text.includes('recent') || title.includes('recent') || ariaLabel.includes('recent')) {
          return 'recent';
        }
      }
      
      // Check for pagination
      if (parsedUrl.pathname.includes('/page/') || parsedUrl.search.includes('page=')) {
        return 'pagination';
      }
      
      // Check for search
      if (parsedUrl.search.includes('q=') || parsedUrl.search.includes('search=')) {
        return 'search';
      }
      
      // Check for category
      if (parsedUrl.pathname.includes('/category/') || parsedUrl.pathname.includes('/tag/')) {
        return 'category';
      }
      
      // Check for article
      if (parsedUrl.pathname.includes('/article/') || parsedUrl.pathname.includes('/post/')) {
        return 'article';
      }
      
      return 'internal';
    } catch (error) {
      logger.error('Error determining link type', { error, url });
      return 'unknown';
    }
  }

  /**
   * Categorize link
   * @param {string} url - Normalized URL
   * @param {HTMLElement} element - Link element
   * @returns {string} - Link category
   */
  categorizeLink(url, element) {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname.toLowerCase();
      const text = element?.textContent?.trim().toLowerCase() || '';
      const title = element?.title?.toLowerCase() || '';
      
      // Technology
      if (pathname.includes('tech') || pathname.includes('programming') || 
          text.includes('javascript') || text.includes('python') || 
          text.includes('react') || text.includes('vue')) {
        return 'technology';
      }
      
      // Business
      if (pathname.includes('business') || pathname.includes('marketing') || 
          text.includes('business') || text.includes('marketing') || 
          text.includes('sales') || text.includes('finance')) {
        return 'business';
      }
      
      // Lifestyle
      if (pathname.includes('health') || pathname.includes('fitness') || 
          text.includes('health') || text.includes('fitness') || 
          text.includes('travel') || text.includes('food')) {
        return 'lifestyle';
      }
      
      // Education
      if (pathname.includes('education') || pathname.includes('learning') || 
          text.includes('education') || text.includes('learning') || 
          text.includes('course') || text.includes('tutorial')) {
        return 'education';
      }
      
      // News
      if (pathname.includes('news') || pathname.includes('breaking') || 
          text.includes('news') || text.includes('breaking') || 
          text.includes('latest') || text.includes('update')) {
        return 'news';
      }
      
      return 'general';
    } catch (error) {
      logger.error('Error categorizing link', { error, url });
      return 'general';
    }
  }

  /**
   * Calculate link confidence
   * @param {string} url - Normalized URL
   * @param {HTMLElement} element - Link element
   * @returns {number} - Confidence score (0-1)
   */
  calculateLinkConfidence(url, element) {
    try {
      let confidence = 0.5; // Base confidence
      
      if (element) {
        // Boost confidence for visible elements
        if (element.offsetWidth > 0 && element.offsetHeight > 0) {
          confidence += 0.2;
        }
        
        // Boost confidence for elements with text
        if (element.textContent?.trim()) {
          confidence += 0.1;
        }
        
        // Boost confidence for elements with title
        if (element.title) {
          confidence += 0.1;
        }
        
        // Boost confidence for elements with aria-label
        if (element.getAttribute('aria-label')) {
          confidence += 0.1;
        }
        
        // Boost confidence for elements in navigation context
        const parent = element.closest('nav, .navigation, .pagination, .pager');
        if (parent) {
          confidence += 0.1;
        }
      }
      
      // Boost confidence for internal links
      const parsedUrl = new URL(url);
      if (parsedUrl.origin === window.location.origin) {
        confidence += 0.1;
      }
      
      return Math.min(1, confidence);
    } catch (error) {
      logger.error('Error calculating link confidence', { error, url });
      return 0.5;
    }
  }

  /**
   * Extract metadata from link
   * @param {string} url - Normalized URL
   * @param {HTMLElement} element - Link element
   * @returns {Object} - Link metadata
   */
  extractMetadata(url, element) {
    try {
      const metadata = {
        domain: '',
        path: '',
        query: '',
        fragment: '',
        size: { width: 0, height: 0 },
        position: { x: 0, y: 0 },
        attributes: {}
      };
      
      if (url) {
        const parsedUrl = new URL(url);
        metadata.domain = parsedUrl.hostname;
        metadata.path = parsedUrl.pathname;
        metadata.query = parsedUrl.search;
        metadata.fragment = parsedUrl.hash;
      }
      
      if (element) {
        const rect = element.getBoundingClientRect();
        metadata.size = {
          width: rect.width,
          height: rect.height
        };
        metadata.position = {
          x: rect.left,
          y: rect.top
        };
        
        // Extract common attributes
        const commonAttributes = [
          'id', 'class', 'title', 'aria-label', 'role', 'target', 'rel',
          'data-href', 'data-url', 'data-action', 'data-type'
        ];
        
        for (const attr of commonAttributes) {
          if (element.hasAttribute(attr)) {
            metadata.attributes[attr] = element.getAttribute(attr);
          }
        }
      }
      
      return metadata;
    } catch (error) {
      logger.error('Error extracting metadata', { error, url });
      return {};
    }
  }

  /**
   * Parse multiple links
   * @param {Array} links - Array of links to parse
   * @returns {Array} - Array of parsed link objects
   */
  parseLinks(links) {
    try {
      if (!Array.isArray(links)) {
        logger.warn('Invalid links input', { links });
        return [];
      }
      
      const parsedLinks = [];
      
      for (const link of links) {
        const parsedLink = this.parseLink(link);
        if (parsedLink) {
          parsedLinks.push(parsedLink);
        }
      }
      
      logger.debug('Links parsed', { 
        input: links.length, 
        output: parsedLinks.length 
      });
      
      return parsedLinks;
    } catch (error) {
      logger.error('Error parsing links', { error, links });
      return [];
    }
  }

  /**
   * Filter links by type
   * @param {Array} links - Array of parsed links
   * @param {string} type - Link type to filter by
   * @returns {Array} - Filtered links
   */
  filterLinksByType(links, type) {
    try {
      if (!Array.isArray(links)) {
        return [];
      }
      
      return links.filter(link => link.type === type);
    } catch (error) {
      logger.error('Error filtering links by type', { error, type });
      return [];
    }
  }

  /**
   * Filter links by category
   * @param {Array} links - Array of parsed links
   * @param {string} category - Link category to filter by
   * @returns {Array} - Filtered links
   */
  filterLinksByCategory(links, category) {
    try {
      if (!Array.isArray(links)) {
        return [];
      }
      
      return links.filter(link => link.category === category);
    } catch (error) {
      logger.error('Error filtering links by category', { error, category });
      return [];
    }
  }

  /**
   * Sort links by confidence
   * @param {Array} links - Array of parsed links
   * @returns {Array} - Sorted links
   */
  sortLinksByConfidence(links) {
    try {
      if (!Array.isArray(links)) {
        return [];
      }
      
      return links.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('Error sorting links by confidence', { error });
      return links;
    }
  }

  /**
   * Get current statistics
   * @returns {Object} - Current statistics
   */
  getStats() {
    return {
      ...this.stats,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalLinksParsed: 0,
      validLinks: 0,
      invalidLinks: 0,
      blockedLinks: 0,
      normalizedLinks: 0,
      errors: 0
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Link parser configuration updated', { config: this.config });
    } catch (error) {
      logger.error('Error updating configuration', { error });
    }
  }
}

/**
 * Create link parser instance
 * @param {Object} config - Configuration object
 * @returns {LinkParser} - Parser instance
 */
export function createLinkParser(config = {}) {
  return new LinkParser(config);
}

/**
 * Default link parser instance
 */
export const linkParser = createLinkParser();
