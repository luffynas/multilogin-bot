/**
 * Profile loader and validator
 */

import { getStorageValue, setStorageValue } from '../utils/storage.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('profiles');

/**
 * Default profile configuration
 */
const DEFAULT_PROFILE = {
  name: 'default',
  displayName: 'Default Profile',
  description: 'Balanced autoscroll profile with natural human-like behavior',
  version: '1.0.0',
  enabled: true
};

/**
 * Profile cache
 */
let profileCache = new Map();

/**
 * Current active profile
 */
let activeProfile = null;

/**
 * Load profile from storage or file
 * @param {string} profileName - Profile name
 * @returns {Promise<Object>} - Profile configuration
 */
export async function loadProfile(profileName = 'default') {
  try {
    // Check cache first
    if (profileCache.has(profileName)) {
      logger.debug('Loading profile from cache', { profileName });
      return profileCache.get(profileName);
    }

    // Try to load from storage first
    const storageKey = `profile_${profileName}`;
    let profile = await getStorageValue(storageKey, null);

    if (!profile) {
      // Load from default profiles
      profile = await loadDefaultProfile(profileName);
    }

    if (!profile) {
      logger.warn('Profile not found, using default', { profileName });
      profile = DEFAULT_PROFILE;
    }

    // Validate profile
    const validatedProfile = validateProfile(profile);
    
    // Cache the profile
    profileCache.set(profileName, validatedProfile);
    
    logger.info('Profile loaded successfully', { 
      profileName, 
      version: validatedProfile.version 
    });

    return validatedProfile;
  } catch (error) {
    logger.error('Error loading profile', { profileName, error });
    return DEFAULT_PROFILE;
  }
}

/**
 * Load default profile from profiles directory
 * @param {string} profileName - Profile name
 * @returns {Promise<Object|null>} - Profile configuration or null
 */
async function loadDefaultProfile(profileName) {
  try {
    // Load from profiles directory
    const profilePath = `../profiles/${profileName}.json`;
    
    try {
      // Try to import the profile file
      const profileModule = await import(profilePath);
      const profile = profileModule.default || profileModule;
      
      if (profile && profile.name === profileName) {
        logger.debug('Loaded profile from file', { profileName, path: profilePath });
        return profile;
      }
    } catch (importError) {
      logger.debug('Could not import profile file', { profileName, path: profilePath, error: importError.message });
    }
    
    // Fallback to hardcoded profiles
    if (profileName === 'default') {
      return DEFAULT_PROFILE;
    }
    
    // Try to load from built-in profiles
    const builtInProfiles = await loadBuiltInProfiles();
    if (builtInProfiles[profileName]) {
      return builtInProfiles[profileName];
    }
    
    return null;
  } catch (error) {
    logger.error('Error loading default profile', { profileName, error });
    return null;
  }
}

/**
 * Load built-in profiles
 * @returns {Promise<Object>} - Built-in profiles
 */
async function loadBuiltInProfiles() {
  try {
    // Advanced profile configuration
    const advancedProfile = {
      name: 'advanced',
      displayName: 'Advanced Stealth Profile',
      description: 'High-level stealth profile with advanced human behavior simulation',
      version: '1.0.0',
      enabled: true,
      scroll: {
        strategy: 'adaptive',
        minStep: 30,
        maxStep: 300,
        minDelay: 50,
        maxDelay: 800,
        jitter: 0.2,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        momentum: true,
        reverse: {
          enabled: true,
          probability: 0.08,
          maxSteps: 5
        }
      },
      stealth: {
        level: 'expert',
        noiseEvents: {
          enabled: true,
          frequency: 0.3,
          types: ['mousemove', 'keypress', 'focus', 'blur', 'scroll']
        },
        dwellTime: {
          enabled: true,
          minDuration: 2000,
          maxDuration: 8000,
          variation: 0.4
        },
        cursorSimulation: {
          enabled: true,
          movement: true,
          hover: true,
          click: true
        },
        fingerprintVariation: {
          enabled: true,
          level: 'high',
          userAgent: true,
          screen: true,
          timezone: true
        }
      },
      navigation: {
        autoNavigate: true,
        mode: 'newTab',
        target: 'next',
        delay: {
          min: 3000,
          max: 8000
        }
      },
      analytics: {
        enabled: true,
        heatmap: true,
        timeline: true,
        statistics: true
      }
    };

    // Fast profile configuration
    const fastProfile = {
      name: 'fast',
      displayName: 'Fast Profile',
      description: 'Quick scrolling profile for rapid content consumption',
      version: '1.0.0',
      enabled: true,
      scroll: {
        strategy: 'linear',
        minStep: 100,
        maxStep: 500,
        minDelay: 20,
        maxDelay: 100,
        jitter: 0.1,
        easing: 'linear',
        momentum: false
      },
      stealth: {
        level: 'basic',
        noiseEvents: {
          enabled: false
        },
        dwellTime: {
          enabled: false
        }
      },
      navigation: {
        autoNavigate: true,
        mode: 'sameTab',
        target: 'next'
      }
    };

    // Slow profile configuration
    const slowProfile = {
      name: 'slow',
      displayName: 'Slow Profile',
      description: 'Slow, careful scrolling profile for detailed reading',
      version: '1.0.0',
      enabled: true,
      scroll: {
        strategy: 'idle',
        minStep: 10,
        maxStep: 50,
        minDelay: 200,
        maxDelay: 1000,
        jitter: 0.3,
        easing: 'ease-in-out',
        momentum: true
      },
      stealth: {
        level: 'intermediate',
        noiseEvents: {
          enabled: true,
          frequency: 0.2
        },
        dwellTime: {
          enabled: true,
          minDuration: 5000,
          maxDuration: 15000
        }
      },
      navigation: {
        autoNavigate: false
      }
    };

    return {
      default: DEFAULT_PROFILE,
      advanced: advancedProfile,
      fast: fastProfile,
      slow: slowProfile
    };
  } catch (error) {
    logger.error('Error loading built-in profiles', { error });
    return { default: DEFAULT_PROFILE };
  }
}

