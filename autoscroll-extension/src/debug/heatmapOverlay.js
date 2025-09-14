/**
 * Heatmap Overlay - Visual heatmap display for debugging
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('heatmap-overlay');

/**
 * Heatmap Overlay
 * Displays visual heatmap for debugging scroll and interaction patterns
 */
export class HeatmapOverlay {
  constructor() {
    this.isActive = false;
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.config = {
      enabled: false,
      position: 'fullscreen',
      opacity: 0.6,
      colors: {
        low: '#00ff00',
        medium: '#ffff00',
        high: '#ff8000',
        max: '#ff0000'
      },
      updateInterval: 500, // 500ms
      gridSize: 50,
      maxIntensity: 100,
      decayRate: 0.95,
      showLegend: true,
      showStats: true,
      showControls: true,
      autoHide: false,
      autoHideDelay: 10000
    };
    
    this.heatmapData = new Map();
    this.stats = {
      totalCells: 0,
      activeCells: 0,
      maxIntensity: 0,
      averageIntensity: 0
    };
    
    this.updateInterval = null;
    this.controls = null;
  }

  /**
   * Initialize heatmap overlay
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing heatmap overlay', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.createOverlay();
        await this.startUpdates();
      }
      
      logger.info('Heatmap overlay initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing heatmap overlay', { error });
      return false;
    }
  }

  /**
   * Create heatmap overlay
   * @returns {Promise<boolean>} - Success status
   */
  async createOverlay() {
    try {
      // Remove existing overlay if any
      if (this.overlay) {
        this.overlay.remove();
      }
      
      // Create overlay element
      this.overlay = document.createElement('div');
      this.overlay.id = 'autoscroll-heatmap-overlay';
      this.overlay.className = 'autoscroll-heatmap-overlay';
      
      // Apply styles
      this.applyStyles();
      
      // Create canvas
      this.createCanvas();
      
      // Create controls
      if (this.config.showControls) {
        this.createControls();
      }
      
      // Create legend
      if (this.config.showLegend) {
        this.createLegend();
      }
      
      // Create stats
      if (this.config.showStats) {
        this.createStats();
      }
      
      // Add to page
      document.body.appendChild(this.overlay);
      
      // Add event listeners
      this.addEventListeners();
      
      logger.info('Heatmap overlay created');
      return true;
    } catch (error) {
      logger.error('Error creating heatmap overlay', { error });
      return false;
    }
  }

