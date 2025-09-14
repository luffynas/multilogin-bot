/**
 * Pattern Replay - Pattern recording and replay functionality
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('pattern-replay');

/**
 * Pattern Replay Manager
 * Records and replays user behavior patterns
 */
export class PatternReplayManager {
  constructor() {
    this.isActive = false;
    this.isRecording = false;
    this.isReplaying = false;
    this.config = {
      enabled: true,
      recording: {
        enabled: true,
        maxDuration: 300000, // 5 minutes
        maxEvents: 10000,
        eventTypes: ['scroll', 'navigation', 'interaction', 'stealth'],
        compression: true
      },
      replay: {
        enabled: true,
        speed: 1.0, // 1.0 = normal speed
        variation: 0.1, // 10% variation
        loop: false,
        pauseOnError: true
      },
      storage: {
        maxPatterns: 100,
        autoSave: true,
        exportFormats: ['json', 'csv']
      }
    };
    
    this.recordedPatterns = new Map();
    this.currentPattern = null;
    this.replayQueue = [];
    this.replayIndex = 0;
    this.replayTimer = null;
    this.recordingStartTime = null;
    this.recordingEvents = [];
  }

  /**
   * Initialize pattern replay manager
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing pattern replay manager', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.loadStoredPatterns();
      }
      
      logger.info('Pattern replay manager initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing pattern replay manager', { error });
      return false;
    }
  }

  /**
   * Start recording pattern
   * @param {string} patternName - Name for the pattern
   * @param {Object} options - Recording options
   * @returns {Promise<boolean>} - Success status
   */
  async startRecording(patternName, options = {}) {
    try {
      if (this.isRecording) {
        logger.warn('Already recording a pattern');
        return false;
      }

      if (!this.config.recording.enabled) {
        logger.warn('Recording is disabled');
        return false;
      }

      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.recordingEvents = [];
      
      this.currentPattern = {
        name: patternName,
        id: this.generatePatternId(),
        startTime: this.recordingStartTime,
        endTime: null,
        duration: 0,
        events: [],
        metadata: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          url: window.location.href,
          title: document.title,
          ...options
        },
        stats: {
          totalEvents: 0,
          eventTypes: {},
          averageInterval: 0,
          maxInterval: 0,
          minInterval: Infinity
        }
      };
      
      logger.info('Pattern recording started', { patternName, patternId: this.currentPattern.id });
      return true;
    } catch (error) {
      logger.error('Error starting pattern recording', { error, patternName, options });
      return false;
    }
  }

  /**
   * Stop recording pattern
   * @returns {Promise<Object>} - Recorded pattern
   */
  async stopRecording() {
    try {
      if (!this.isRecording) {
        logger.warn('No pattern is being recorded');
        return null;
      }

      this.isRecording = false;
      const endTime = Date.now();
      
      if (this.currentPattern) {
        this.currentPattern.endTime = endTime;
        this.currentPattern.duration = endTime - this.currentPattern.startTime;
        this.currentPattern.events = [...this.recordingEvents];
        
        // Calculate statistics
        this.calculatePatternStats(this.currentPattern);
        
        // Compress if enabled
        if (this.config.recording.compression) {
          this.compressPattern(this.currentPattern);
        }
        
        // Store pattern
        this.recordedPatterns.set(this.currentPattern.id, this.currentPattern);
        
        // Auto-save if enabled
        if (this.config.storage.autoSave) {
          await this.savePattern(this.currentPattern);
        }
        
        logger.info('Pattern recording stopped', { 
          patternId: this.currentPattern.id, 
          duration: this.currentPattern.duration,
          events: this.currentPattern.events.length 
        });
        
        return this.currentPattern;
      }
      
      return null;
    } catch (error) {
      logger.error('Error stopping pattern recording', { error });
      return null;
    }
  }

  /**
   * Record event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   * @returns {Promise<boolean>} - Success status
   */
  async recordEvent(type, data = {}) {
    try {
      if (!this.isRecording || !this.currentPattern) {
        return false;
      }

      // Check if event type is allowed
      if (!this.config.recording.eventTypes.includes(type)) {
        return false;
      }

      // Check recording limits
      if (this.recordingEvents.length >= this.config.recording.maxEvents) {
        logger.warn('Maximum events reached, stopping recording');
        await this.stopRecording();
        return false;
      }

      const event = {
        type,
        data,
        timestamp: Date.now(),
        relativeTime: Date.now() - this.recordingStartTime
      };

      this.recordingEvents.push(event);
      
      logger.debug('Event recorded', { type, data, relativeTime: event.relativeTime });
      return true;
    } catch (error) {
      logger.error('Error recording event', { error, type, data });
      return false;
    }
  }

  /**
   * Start replaying pattern
   * @param {string} patternId - Pattern ID to replay
   * @param {Object} options - Replay options
   * @returns {Promise<boolean>} - Success status
   */
  async startReplay(patternId, options = {}) {
    try {
      if (this.isReplaying) {
        logger.warn('Already replaying a pattern');
        return false;
      }

      if (!this.config.replay.enabled) {
        logger.warn('Replay is disabled');
        return false;
      }

      const pattern = this.recordedPatterns.get(patternId);
      if (!pattern) {
        logger.error('Pattern not found', { patternId });
        return false;
      }

      this.isReplaying = true;
      this.replayQueue = [...pattern.events];
      this.replayIndex = 0;
      
      const replayOptions = {
        speed: options.speed || this.config.replay.speed,
        variation: options.variation || this.config.replay.variation,
        loop: options.loop || this.config.replay.loop,
        pauseOnError: options.pauseOnError !== undefined ? options.pauseOnError : this.config.replay.pauseOnError
      };
      
      logger.info('Pattern replay started', { patternId, events: this.replayQueue.length, options: replayOptions });
      
      // Start replay loop
      this.startReplayLoop(replayOptions);
      
      return true;
    } catch (error) {
      logger.error('Error starting pattern replay', { error, patternId, options });
      return false;
    }
  }

  /**
   * Stop replaying pattern
   * @returns {Promise<boolean>} - Success status
   */
  async stopReplay() {
    try {
      if (!this.isReplaying) {
        logger.warn('No pattern is being replayed');
        return false;
      }

      this.isReplaying = false;
      
      if (this.replayTimer) {
        clearTimeout(this.replayTimer);
        this.replayTimer = null;
      }
      
      this.replayQueue = [];
      this.replayIndex = 0;
      
      logger.info('Pattern replay stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping pattern replay', { error });
      return false;
    }
  }

  /**
   * Start replay loop
   * @param {Object} options - Replay options
   */
  startReplayLoop(options) {
    try {
      if (this.replayIndex >= this.replayQueue.length) {
        if (options.loop) {
          this.replayIndex = 0;
        } else {
          this.stopReplay();
          return;
        }
      }

      const event = this.replayQueue[this.replayIndex];
      if (!event) {
        this.stopReplay();
        return;
      }

      // Calculate delay with variation
      const baseDelay = this.replayIndex === 0 ? 0 : event.relativeTime - this.replayQueue[this.replayIndex - 1].relativeTime;
      const speedAdjustedDelay = baseDelay / options.speed;
      const variation = (Math.random() - 0.5) * 2 * options.variation;
      const finalDelay = Math.max(0, speedAdjustedDelay * (1 + variation));

      this.replayTimer = setTimeout(() => {
        this.executeReplayEvent(event, options);
        this.replayIndex++;
        this.startReplayLoop(options);
      }, finalDelay);
    } catch (error) {
      logger.error('Error in replay loop', { error, options });
      if (options.pauseOnError) {
        this.stopReplay();
      }
    }
  }

  /**
   * Execute replay event
   * @param {Object} event - Event to execute
   * @param {Object} options - Replay options
   */
  executeReplayEvent(event, options) {
    try {
      // Emit event for other modules to handle
      this.emit('replayEvent', {
        type: event.type,
        data: event.data,
        originalTimestamp: event.timestamp,
        replayTimestamp: Date.now()
      });
      
      logger.debug('Replay event executed', { 
        type: event.type, 
        data: event.data, 
        index: this.replayIndex 
      });
    } catch (error) {
      logger.error('Error executing replay event', { error, event, options });
      if (options.pauseOnError) {
        this.stopReplay();
      }
    }
  }

  /**
   * Calculate pattern statistics
   * @param {Object} pattern - Pattern object
   */
  calculatePatternStats(pattern) {
    try {
      const stats = pattern.stats;
      const events = pattern.events;
      
      stats.totalEvents = events.length;
      
      // Count event types
      events.forEach(event => {
        stats.eventTypes[event.type] = (stats.eventTypes[event.type] || 0) + 1;
      });
      
      // Calculate intervals
      if (events.length > 1) {
        const intervals = [];
        for (let i = 1; i < events.length; i++) {
          intervals.push(events[i].relativeTime - events[i - 1].relativeTime);
        }
        
        stats.averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        stats.maxInterval = Math.max(...intervals);
        stats.minInterval = Math.min(...intervals);
      }
    } catch (error) {
      logger.error('Error calculating pattern stats', { error, pattern });
    }
  }

  /**
   * Compress pattern data
   * @param {Object} pattern - Pattern object
   */
  compressPattern(pattern) {
    try {
      // Simple compression by removing redundant data
      const compressedEvents = pattern.events.map(event => ({
        t: event.type,
        d: event.data,
        rt: event.relativeTime
      }));
      
      pattern.events = compressedEvents;
      pattern.compressed = true;
    } catch (error) {
      logger.error('Error compressing pattern', { error, pattern });
    }
  }

  /**
   * Decompress pattern data
   * @param {Object} pattern - Pattern object
   */
  decompressPattern(pattern) {
    try {
      if (!pattern.compressed) return;
      
      const decompressedEvents = pattern.events.map(event => ({
        type: event.t,
        data: event.d,
        relativeTime: event.rt,
        timestamp: pattern.startTime + event.rt
      }));
      
      pattern.events = decompressedEvents;
      pattern.compressed = false;
    } catch (error) {
      logger.error('Error decompressing pattern', { error, pattern });
    }
  }

  /**
   * Generate unique pattern ID
   * @returns {string} - Pattern ID
   */
  generatePatternId() {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      return `pattern_${timestamp}_${random}`;
    } catch (error) {
      logger.error('Error generating pattern ID', { error });
      return `pattern_${Date.now()}`;
    }
  }

  /**
   * Save pattern to storage
   * @param {Object} pattern - Pattern to save
   * @returns {Promise<boolean>} - Success status
   */
  async savePattern(pattern) {
    try {
      const patterns = await this.getStoredPatterns();
      patterns[pattern.id] = pattern;
      
      // Limit stored patterns
      const patternIds = Object.keys(patterns);
      if (patternIds.length > this.config.storage.maxPatterns) {
        const oldestPattern = patternIds.sort()[0];
        delete patterns[oldestPattern];
      }
      
      await this.setStoredPatterns(patterns);
      
      logger.info('Pattern saved to storage', { patternId: pattern.id });
      return true;
    } catch (error) {
      logger.error('Error saving pattern', { error, pattern });
      return false;
    }
  }

  /**
   * Load stored patterns
   * @returns {Promise<boolean>} - Success status
   */
  async loadStoredPatterns() {
    try {
      const patterns = await this.getStoredPatterns();
      
      Object.entries(patterns).forEach(([id, pattern]) => {
        this.recordedPatterns.set(id, pattern);
      });
      
      logger.info('Stored patterns loaded', { count: Object.keys(patterns).length });
      return true;
    } catch (error) {
      logger.error('Error loading stored patterns', { error });
      return false;
    }
  }

  /**
   * Get stored patterns from storage
   * @returns {Promise<Object>} - Stored patterns
   */
  async getStoredPatterns() {
    try {
      // This would use chrome.storage or localStorage
      const stored = localStorage.getItem('autoscroll_patterns');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error('Error getting stored patterns', { error });
      return {};
    }
  }

  /**
   * Set stored patterns in storage
   * @param {Object} patterns - Patterns to store
   * @returns {Promise<boolean>} - Success status
   */
  async setStoredPatterns(patterns) {
    try {
      localStorage.setItem('autoscroll_patterns', JSON.stringify(patterns));
      return true;
    } catch (error) {
      logger.error('Error setting stored patterns', { error, patterns });
      return false;
    }
  }

  /**
   * Get pattern by ID
   * @param {string} patternId - Pattern ID
   * @returns {Object} - Pattern object
   */
  getPattern(patternId) {
    try {
      const pattern = this.recordedPatterns.get(patternId);
      if (pattern && pattern.compressed) {
        this.decompressPattern(pattern);
      }
      return pattern;
    } catch (error) {
      logger.error('Error getting pattern', { error, patternId });
      return null;
    }
  }

  /**
   * Get all patterns
   * @returns {Array} - Array of patterns
   */
  getAllPatterns() {
    try {
      return Array.from(this.recordedPatterns.values());
    } catch (error) {
      logger.error('Error getting all patterns', { error });
      return [];
    }
  }

  /**
   * Delete pattern
   * @param {string} patternId - Pattern ID
   * @returns {Promise<boolean>} - Success status
   */
  async deletePattern(patternId) {
    try {
      this.recordedPatterns.delete(patternId);
      
      // Remove from storage
      const patterns = await this.getStoredPatterns();
      delete patterns[patternId];
      await this.setStoredPatterns(patterns);
      
      logger.info('Pattern deleted', { patternId });
      return true;
    } catch (error) {
      logger.error('Error deleting pattern', { error, patternId });
      return false;
    }
  }

  /**
   * Export pattern
   * @param {string} patternId - Pattern ID
   * @param {string} format - Export format
   * @returns {Promise<Object>} - Export data
   */
  async exportPattern(patternId, format = 'json') {
    try {
      const pattern = this.getPattern(patternId);
      if (!pattern) {
        throw new Error('Pattern not found');
      }
      
      switch (format) {
        case 'json':
          return {
            format: 'json',
            data: pattern,
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        case 'csv':
          return {
            format: 'csv',
            data: this.convertToCSV(pattern),
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      logger.error('Error exporting pattern', { error, patternId, format });
      throw error;
    }
  }

  /**
   * Convert pattern to CSV format
   * @param {Object} pattern - Pattern object
   * @returns {string} - CSV data
   */
  convertToCSV(pattern) {
    try {
      const rows = [];
      rows.push(['Timestamp', 'Relative Time', 'Type', 'Data']);
      
      pattern.events.forEach(event => {
        rows.push([
          new Date(event.timestamp).toISOString(),
          event.relativeTime,
          event.type,
          JSON.stringify(event.data)
        ]);
      });
      
      return rows.map(row => row.join(',')).join('\n');
    } catch (error) {
      logger.error('Error converting to CSV', { error, pattern });
      return '';
    }
  }

  /**
   * Get recording status
   * @returns {Object} - Recording status
   */
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      isReplaying: this.isReplaying,
      currentPattern: this.currentPattern ? {
        id: this.currentPattern.id,
        name: this.currentPattern.name,
        duration: Date.now() - this.recordingStartTime,
        events: this.recordingEvents.length
      } : null,
      replayProgress: this.isReplaying ? {
        current: this.replayIndex,
        total: this.replayQueue.length,
        progress: this.replayQueue.length > 0 ? (this.replayIndex / this.replayQueue.length) * 100 : 0
      } : null
    };
  }

  /**
   * Clear all patterns
   * @returns {Promise<boolean>} - Success status
   */
  async clearAllPatterns() {
    try {
      this.recordedPatterns.clear();
      await this.setStoredPatterns({});
      
      logger.info('All patterns cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing all patterns', { error });
      return false;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners && this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners && this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('Error in event listener', { error, event });
        }
      });
    }
  }
}

/**
 * Create pattern replay manager instance
 * @param {Object} config - Configuration object
 * @returns {PatternReplayManager} - Pattern replay manager instance
 */
export function createPatternReplayManager(config = {}) {
  return new PatternReplayManager(config);
}

/**
 * Default pattern replay manager instance
 */
export const patternReplayManager = createPatternReplayManager();