/**
 * Save profile to storage
 * @param {string} profileName - Profile name
 * @param {Object} profile - Profile configuration
 * @returns {Promise<boolean>} - Success status
 */
export async function saveProfile(profileName, profile) {
  try {
    // Validate profile before saving
    const validatedProfile = validateProfile(profile);
    
    // Save to storage
    const storageKey = `profile_${profileName}`;
    const success = await setStorageValue(storageKey, validatedProfile);
    
    if (success) {
      // Update cache
      profileCache.set(profileName, validatedProfile);
      
      logger.info('Profile saved successfully', { 
        profileName, 
        version: validatedProfile.version 
      });
    }
    
    return success;
  } catch (error) {
    logger.error('Error saving profile', { profileName, error });
    return false;
  }
}

/**
 * Validate profile against schema
 * @param {Object} profile - Profile configuration
 * @returns {Object} - Validated profile
 */
function validateProfile(profile) {
  try {
    // Basic validation
    if (!profile || typeof profile !== 'object') {
      throw new Error('Invalid profile: must be an object');
    }

    // Required fields
    const requiredFields = ['name', 'displayName', 'description', 'version', 'enabled'];
    for (const field of requiredFields) {
      if (!(field in profile)) {
        throw new Error(`Invalid profile: missing required field '${field}'`);
      }
    }

    // Validate scroll configuration
    if (profile.scroll) {
      validateScrollConfig(profile.scroll);
    }

    // Validate stealth configuration
    if (profile.stealth) {
      validateStealthConfig(profile.stealth);
    }

    // Validate navigation configuration
    if (profile.navigation) {
      validateNavigationConfig(profile.navigation);
    }

    // Validate adapters configuration
    if (profile.adapters) {
      validateAdaptersConfig(profile.adapters);
    }

    // Validate limits
    if (profile.limits) {
      validateLimitsConfig(profile.limits);
    }

    logger.debug('Profile validation successful', { name: profile.name });
    return profile;
  } catch (error) {
    logger.error('Profile validation failed', { error, profile });
    throw error;
  }
}

/**
 * Validate scroll configuration
 * @param {Object} scrollConfig - Scroll configuration
 */
function validateScrollConfig(scrollConfig) {
  const { minStep, maxStep, minDelay, maxDelay } = scrollConfig;

  if (minStep >= maxStep) {
    throw new Error('Invalid scroll config: minStep must be less than maxStep');
  }

  if (minDelay >= maxDelay) {
    throw new Error('Invalid scroll config: minDelay must be less than maxDelay');
  }

  if (minStep < 1 || maxStep > 1000) {
    throw new Error('Invalid scroll config: step values must be between 1 and 1000');
  }

  if (minDelay < 1 || maxDelay > 10000) {
    throw new Error('Invalid scroll config: delay values must be between 1 and 10000');
  }
}

/**
 * Validate stealth configuration
 * @param {Object} stealthConfig - Stealth configuration
 */
function validateStealthConfig(stealthConfig) {
  const { level } = stealthConfig;
  const validLevels = ['basic', 'intermediate', 'advanced', 'expert'];

  if (level && !validLevels.includes(level)) {
    throw new Error(`Invalid stealth config: level must be one of ${validLevels.join(', ')}`);
  }
}

/**
 * Validate navigation configuration
 * @param {Object} navigationConfig - Navigation configuration
 */
function validateNavigationConfig(navigationConfig) {
  const { mode, target } = navigationConfig;
  const validModes = ['sameTab', 'newTab', 'mixed'];
  const validTargets = ['next', 'prev', 'related', 'recent', 'mixed'];

  if (mode && !validModes.includes(mode)) {
    throw new Error(`Invalid navigation config: mode must be one of ${validModes.join(', ')}`);
  }

  if (target && !validTargets.includes(target)) {
    throw new Error(`Invalid navigation config: target must be one of ${validTargets.join(', ')}`);
  }
}

