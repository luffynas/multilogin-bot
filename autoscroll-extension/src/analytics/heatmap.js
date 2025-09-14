/**
 * Heatmap - Dwell and scroll intensity mapping
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('heatmap');

/**
 * Heatmap Generator
 * Generates heatmaps for scroll and dwell intensity
 */
export class HeatmapGenerator {
  constructor() {
    this.isActive = false;
    this.heatmapData = {
      scroll: new Map(),
      dwell: new Map(),
      click: new Map(),
      hover: new Map()
    };
    
    this.config = {
      enabled: true,
      gridSize: 50, // pixels
      maxIntensity: 100,
      decayRate: 0.95, // per second
      updateInterval: 100, // milliseconds
      historySize: 1000,
      exportFormats: ['json', 'image'],
      visualization: {
        enabled: false,
        opacity: 0.6,
        colors: {
          low: '#00ff00',
          medium: '#ffff00',
          high: '#ff8000',
          max: '#ff0000'
        }
      }
    };
    
    this.viewport = {
      width: 0,
      height: 0,
      scrollX: 0,
      scrollY: 0
    };
    
    this.grid = {
      cols: 0,
      rows: 0,
      cells: new Map()
    };
    
    this.history = [];
    this.updateInterval = null;
  }

  /**
   * Initialize heatmap generator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing heatmap generator', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.startTracking();
      }
      
      logger.info('Heatmap generator initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing heatmap generator', { error });
      return false;
    }
  }

  /**
   * Start heatmap tracking
   * @returns {Promise<boolean>} - Success status
   */
  async startTracking() {
    try {
      if (this.isActive) {
        logger.warn('Heatmap tracking already active');
        return false;
      }

      this.isActive = true;
      
      // Initialize viewport
      this.updateViewport();
      
      // Initialize grid
      this.initializeGrid();
      
      // Start update interval
      if (this.config.updateInterval > 0) {
        this.updateInterval = setInterval(() => {
          this.updateHeatmap();
        }, this.config.updateInterval);
      }
      
      logger.info('Heatmap tracking started');
      return true;
    } catch (error) {
      logger.error('Error starting heatmap tracking', { error });
      return false;
    }
  }

  /**
   * Stop heatmap tracking
   * @returns {Promise<boolean>} - Success status
   */
  async stopTracking() {
    try {
      if (!this.isActive) {
        logger.warn('Heatmap tracking not active');
        return false;
      }

      this.isActive = false;
      
      // Clear update interval
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      
      logger.info('Heatmap tracking stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping heatmap tracking', { error });
      return false;
    }
  }

  /**
   * Update viewport dimensions
   */
  updateViewport() {
    try {
      this.viewport.width = window.innerWidth;
      this.viewport.height = window.innerHeight;
      this.viewport.scrollX = window.scrollX || window.pageXOffset;
      this.viewport.scrollY = window.scrollY || window.pageYOffset;
      
      // Reinitialize grid if dimensions changed
      this.initializeGrid();
    } catch (error) {
      logger.error('Error updating viewport', { error });
    }
  }

  /**
   * Initialize grid system
   */
  initializeGrid() {
    try {
      this.grid.cols = Math.ceil(this.viewport.width / this.config.gridSize);
      this.grid.rows = Math.ceil(this.viewport.height / this.config.gridSize);
      this.grid.cells.clear();
      
      // Initialize all cells
      for (let row = 0; row < this.grid.rows; row++) {
        for (let col = 0; col < this.grid.cols; col++) {
          const cellId = `${row}-${col}`;
          this.grid.cells.set(cellId, {
            scroll: 0,
            dwell: 0,
            click: 0,
            hover: 0,
            lastUpdate: Date.now()
          });
        }
      }
      
      logger.debug('Grid initialized', { 
        cols: this.grid.cols, 
        rows: this.grid.rows, 
        totalCells: this.grid.cells.size 
      });
    } catch (error) {
      logger.error('Error initializing grid', { error });
    }
  }