  /**
   * Apply styles to overlay
   */
  applyStyles() {
    try {
      const styles = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '999998',
        opacity: this.config.opacity
      };
      
      Object.assign(this.overlay.style, styles);
      
      // Add CSS class for additional styling
      this.overlay.classList.add('autoscroll-heatmap-overlay');
    } catch (error) {
      logger.error('Error applying styles', { error });
    }
  }

  /**
   * Create canvas element
   */
  createCanvas() {
    try {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'heatmap-canvas';
      this.canvas.className = 'heatmap-canvas';
      
      // Set canvas size
      this.resizeCanvas();
      
      // Get context
      this.ctx = this.canvas.getContext('2d');
      
      // Apply canvas styles
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      
      // Add to overlay
      this.overlay.appendChild(this.canvas);
      
      // Add resize listener
      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
    } catch (error) {
      logger.error('Error creating canvas', { error });
    }
  }

  /**
   * Resize canvas to match viewport
   */
  resizeCanvas() {
    try {
      if (!this.canvas) return;
      
      const rect = this.overlay.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      
      // Clear canvas
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    } catch (error) {
      logger.error('Error resizing canvas', { error });
    }
  }

  /**
   * Create controls
   */
  createControls() {
    try {
      this.controls = document.createElement('div');
      this.controls.className = 'heatmap-controls';
      this.controls.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        pointer-events: auto;
        z-index: 999999;
      `;
      
      this.controls.innerHTML = `
        <div style="margin-bottom: 10px;">
          <button id="heatmap-toggle" style="background: none; border: 1px solid #00ff00; color: #00ff00; padding: 5px 10px; cursor: pointer; margin-right: 5px;">Hide</button>
          <button id="heatmap-clear" style="background: none; border: 1px solid #ff6666; color: #ff6666; padding: 5px 10px; cursor: pointer;">Clear</button>
        </div>
        <div style="margin-bottom: 5px;">
          <label>Opacity: </label>
          <input type="range" id="heatmap-opacity" min="0" max="1" step="0.1" value="${this.config.opacity}" style="width: 100px;">
          <span id="opacity-value">${this.config.opacity}</span>
        </div>
        <div style="margin-bottom: 5px;">
          <label>Grid Size: </label>
          <input type="range" id="heatmap-grid" min="20" max="100" step="10" value="${this.config.gridSize}" style="width: 100px;">
          <span id="grid-value">${this.config.gridSize}</span>
        </div>
        <div>
          <label>Decay Rate: </label>
          <input type="range" id="heatmap-decay" min="0.9" max="0.99" step="0.01" value="${this.config.decayRate}" style="width: 100px;">
          <span id="decay-value">${this.config.decayRate}</span>
        </div>
      `;
      
      this.overlay.appendChild(this.controls);
    } catch (error) {
      logger.error('Error creating controls', { error });
    }
  }

  /**
   * Create legend
   */
  createLegend() {
    try {
      const legend = document.createElement('div');
      legend.className = 'heatmap-legend';
      legend.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        pointer-events: auto;
        z-index: 999999;
      `;
      
      legend.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: bold;">Heatmap Legend</div>
        <div style="display: flex; align-items: center; margin-bottom: 2px;">
          <div style="width: 20px; height: 10px; background: ${this.config.colors.low}; margin-right: 5px;"></div>
          <span>Low Intensity</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 2px;">
          <div style="width: 20px; height: 10px; background: ${this.config.colors.medium}; margin-right: 5px;"></div>
          <span>Medium Intensity</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 2px;">
          <div style="width: 20px; height: 10px; background: ${this.config.colors.high}; margin-right: 5px;"></div>
          <span>High Intensity</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 10px; background: ${this.config.colors.max}; margin-right: 5px;"></div>
          <span>Maximum Intensity</span>
        </div>
      `;
      
      this.overlay.appendChild(legend);
    } catch (error) {
      logger.error('Error creating legend', { error });
    }
  }

  /**
   * Create stats display
   */
  createStats() {
    try {
      const stats = document.createElement('div');
      stats.className = 'heatmap-stats';
      stats.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        pointer-events: auto;
        z-index: 999999;
      `;
      
      stats.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: bold;">Heatmap Stats</div>
        <div id="stats-content">
          <div>Total Cells: <span id="total-cells">0</span></div>
          <div>Active Cells: <span id="active-cells">0</span></div>
          <div>Max Intensity: <span id="max-intensity">0</span></div>
          <div>Average Intensity: <span id="avg-intensity">0</span></div>
        </div>
      `;
      
      this.overlay.appendChild(stats);
    } catch (error) {
      logger.error('Error creating stats', { error });
    }
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    try {
      // Toggle button
      const toggleButton = this.overlay.querySelector('#heatmap-toggle');
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          this.toggleVisibility();
        });
      }
      
      // Clear button
      const clearButton = this.overlay.querySelector('#heatmap-clear');
      if (clearButton) {
        clearButton.addEventListener('click', () => {
          this.clearHeatmap();
        });
      }
      
      // Opacity slider
      const opacitySlider = this.overlay.querySelector('#heatmap-opacity');
      if (opacitySlider) {
        opacitySlider.addEventListener('input', (e) => {
          this.config.opacity = parseFloat(e.target.value);
          this.overlay.style.opacity = this.config.opacity;
          document.getElementById('opacity-value').textContent = this.config.opacity;
        });
      }
      
      // Grid size slider
      const gridSlider = this.overlay.querySelector('#heatmap-grid');
      if (gridSlider) {
        gridSlider.addEventListener('input', (e) => {
          this.config.gridSize = parseInt(e.target.value);
          document.getElementById('grid-value').textContent = this.config.gridSize;
          this.clearHeatmap();
        });
      }
      
      // Decay rate slider
      const decaySlider = this.overlay.querySelector('#heatmap-decay');
      if (decaySlider) {
        decaySlider.addEventListener('input', (e) => {
          this.config.decayRate = parseFloat(e.target.value);
          document.getElementById('decay-value').textContent = this.config.decayRate;
        });
      }
    } catch (error) {
      logger.error('Error adding event listeners', { error });
    }
  }

  /**
   * Start heatmap updates
   * @returns {Promise<boolean>} - Success status
   */
  async startUpdates() {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      
      this.updateInterval = setInterval(() => {
        this.updateHeatmap();
      }, this.config.updateInterval);
      
      logger.info('Heatmap updates started');
      return true;
    } catch (error) {
      logger.error('Error starting heatmap updates', { error });
      return false;
    }
  }

  /**
   * Stop heatmap updates
   * @returns {Promise<boolean>} - Success status
   */
  async stopUpdates() {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      
      logger.info('Heatmap updates stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping heatmap updates', { error });
      return false;
    }
  }

  /**
   * Update heatmap display
   */
  updateHeatmap() {
    try {
      if (!this.canvas || !this.ctx) return;
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Apply decay
      this.applyDecay();
      
      // Draw heatmap
      this.drawHeatmap();
      
      // Update stats
      this.updateStats();
    } catch (error) {
      logger.error('Error updating heatmap', { error });
    }
  }

  /**
   * Apply decay to heatmap data
   */
  applyDecay() {
    try {
      const decayFactor = Math.pow(this.config.decayRate, this.config.updateInterval / 1000);
      
      this.heatmapData.forEach((cell, key) => {
        cell.intensity *= decayFactor;
        
        // Remove cells with very low intensity
        if (cell.intensity < 0.1) {
          this.heatmapData.delete(key);
        }
      });
    } catch (error) {
      logger.error('Error applying decay', { error });
    }
  }

  /**
   * Draw heatmap on canvas
   */
  drawHeatmap() {
    try {
      this.heatmapData.forEach((cell, key) => {
        const normalizedIntensity = Math.min(cell.intensity / this.config.maxIntensity, 1);
        const color = this.getIntensityColor(normalizedIntensity);
        
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = normalizedIntensity * this.config.opacity;
        this.ctx.fillRect(cell.x, cell.y, this.config.gridSize, this.config.gridSize);
      });
      
      // Reset alpha
      this.ctx.globalAlpha = 1;
    } catch (error) {
      logger.error('Error drawing heatmap', { error });
    }
  }

  /**
   * Get color based on intensity
   * @param {number} intensity - Normalized intensity (0-1)
   * @returns {string} - Color string
   */
  getIntensityColor(intensity) {
    try {
      const colors = this.config.colors;
      
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
   * Update stats display
   */
  updateStats() {
    try {
      const totalCells = Math.ceil(this.canvas.width / this.config.gridSize) * Math.ceil(this.canvas.height / this.config.gridSize);
      const activeCells = this.heatmapData.size;
      const maxIntensity = Math.max(...Array.from(this.heatmapData.values()).map(cell => cell.intensity), 0);
      const averageIntensity = activeCells > 0 ? 
        Array.from(this.heatmapData.values()).reduce((sum, cell) => sum + cell.intensity, 0) / activeCells : 0;
      
      this.stats = {
        totalCells,
        activeCells,
        maxIntensity,
        averageIntensity
      };
      
      // Update display
      const totalCellsEl = document.getElementById('total-cells');
      const activeCellsEl = document.getElementById('active-cells');
      const maxIntensityEl = document.getElementById('max-intensity');
      const avgIntensityEl = document.getElementById('avg-intensity');
      
      if (totalCellsEl) totalCellsEl.textContent = totalCells;
      if (activeCellsEl) activeCellsEl.textContent = activeCells;
      if (maxIntensityEl) maxIntensityEl.textContent = maxIntensity.toFixed(2);
      if (avgIntensityEl) avgIntensityEl.textContent = averageIntensity.toFixed(2);
    } catch (error) {
      logger.error('Error updating stats', { error });
    }
  }

  /**
   * Add heatmap data point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} intensity - Intensity value
   * @param {string} type - Data type (scroll, click, hover, etc.)
   */
  addDataPoint(x, y, intensity = 1, type = 'scroll') {
    try {
      // Convert to grid coordinates
      const gridX = Math.floor(x / this.config.gridSize) * this.config.gridSize;
      const gridY = Math.floor(y / this.config.gridSize) * this.config.gridSize;
      const key = `${gridX}_${gridY}`;
      
      // Get or create cell
      let cell = this.heatmapData.get(key);
      if (!cell) {
        cell = {
          x: gridX,
          y: gridY,
          intensity: 0,
          type: type,
          lastUpdate: Date.now()
        };
        this.heatmapData.set(key, cell);
      }
      
      // Update cell
      cell.intensity += intensity;
      cell.lastUpdate = Date.now();
      
      // Clamp intensity
      cell.intensity = Math.min(cell.intensity, this.config.maxIntensity);
    } catch (error) {
      logger.error('Error adding data point', { error, x, y, intensity, type });
    }
  }

  /**
   * Add scroll data
   * @param {Object} data - Scroll data
   */
  addScrollData(data) {
    try {
      const { x, y, delta, intensity = 1 } = data;
      
      if (x !== undefined && y !== undefined) {
        this.addDataPoint(x, y, intensity * Math.abs(delta || 1), 'scroll');
      }
    } catch (error) {
      logger.error('Error adding scroll data', { error, data });
    }
  }

  /**
   * Add click data
   * @param {Object} data - Click data
   */
  addClickData(data) {
    try {
      const { x, y, intensity = 1 } = data;
      
      if (x !== undefined && y !== undefined) {
        this.addDataPoint(x, y, intensity * 2, 'click');
      }
    } catch (error) {
      logger.error('Error adding click data', { error, data });
    }
  }

  /**
   * Add hover data
   * @param {Object} data - Hover data
   */
  addHoverData(data) {
    try {
      const { x, y, duration, intensity = 1 } = data;
      
      if (x !== undefined && y !== undefined) {
        const hoverIntensity = intensity * (duration || 1000) / 1000;
        this.addDataPoint(x, y, hoverIntensity, 'hover');
      }
    } catch (error) {
      logger.error('Error adding hover data', { error, data });
    }
  }

  /**
   * Toggle overlay visibility
   */
  toggleVisibility() {
    try {
      if (this.overlay) {
        const isVisible = this.overlay.style.display !== 'none';
        this.overlay.style.display = isVisible ? 'none' : 'block';
        
        const toggleButton = this.overlay.querySelector('#heatmap-toggle');
        if (toggleButton) {
          toggleButton.textContent = isVisible ? 'Show' : 'Hide';
        }
        
        this.isActive = !isVisible;
      }
    } catch (error) {
      logger.error('Error toggling visibility', { error });
    }
  }

  /**
   * Clear heatmap data
   */
  clearHeatmap() {
    try {
      this.heatmapData.clear();
      
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      
      this.updateStats();
      
      logger.info('Heatmap cleared');
    } catch (error) {
      logger.error('Error clearing heatmap', { error });
    }
  }

  /**
   * Show heatmap overlay
   * @returns {Promise<boolean>} - Success status
   */
  async show() {
    try {
      if (this.overlay) {
        this.overlay.style.display = 'block';
        this.isActive = true;
        
        if (!this.updateInterval) {
          await this.startUpdates();
        }
        
        logger.info('Heatmap overlay shown');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error showing heatmap overlay', { error });
      return false;
    }
  }

  /**
   * Hide heatmap overlay
   * @returns {Promise<boolean>} - Success status
   */
  async hide() {
    try {
      if (this.overlay) {
        this.overlay.style.display = 'none';
        this.isActive = false;
        
        if (this.updateInterval) {
          await this.stopUpdates();
        }
        
        logger.info('Heatmap overlay hidden');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error hiding heatmap overlay', { error });
      return false;
    }
  }

  /**
   * Remove heatmap overlay
   * @returns {Promise<boolean>} - Success status
   */
  async remove() {
    try {
      if (this.overlay) {
        await this.stopUpdates();
        this.overlay.remove();
        this.overlay = null;
        this.canvas = null;
        this.ctx = null;
        this.controls = null;
        this.isActive = false;
        
        logger.info('Heatmap overlay removed');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error removing heatmap overlay', { error });
      return false;
    }
  }

  /**
   * Get heatmap data
   * @returns {Object} - Heatmap data
   */
  getHeatmapData() {
    try {
      const data = {
        cells: Array.from(this.heatmapData.entries()).map(([key, cell]) => ({
          key,
          ...cell
        })),
        stats: this.stats,
        config: this.config
      };
      
      return data;
    } catch (error) {
      logger.error('Error getting heatmap data', { error });
      return { cells: [], stats: this.stats, config: this.config };
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
      
      switch (format) {
        case 'json':
          return {
            format: 'json',
            data: data,
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        case 'image':
          return {
            format: 'image',
            data: this.canvas ? this.canvas.toDataURL('image/png') : null,
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
}

/**
 * Create heatmap overlay instance
 * @param {Object} config - Configuration object
 * @returns {HeatmapOverlay} - Heatmap overlay instance
 */
export function createHeatmapOverlay(config = {}) {
  return new HeatmapOverlay(config);
}

/**
 * Default heatmap overlay instance
 */
export const heatmapOverlay = createHeatmapOverlay();