/**
 * Validate adapters configuration
 * @param {Object} adaptersConfig - Adapters configuration
 */
function validateAdaptersConfig(adaptersConfig) {
  const { desktop, mobile } = adaptersConfig;

  if (desktop && desktop.precision) {
    const validPrecisions = ['low', 'medium', 'high'];
    if (!validPrecisions.includes(desktop.precision)) {
      throw new Error(`Invalid desktop adapter config: precision must be one of ${validPrecisions.join(', ')}`);
    }
  }

  if (mobile && mobile.precision) {
    const validPrecisions = ['low', 'medium', 'high'];
    if (!validPrecisions.includes(mobile.precision)) {
      throw new Error(`Invalid mobile adapter config: precision must be one of ${validPrecisions.join(', ')}`);
    }
  }
}

/**
 * Validate limits configuration
 * @param {Object} limitsConfig - Limits configuration
 */
function validateLimitsConfig(limitsConfig) {
  const { maxSessionTime, maxPagesPerSession, maxScrollDistance } = limitsConfig;

  if (maxSessionTime && (maxSessionTime < 0 || maxSessionTime > 3600000)) {
    throw new Error('Invalid limits config: maxSessionTime must be between 0 and 3600000');
  }

  if (maxPagesPerSession && (maxPagesPerSession < 1 || maxPagesPerSession > 100)) {
    throw new Error('Invalid limits config: maxPagesPerSession must be between 1 and 100');
  }

  if (maxScrollDistance && (maxScrollDistance < 0 || maxScrollDistance > 100000)) {
    throw new Error('Invalid limits config: maxScrollDistance must be between 0 and 100000');
  }
}

/**
 * Get active profile
 * @returns {Object|null} - Active profile or null
 */
export function getActiveProfile() {
  return activeProfile;
}

/**
 * Get available profiles
 * @returns {Promise<Array>} - Array of available profiles
 */
export async function getAvailableProfiles() {
  try {
    const builtInProfiles = await loadBuiltInProfiles();
    const profiles = Object.values(builtInProfiles);
    
    // Add custom profiles from storage
    const customProfiles = await getStorageValue('extensionProfiles', {});
    Object.values(customProfiles).forEach(profile => {
      if (profile && profile.name) {
        profiles.push(profile);
      }
    });
    
    return profiles;
  } catch (error) {
    logger.error('Error getting available profiles', { error });
    return [DEFAULT_PROFILE];
  }
}

/**
 * Set active profile
 * @param {string} profileName - Profile name
 * @returns {Promise<boolean>} - Success status
 */
export async function setActiveProfile(profileName) {
  try {
    const profile = await loadProfile(profileName);
    activeProfile = profile;
    
    // Save active profile to storage
    await setStorageValue('activeProfile', profileName);
    
    logger.info('Active profile set', { profileName });
    return true;
  } catch (error) {
    logger.error('Error setting active profile', { profileName, error });
    return false;
  }
}


/**
 * Delete profile
 * @param {string} profileName - Profile name
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteProfile(profileName) {
  try {
    // Remove from storage
    const storageKey = `profile_${profileName}`;
    await setStorageValue(storageKey, null);
    
    // Remove from cache
    profileCache.delete(profileName);
    
    // If this was the active profile, reset to default
    if (activeProfile && activeProfile.name === profileName) {
      await setActiveProfile('default');
    }
    
    logger.info('Profile deleted', { profileName });
    return true;
  } catch (error) {
    logger.error('Error deleting profile', { profileName, error });
    return false;
  }
}

/**
 * Clear profile cache
 */
export function clearProfileCache() {
  profileCache.clear();
  logger.debug('Profile cache cleared');
}

/**
 * Get profile configuration value
 * @param {string} path - Configuration path (e.g., 'scroll.minStep')
 * @param {any} defaultValue - Default value
 * @returns {any} - Configuration value
 */
export function getProfileValue(path, defaultValue = null) {
  if (!activeProfile) {
    return defaultValue;
  }

  try {
    const keys = path.split('.');
    let value = activeProfile;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  } catch (error) {
    logger.error('Error getting profile value', { path, error });
    return defaultValue;
  }
}

/**
 * Initialize profiles system
 * @returns {Promise<boolean>} - Success status
 */
export async function initializeProfiles() {
  try {
    // Load active profile from storage
    const activeProfileName = await getStorageValue('activeProfile', 'default');
    await setActiveProfile(activeProfileName);
    
    logger.info('Profiles system initialized', { activeProfile: activeProfileName });
    return true;
  } catch (error) {
    logger.error('Error initializing profiles system', { error });
    return false;
  }
}
