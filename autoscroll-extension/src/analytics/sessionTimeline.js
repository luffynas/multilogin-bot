/**
 * Session Timeline - Session chronology and tracking
 */

import { createLogger } from '../utils/logger.js';
import { getStorageValue, setStorageValue } from '../utils/storage.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('session-timeline');

/**
 * Session Timeline Tracker
 * Tracks session chronology and user behavior patterns
 */
export class SessionTimelineTracker {
  constructor() {
    this.isActive = false;
    this.currentSession = null;
    this.timeline = [];
    this.config = {
      enabled: true,
      maxTimelineSize: 1000,
      autoSave: true,
      saveInterval: 30000, // 30 seconds
      exportFormats: ['json', 'csv'],
      tracking: {
        pageViews: true,
        scrollEvents: true,
        navigationEvents: true,
        interactionEvents: true,
        stealthEvents: true,
        performanceEvents: true
      }
    };
    
    this.sessionTypes = {
      short: {
        duration: { min: 300000, max: 900000 }, // 5-15 minutes
        pages: { min: 3, max: 8 },
        pattern: 'browsing'
      },
      medium: {
        duration: { min: 900000, max: 1800000 }, // 15-30 minutes
        pages: { min: 8, max: 15 },
        pattern: 'exploration'
      },
      long: {
        duration: { min: 1800000, max: 3600000 }, // 30-60 minutes
        pages: { min: 15, max: 30 },
        pattern: 'deep_reading'
      },
      extended: {
        duration: { min: 3600000, max: 7200000 }, // 1-2 hours
        pages: { min: 30, max: 60 },
        pattern: 'research'
      }
    };
    
    this.saveInterval = null;
  }

  /**
   * Initialize session timeline tracker
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing session timeline tracker', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.startTracking();
      }
      
      logger.info('Session timeline tracker initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing session timeline tracker', { error });
      return false;
    }
  }

  /**
   * Start session tracking
   * @param {Object} sessionConfig - Session configuration
   * @returns {Promise<boolean>} - Success status
   */
  async startTracking(sessionConfig = {}) {
    try {
      if (this.isActive) {
        logger.warn('Session tracking already active');
        return false;
      }

      this.isActive = true;
      
      // Create new session
      this.currentSession = this.createSession(sessionConfig);
      
      // Start auto-save if enabled
      if (this.config.autoSave && this.config.saveInterval > 0) {
        this.saveInterval = setInterval(() => {
          this.saveTimeline();
        }, this.config.saveInterval);
      }
      
      // Record session start
      await this.recordEvent('session_start', {
        sessionId: this.currentSession.id,
        sessionType: this.currentSession.type,
        startTime: this.currentSession.startTime,
        config: this.currentSession.config
      });
      
      logger.info('Session tracking started', { sessionId: this.currentSession.id });
      return true;
    } catch (error) {
      logger.error('Error starting session tracking', { error });
      return false;
    }
  }

  /**
   * Stop session tracking
   * @returns {Promise<boolean>} - Success status
   */
  async stopTracking() {
    try {
      if (!this.isActive) {
        logger.warn('Session tracking not active');
        return false;
      }

      this.isActive = false;
      
      // Clear save interval
      if (this.saveInterval) {
        clearInterval(this.saveInterval);
        this.saveInterval = null;
      }
      
      // Record session end
      if (this.currentSession) {
        this.currentSession.endTime = Date.now();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
        
        await this.recordEvent('session_end', {
          sessionId: this.currentSession.id,
          duration: this.currentSession.duration,
          endTime: this.currentSession.endTime,
          summary: this.generateSessionSummary()
        });
      }
      
      // Final save
      await this.saveTimeline();
      
      logger.info('Session tracking stopped', { 
        sessionId: this.currentSession?.id,
        duration: this.currentSession?.duration 
      });
      return true;
    } catch (error) {
      logger.error('Error stopping session tracking', { error });
      return false;
    }
  }