  /**
   * Record scroll event
   * @param {Object} data - Scroll data
   * @returns {Promise<boolean>} - Success status
   */
  async recordScroll(data) {
    try {
      if (!this.isActive) {
        return false;
      }

      const { x, y, delta, intensity = 1 } = data;
      
      // Convert screen coordinates to grid coordinates
      const gridX = Math.floor(x / this.config.gridSize);
      const gridY = Math.floor(y / this.config.gridSize);
      
      // Clamp to grid bounds
      const clampedX = Math.max(0, Math.min(gridX, this.grid.cols - 1));
      const clampedY = Math.max(0, Math.min(gridY, this.grid.rows - 1));
      
      const cellId = `${clampedY}-${clampedX}`;
      const cell = this.grid.cells.get(cellId);
      
      if (cell) {
        cell.scroll += intensity * Math.abs(delta || 1);
        cell.lastUpdate = Date.now();
        
        // Add to history
        this.addToHistory('scroll', {
          x: clampedX * this.config.gridSize,
          y: clampedY * this.config.gridSize,
          intensity: cell.scroll,
          delta,
          timestamp: Date.now()
        });
      }
      
      return true;
    } catch (error) {
      logger.error('Error recording scroll event', { error, data });
      return false;
    }
  }

  /**
   * Record dwell event
   * @param {Object} data - Dwell data
   * @returns {Promise<boolean>} - Success status
   */
  async recordDwell(data) {
    try {
      if (!this.isActive) {
        return false;
      }

      const { x, y, duration, intensity = 1 } = data;
      
      // Convert screen coordinates to grid coordinates
      const gridX = Math.floor(x / this.config.gridSize);
      const gridY = Math.floor(y / this.config.gridSize);
      
      // Clamp to grid bounds
      const clampedX = Math.max(0, Math.min(gridX, this.grid.cols - 1));
      const clampedY = Math.max(0, Math.min(gridY, this.grid.rows - 1));
      
      const cellId = `${clampedY}-${clampedX}`;
      const cell = this.grid.cells.get(cellId);
      
      if (cell) {
        cell.dwell += intensity * (duration || 1000);
        cell.lastUpdate = Date.now();
        
        // Add to history
        this.addToHistory('dwell', {
          x: clampedX * this.config.gridSize,
          y: clampedY * this.config.gridSize,
          intensity: cell.dwell,
          duration,
          timestamp: Date.now()
        });
      }
      
      return true;
    } catch (error) {
      logger.error('Error recording dwell event', { error, data });
      return false;
    }
  }

  /**
   * Record click event
   * @param {Object} data - Click data
   * @returns {Promise<boolean>} - Success status
   */
  async recordClick(data) {
    try {
      if (!this.isActive) {
        return false;
      }

      const { x, y, intensity = 1 } = data;
      
      // Convert screen coordinates to grid coordinates
      const gridX = Math.floor(x / this.config.gridSize);
      const gridY = Math.floor(y / this.config.gridSize);
      
      // Clamp to grid bounds
      const clampedX = Math.max(0, Math.min(gridX, this.grid.cols - 1));
      const clampedY = Math.max(0, Math.min(gridY, this.grid.rows - 1));
      
      const cellId = `${clampedY}-${clampedX}`;
      const cell = this.grid.cells.get(cellId);
      
      if (cell) {
        cell.click += intensity;
        cell.lastUpdate = Date.now();
        
        // Add to history
        this.addToHistory('click', {
          x: clampedX * this.config.gridSize,
          y: clampedY * this.config.gridSize,
          intensity: cell.click,
          timestamp: Date.now()
        });
      }
      
      return true;
    } catch (error) {
      logger.error('Error recording click event', { error, data });
      return false;
    }
  }

  /**
   * Record hover event
   * @param {Object} data - Hover data
   * @returns {Promise<boolean>} - Success status
   */
  async recordHover(data) {
    try {
      if (!this.isActive) {
        return false;
      }

      const { x, y, duration, intensity = 1 } = data;
      
      // Convert screen coordinates to grid coordinates
      const gridX = Math.floor(x / this.config.gridSize);
      const gridY = Math.floor(y / this.config.gridSize);
      
      // Clamp to grid bounds
      const clampedX = Math.max(0, Math.min(gridX, this.grid.cols - 1));
      const clampedY = Math.max(0, Math.min(gridY, this.grid.rows - 1));
      
      const cellId = `${clampedY}-${clampedX}`;
      const cell = this.grid.cells.get(cellId);
      
      if (cell) {
        cell.hover += intensity * (duration || 100);
        cell.lastUpdate = Date.now();
        
        // Add to history
        this.addToHistory('hover', {
          x: clampedX * this.config.gridSize,
          y: clampedY * this.config.gridSize,
          intensity: cell.hover,
          duration,
          timestamp: Date.now()
        });
      }
      
      return true;
    } catch (error) {
      logger.error('Error recording hover event', { error, data });
      return false;
    }
  }