  /**
   * Create new session
   * @param {Object} config - Session configuration
   * @returns {Object} - Session object
   */
  createSession(config = {}) {
    try {
      const sessionId = this.generateSessionId();
      const sessionType = config.type || this.determineSessionType();
      const sessionConfig = this.sessionTypes[sessionType] || this.sessionTypes.medium;
      
      return {
        id: sessionId,
        type: sessionType,
        startTime: Date.now(),
        endTime: null,
        duration: 0,
        config: {
          ...sessionConfig,
          ...config
        },
        pages: [],
        events: [],
        stats: {
          totalEvents: 0,
          pageViews: 0,
          scrollEvents: 0,
          navigationEvents: 0,
          interactionEvents: 0,
          stealthEvents: 0,
          performanceEvents: 0,
          errors: 0
        },
        patterns: {
          reading: {},
          interaction: {},
          navigation: {},
          stealth: {}
        }
      };
    } catch (error) {
      logger.error('Error creating session', { error, config });
      return null;
    }
  }

  /**
   * Generate unique session ID
   * @returns {string} - Session ID
   */
  generateSessionId() {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      return `session_${timestamp}_${random}`;
    } catch (error) {
      logger.error('Error generating session ID', { error });
      return `session_${Date.now()}`;
    }
  }

  /**
   * Determine session type based on time and context
   * @returns {string} - Session type
   */
  determineSessionType() {
    try {
      const hour = new Date().getHours();
      
      // Time-based session type determination
      if (hour >= 6 && hour < 12) {
        return 'short'; // Morning browsing
      } else if (hour >= 12 && hour < 18) {
        return 'medium'; // Afternoon exploration
      } else if (hour >= 18 && hour < 22) {
        return 'long'; // Evening deep reading
      } else {
        return 'extended'; // Night research
      }
    } catch (error) {
      logger.error('Error determining session type', { error });
      return 'medium';
    }
  }

  /**
   * Record timeline event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   * @returns {Promise<boolean>} - Success status
   */
  async recordEvent(type, data = {}) {
    try {
      if (!this.isActive || !this.currentSession) {
        return false;
      }

      const event = {
        id: this.generateEventId(),
        type,
        data,
        timestamp: Date.now(),
        sessionId: this.currentSession.id,
        pageUrl: window.location.href,
        pageTitle: document.title
      };

      // Add to timeline
      this.timeline.push(event);
      this.currentSession.events.push(event);
      
      // Update session stats
      this.updateSessionStats(type, data);
      
      // Update patterns
      this.updatePatterns(type, data);
      
      // Maintain timeline size
      if (this.timeline.length > this.config.maxTimelineSize) {
        this.timeline.shift();
      }
      
      logger.debug('Timeline event recorded', { type, eventId: event.id });
      return true;
    } catch (error) {
      logger.error('Error recording timeline event', { error, type, data });
      return false;
    }
  }

  /**
   * Generate unique event ID
   * @returns {string} - Event ID
   */
  generateEventId() {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6);
      return `event_${timestamp}_${random}`;
    } catch (error) {
      logger.error('Error generating event ID', { error });
      return `event_${Date.now()}`;
    }
  }

  /**
   * Update session statistics
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  updateSessionStats(type, data) {
    try {
      if (!this.currentSession) return;
      
      const stats = this.currentSession.stats;
      stats.totalEvents++;
      
      switch (type) {
        case 'page_view':
          stats.pageViews++;
          this.addPageToSession(data);
          break;
        case 'scroll':
          stats.scrollEvents++;
          break;
        case 'navigation':
          stats.navigationEvents++;
          break;
        case 'interaction':
          stats.interactionEvents++;
          break;
        case 'stealth':
          stats.stealthEvents++;
          break;
        case 'performance':
          stats.performanceEvents++;
          break;
        case 'error':
          stats.errors++;
          break;
      }
    } catch (error) {
      logger.error('Error updating session stats', { error, type, data });
    }
  }

  /**
   * Add page to session
   * @param {Object} data - Page data
   */
  addPageToSession(data) {
    try {
      if (!this.currentSession) return;
      
      const page = {
        url: data.url || window.location.href,
        title: data.title || document.title,
        timestamp: Date.now(),
        duration: 0,
        scrollDistance: 0,
        interactions: 0,
        events: []
      };
      
      this.currentSession.pages.push(page);
    } catch (error) {
      logger.error('Error adding page to session', { error, data });
    }
  }

  /**
   * Update behavior patterns
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  updatePatterns(type, data) {
    try {
      if (!this.currentSession) return;
      
      const patterns = this.currentSession.patterns;
      
      switch (type) {
        case 'scroll':
          this.updateReadingPatterns(data, patterns.reading);
          break;
        case 'interaction':
          this.updateInteractionPatterns(data, patterns.interaction);
          break;
        case 'navigation':
          this.updateNavigationPatterns(data, patterns.navigation);
          break;
        case 'stealth':
          this.updateStealthPatterns(data, patterns.stealth);
          break;
      }
    } catch (error) {
      logger.error('Error updating patterns', { error, type, data });
    }
  }

  /**
   * Update reading patterns
   * @param {Object} data - Scroll data
   * @param {Object} patterns - Reading patterns object
   */
  updateReadingPatterns(data, patterns) {
    try {
      const { delta, speed, strategy } = data;
      
      // Update speed patterns
      if (speed) {
        const speedCategory = this.categorizeSpeed(speed);
        patterns[speedCategory] = (patterns[speedCategory] || 0) + 1;
      }
      
      // Update strategy patterns
      if (strategy) {
        patterns[strategy] = (patterns[strategy] || 0) + 1;
      }
      
      // Update scroll distance patterns
      if (delta) {
        const distanceCategory = this.categorizeDistance(Math.abs(delta));
        patterns[distanceCategory] = (patterns[distanceCategory] || 0) + 1;
      }
    } catch (error) {
      logger.error('Error updating reading patterns', { error, data });
    }
  }

  /**
   * Update interaction patterns
   * @param {Object} data - Interaction data
   * @param {Object} patterns - Interaction patterns object
   */
  updateInteractionPatterns(data, patterns) {
    try {
      const { type, element, duration } = data;
      
      if (type) {
        patterns[type] = (patterns[type] || 0) + 1;
      }
      
      if (element) {
        const elementType = this.categorizeElement(element);
        patterns[elementType] = (patterns[elementType] || 0) + 1;
      }
      
      if (duration) {
        const durationCategory = this.categorizeDuration(duration);
        patterns[durationCategory] = (patterns[durationCategory] || 0) + 1;
      }
    } catch (error) {
      logger.error('Error updating interaction patterns', { error, data });
    }
  }

  /**
   * Update navigation patterns
   * @param {Object} data - Navigation data
   * @param {Object} patterns - Navigation patterns object
   */
  updateNavigationPatterns(data, patterns) {
    try {
      const { type, delay, success } = data;
      
      if (type) {
        patterns[type] = (patterns[type] || 0) + 1;
      }
      
      if (delay) {
        const delayCategory = this.categorizeDelay(delay);
        patterns[delayCategory] = (patterns[delayCategory] || 0) + 1;
      }
      
      if (success !== undefined) {
        patterns[success ? 'success' : 'failure'] = (patterns[success ? 'success' : 'failure'] || 0) + 1;
      }
    } catch (error) {
      logger.error('Error updating navigation patterns', { error, data });
    }
  }

  /**
   * Update stealth patterns
   * @param {Object} data - Stealth data
   * @param {Object} patterns - Stealth patterns object
   */
  updateStealthPatterns(data, patterns) {
    try {
      const { type, module, intensity } = data;
      
      if (type) {
        patterns[type] = (patterns[type] || 0) + 1;
      }
      
      if (module) {
        patterns[module] = (patterns[module] || 0) + 1;
      }
      
      if (intensity) {
        const intensityCategory = this.categorizeIntensity(intensity);
        patterns[intensityCategory] = (patterns[intensityCategory] || 0) + 1;
      }
    } catch (error) {
      logger.error('Error updating stealth patterns', { error, data });
    }
  }

  /**
   * Categorize speed value
   * @param {number} speed - Speed value
   * @returns {string} - Speed category
   */
  categorizeSpeed(speed) {
    if (speed < 0.5) return 'slow';
    if (speed < 1.0) return 'normal';
    if (speed < 2.0) return 'fast';
    return 'very_fast';
  }

  /**
   * Categorize distance value
   * @param {number} distance - Distance value
   * @returns {string} - Distance category
   */
  categorizeDistance(distance) {
    if (distance < 50) return 'small';
    if (distance < 150) return 'medium';
    if (distance < 300) return 'large';
    return 'very_large';
  }

  /**
   * Categorize duration value
   * @param {number} duration - Duration value
   * @returns {string} - Duration category
   */
  categorizeDuration(duration) {
    if (duration < 500) return 'quick';
    if (duration < 2000) return 'normal';
    if (duration < 5000) return 'long';
    return 'very_long';
  }

  /**
   * Categorize delay value
   * @param {number} delay - Delay value
   * @returns {string} - Delay category
   */
  categorizeDelay(delay) {
    if (delay < 1000) return 'immediate';
    if (delay < 3000) return 'quick';
    if (delay < 8000) return 'normal';
    return 'slow';
  }

  /**
   * Categorize intensity value
   * @param {number} intensity - Intensity value
   * @returns {string} - Intensity category
   */
  categorizeIntensity(intensity) {
    if (intensity < 0.3) return 'low';
    if (intensity < 0.7) return 'medium';
    return 'high';
  }

  /**
   * Categorize element type
   * @param {string} element - Element identifier
   * @returns {string} - Element category
   */
  categorizeElement(element) {
    if (element.includes('button')) return 'button';
    if (element.includes('link')) return 'link';
    if (element.includes('input')) return 'input';
    if (element.includes('image')) return 'image';
    return 'other';
  }

  /**
   * Generate session summary
   * @returns {Object} - Session summary
   */
  generateSessionSummary() {
    try {
      if (!this.currentSession) return null;
      
      const session = this.currentSession;
      const stats = session.stats;
      
      return {
        sessionId: session.id,
        type: session.type,
        duration: session.duration,
        pagesVisited: session.pages.length,
        totalEvents: stats.totalEvents,
        eventDistribution: {
          pageViews: stats.pageViews,
          scrollEvents: stats.scrollEvents,
          navigationEvents: stats.navigationEvents,
          interactionEvents: stats.interactionEvents,
          stealthEvents: stats.stealthEvents,
          performanceEvents: stats.performanceEvents,
          errors: stats.errors
        },
        patterns: session.patterns,
        efficiency: this.calculateEfficiency(),
        behaviorScore: this.calculateBehaviorScore(),
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Error generating session summary', { error });
      return null;
    }
  }

  /**
   * Calculate session efficiency
   * @returns {number} - Efficiency score (0-1)
   */
  calculateEfficiency() {
    try {
      if (!this.currentSession) return 0;
      
      const stats = this.currentSession.stats;
      const pages = this.currentSession.pages.length;
      const duration = this.currentSession.duration;
      
      if (pages === 0 || duration === 0) return 0;
      
      // Calculate efficiency based on pages per minute and event distribution
      const pagesPerMinute = (pages / duration) * 60000;
      const eventEfficiency = stats.errors / Math.max(stats.totalEvents, 1);
      
      // Normalize efficiency score
      const efficiency = Math.min(pagesPerMinute / 2, 1) * (1 - eventEfficiency);
      return Math.max(0, Math.min(1, efficiency));
    } catch (error) {
      logger.error('Error calculating efficiency', { error });
      return 0;
    }
  }

  /**
   * Calculate behavior score
   * @returns {number} - Behavior score (0-1)
   */
  calculateBehaviorScore() {
    try {
      if (!this.currentSession) return 0;
      
      const patterns = this.currentSession.patterns;
      let score = 0.5; // Base score
      
      // Factor in reading patterns
      const readingPatterns = patterns.reading;
      const totalReading = Object.values(readingPatterns).reduce((sum, count) => sum + count, 0);
      
      if (totalReading > 0) {
        const normalRatio = (readingPatterns.normal || 0) / totalReading;
        const fastRatio = (readingPatterns.fast || 0) / totalReading;
        
        score += normalRatio * 0.2;
        score -= fastRatio * 0.1;
      }
      
      // Factor in interaction patterns
      const interactionPatterns = patterns.interaction;
      const totalInteraction = Object.values(interactionPatterns).reduce((sum, count) => sum + count, 0);
      
      if (totalInteraction > 0) {
        const balancedRatio = (interactionPatterns.normal || 0) / totalInteraction;
        score += balancedRatio * 0.15;
      }
      
      // Factor in navigation patterns
      const navigationPatterns = patterns.navigation;
      const totalNavigation = Object.values(navigationPatterns).reduce((sum, count) => sum + count, 0);
      
      if (totalNavigation > 0) {
        const successRatio = (navigationPatterns.success || 0) / totalNavigation;
        score += successRatio * 0.1;
      }
      
      return Math.max(0, Math.min(1, score));
    } catch (error) {
      logger.error('Error calculating behavior score', { error });
      return 0;
    }
  }

  /**
   * Get timeline data
   * @param {Object} filters - Filter options
   * @returns {Object} - Timeline data
   */
  getTimeline(filters = {}) {
    try {
      let events = [...this.timeline];
      
      // Apply filters
      if (filters.type) {
        events = events.filter(event => event.type === filters.type);
      }
      
      if (filters.startTime) {
        events = events.filter(event => event.timestamp >= filters.startTime);
      }
      
      if (filters.endTime) {
        events = events.filter(event => event.timestamp <= filters.endTime);
      }
      
      if (filters.limit) {
        events = events.slice(-filters.limit);
      }
      
      return {
        events,
        total: events.length,
        currentSession: this.currentSession,
        filters
      };
    } catch (error) {
      logger.error('Error getting timeline', { error, filters });
      return { events: [], total: 0, currentSession: null, filters };
    }
  }

  /**
   * Get session data
   * @returns {Object} - Session data
   */
  getSession() {
    try {
      return {
        current: this.currentSession,
        timeline: this.timeline,
        config: this.config
      };
    } catch (error) {
      logger.error('Error getting session', { error });
      return { current: null, timeline: [], config: this.config };
    }
  }

  /**
   * Export timeline data
   * @param {string} format - Export format (json, csv)
   * @returns {Promise<Object>} - Export data
   */
  async exportTimeline(format = 'json') {
    try {
      const timeline = this.getTimeline();
      const session = this.getSession();
      
      switch (format) {
        case 'json':
          return {
            format: 'json',
            data: {
              session: session.current,
              timeline: timeline.events,
              summary: this.generateSessionSummary()
            },
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        case 'csv':
          return {
            format: 'csv',
            data: this.convertToCSV(timeline.events),
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      logger.error('Error exporting timeline', { error, format });
      throw error;
    }
  }

  /**
   * Convert timeline to CSV format
   * @param {Array} events - Timeline events
   * @returns {string} - CSV data
   */
  convertToCSV(events) {
    try {
      const rows = [];
      rows.push(['Timestamp', 'Type', 'Session ID', 'Page URL', 'Page Title', 'Data']);
      
      events.forEach(event => {
        rows.push([
          new Date(event.timestamp).toISOString(),
          event.type,
          event.sessionId,
          event.pageUrl,
          event.pageTitle,
          JSON.stringify(event.data)
        ]);
      });
      
      return rows.map(row => row.join(',')).join('\n');
    } catch (error) {
      logger.error('Error converting to CSV', { error });
      return '';
    }
  }

  /**
   * Save timeline to storage
   * @returns {Promise<boolean>} - Success status
   */
  async saveTimeline() {
    try {
      const data = {
        currentSession: this.currentSession,
        timeline: this.timeline,
        config: this.config
      };
      
      await setStorageValue('sessionTimeline', data);
      
      logger.debug('Timeline saved to storage');
      return true;
    } catch (error) {
      logger.error('Error saving timeline', { error });
      return false;
    }
  }

  /**
   * Load timeline from storage
   * @returns {Promise<Object>} - Loaded timeline data
   */
  async loadTimeline() {
    try {
      const data = await getStorageValue('sessionTimeline');
      if (data) {
        this.currentSession = data.currentSession;
        this.timeline = data.timeline || [];
        this.config = { ...this.config, ...data.config };
        
        logger.info('Timeline loaded from storage');
      }
      
      return {
        currentSession: this.currentSession,
        timeline: this.timeline,
        config: this.config
      };
    } catch (error) {
      logger.error('Error loading timeline', { error });
      return { currentSession: null, timeline: [], config: this.config };
    }
  }

  /**
   * Clear timeline data
   * @returns {Promise<boolean>} - Success status
   */
  async clearTimeline() {
    try {
      this.timeline = [];
      this.currentSession = null;
      
      await setStorageValue('sessionTimeline', null);
      
      logger.info('Timeline data cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing timeline', { error });
      return false;
    }
  }
}

/**
 * Create session timeline tracker instance
 * @param {Object} config - Configuration object
 * @returns {SessionTimelineTracker} - Session timeline tracker instance
 */
export function createSessionTimelineTracker(config = {}) {
  return new SessionTimelineTracker(config);
}

/**
 * Default session timeline tracker instance
 */
export const sessionTimelineTracker = createSessionTimelineTracker();