  /**
   * Add event to history
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  addToHistory(type, data) {
    try {
      this.history.push({
        type,
        data,
        timestamp: Date.now()
      });
      
      // Maintain history size
      if (this.history.length > this.config.historySize) {
        this.history.shift();
      }
    } catch (error) {
      logger.error('Error adding to history', { error, type, data });
    }
  }

  /**
   * Update heatmap with decay
   */
  updateHeatmap() {
    try {
      const now = Date.now();
      const decayFactor = Math.pow(this.config.decayRate, this.config.updateInterval / 1000);
      
      // Apply decay to all cells
      this.grid.cells.forEach((cell, cellId) => {
        const timeSinceUpdate = now - cell.lastUpdate;
        
        if (timeSinceUpdate > 1000) { // Only decay if not recently updated
          cell.scroll *= decayFactor;
          cell.dwell *= decayFactor;
          cell.click *= decayFactor;
          cell.hover *= decayFactor;
          
          // Clamp to minimum value
          if (cell.scroll < 0.1) cell.scroll = 0;
          if (cell.dwell < 0.1) cell.dwell = 0;
          if (cell.click < 0.1) cell.click = 0;
          if (cell.hover < 0.1) cell.hover = 0;
        }
      });
    } catch (error) {
      logger.error('Error updating heatmap', { error });
    }
  }

  /**
   * Get heatmap data
   * @param {string} type - Heatmap type (scroll, dwell, click, hover, all)
   * @returns {Object} - Heatmap data
   */
  getHeatmapData(type = 'all') {
    try {
      const data = {
        type,
        timestamp: Date.now(),
        viewport: { ...this.viewport },
        grid: {
          size: this.config.gridSize,
          cols: this.grid.cols,
          rows: this.grid.rows
        },
        cells: []
      };
      
      // Convert grid cells to array
      this.grid.cells.forEach((cell, cellId) => {
        const [row, col] = cellId.split('-').map(Number);
        const cellData = {
          id: cellId,
          row,
          col,
          x: col * this.config.gridSize,
          y: row * this.config.gridSize,
          scroll: type === 'all' || type === 'scroll' ? cell.scroll : 0,
          dwell: type === 'all' || type === 'dwell' ? cell.dwell : 0,
          click: type === 'all' || type === 'click' ? cell.click : 0,
          hover: type === 'all' || type === 'hover' ? cell.hover : 0,
          lastUpdate: cell.lastUpdate
        };
        
        data.cells.push(cellData);
      });
      
      return data;
    } catch (error) {
      logger.error('Error getting heatmap data', { error, type });
      return null;
    }
  }

  /**
   * Get heatmap statistics
   * @returns {Object} - Heatmap statistics
   */
  getHeatmapStats() {
    try {
      const stats = {
        totalCells: this.grid.cells.size,
        activeCells: 0,
        maxIntensity: {
          scroll: 0,
          dwell: 0,
          click: 0,
          hover: 0
        },
        averageIntensity: {
          scroll: 0,
          dwell: 0,
          click: 0,
          hover: 0
        },
        hotspots: {
          scroll: [],
          dwell: [],
          click: [],
          hover: []
        }
      };
      
      let totalScroll = 0, totalDwell = 0, totalClick = 0, totalHover = 0;
      
      this.grid.cells.forEach((cell, cellId) => {
        const [row, col] = cellId.split('-').map(Number);
        
        // Check if cell is active
        if (cell.scroll > 0 || cell.dwell > 0 || cell.click > 0 || cell.hover > 0) {
          stats.activeCells++;
        }
        
        // Update max intensities
        stats.maxIntensity.scroll = Math.max(stats.maxIntensity.scroll, cell.scroll);
        stats.maxIntensity.dwell = Math.max(stats.maxIntensity.dwell, cell.dwell);
        stats.maxIntensity.click = Math.max(stats.maxIntensity.click, cell.click);
        stats.maxIntensity.hover = Math.max(stats.maxIntensity.hover, cell.hover);
        
        // Accumulate totals
        totalScroll += cell.scroll;
        totalDwell += cell.dwell;
        totalClick += cell.click;
        totalHover += cell.hover;
        
        // Add to hotspots if intensity is high
        if (cell.scroll > stats.maxIntensity.scroll * 0.8) {
          stats.hotspots.scroll.push({ cellId, row, col, intensity: cell.scroll });
        }
        if (cell.dwell > stats.maxIntensity.dwell * 0.8) {
          stats.hotspots.dwell.push({ cellId, row, col, intensity: cell.dwell });
        }
        if (cell.click > stats.maxIntensity.click * 0.8) {
          stats.hotspots.click.push({ cellId, row, col, intensity: cell.click });
        }
        if (cell.hover > stats.maxIntensity.hover * 0.8) {
          stats.hotspots.hover.push({ cellId, row, col, intensity: cell.hover });
        }
      });
      
      // Calculate averages
      if (stats.totalCells > 0) {
        stats.averageIntensity.scroll = totalScroll / stats.totalCells;
        stats.averageIntensity.dwell = totalDwell / stats.totalCells;
        stats.averageIntensity.click = totalClick / stats.totalCells;
        stats.averageIntensity.hover = totalHover / stats.totalCells;
      }
      
      return stats;
    } catch (error) {
      logger.error('Error getting heatmap stats', { error });
      return null;
    }
  }

  /**
   * Export heatmap data
   * @param {string} format - Export format (json, image)
   * @returns {Promise<Object>} - Export data
   */
  async exportHeatmap(format = 'json') {
    try {
      const data = this.getHeatmapData();
      const stats = this.getHeatmapStats();
      
      switch (format) {
        case 'json':
          return {
            format: 'json',
            data: {
              heatmap: data,
              stats: stats,
              config: this.config
            },
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        case 'image':
          return {
            format: 'image',
            data: await this.generateHeatmapImage(data),
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      logger.error('Error exporting heatmap', { error, format });
      throw error;
    }
  }

  /**
   * Generate heatmap image
   * @param {Object} data - Heatmap data
   * @returns {Promise<string>} - Base64 image data
   */
  async generateHeatmapImage(data) {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = this.viewport.width;
      canvas.height = this.viewport.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw heatmap
      data.cells.forEach(cell => {
        if (cell.scroll > 0 || cell.dwell > 0 || cell.click > 0 || cell.hover > 0) {
          const intensity = Math.max(cell.scroll, cell.dwell, cell.click, cell.hover);
          const normalizedIntensity = Math.min(intensity / this.config.maxIntensity, 1);
          
          // Get color based on intensity
          const color = this.getIntensityColor(normalizedIntensity);
          
          // Draw cell
          ctx.fillStyle = color;
          ctx.globalAlpha = this.config.visualization.opacity * normalizedIntensity;
          ctx.fillRect(cell.x, cell.y, this.config.gridSize, this.config.gridSize);
        }
      });
      
      // Reset alpha
      ctx.globalAlpha = 1;
      
      // Convert to base64
      return canvas.toDataURL('image/png');
    } catch (error) {
      logger.error('Error generating heatmap image', { error });
      return null;
    }
  }

  /**
   * Get color based on intensity
   * @param {number} intensity - Normalized intensity (0-1)
   * @returns {string} - Color string
   */
  getIntensityColor(intensity) {
    try {
      const colors = this.config.visualization.colors;
      
      if (intensity < 0.25) {
        return colors.low;
      } else if (intensity < 0.5) {
        return colors.medium;
      } else if (intensity < 0.75) {
        return colors.high;
      } else {
        return colors.max;
      }
    } catch (error) {
      logger.error('Error getting intensity color', { error, intensity });
      return '#000000';
    }
  }

  /**
   * Clear heatmap data
   * @returns {Promise<boolean>} - Success status
   */
  async clearHeatmap() {
    try {
      this.grid.cells.forEach(cell => {
        cell.scroll = 0;
        cell.dwell = 0;
        cell.click = 0;
        cell.hover = 0;
        cell.lastUpdate = Date.now();
      });
      
      this.history = [];
      
      logger.info('Heatmap data cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing heatmap', { error });
      return false;
    }
  }

  /**
   * Get history data
   * @param {number} limit - Maximum number of events
   * @returns {Array} - History data
   */
  getHistory(limit = 100) {
    try {
      return this.history.slice(-limit);
    } catch (error) {
      logger.error('Error getting history', { error, limit });
      return [];
    }
  }
}

/**
 * Create heatmap generator instance
 * @param {Object} config - Configuration object
 * @returns {HeatmapGenerator} - Heatmap generator instance
 */
export function createHeatmapGenerator(config = {}) {
  return new HeatmapGenerator(config);
}

/**
 * Default heatmap generator instance
 */
export const heatmapGenerator = createHeatmapGenerator();
