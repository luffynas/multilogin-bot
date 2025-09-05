/**
 * Storage utilities for Chrome extension storage and localStorage
 */

/**
 * Storage types
 */
export const STORAGE_TYPES = {
  LOCAL: 'local',
  SYNC: 'sync',
  SESSION: 'session'
};

/**
 * Default storage type
 */
const DEFAULT_STORAGE_TYPE = STORAGE_TYPES.LOCAL;

/**
 * Get storage API based on type
 * @param {string} type - Storage type
 * @returns {Object} - Storage API
 */
function getStorageAPI(type = DEFAULT_STORAGE_TYPE) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    switch (type) {
      case STORAGE_TYPES.SYNC:
        return chrome.storage.sync;
      case STORAGE_TYPES.SESSION:
        return chrome.storage.session;
      default:
        return chrome.storage.local;
    }
  }
  
  // Fallback to localStorage
  return {
    get: (keys) => {
      return new Promise((resolve) => {
        const result = {};
        const keysArray = Array.isArray(keys) ? keys : [keys];
        
        keysArray.forEach(key => {
          if (key === null) {
            // Get all keys
            for (let i = 0; i < localStorage.length; i++) {
              const storageKey = localStorage.key(i);
              if (storageKey) {
                try {
                  result[storageKey] = JSON.parse(localStorage.getItem(storageKey));
                } catch (e) {
                  result[storageKey] = localStorage.getItem(storageKey);
                }
              }
            }
          } else {
            try {
              result[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
              result[key] = localStorage.getItem(key);
            }
          }
        });
        
        resolve(result);
      });
    },
    set: (items) => {
      return new Promise((resolve) => {
        Object.entries(items).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        resolve();
      });
    },
    remove: (keys) => {
      return new Promise((resolve) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => {
          localStorage.removeItem(key);
        });
        resolve();
      });
    },
    clear: () => {
      return new Promise((resolve) => {
        localStorage.clear();
        resolve();
      });
    }
  };
}

/**
 * Get value from storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @param {string} type - Storage type
 * @returns {Promise<any>} - Stored value or default
 */
export async function getStorageValue(key, defaultValue = null, type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    const result = await storage.get(key);
    return result[key] !== undefined ? result[key] : defaultValue;
  } catch (error) {
    console.error('Error getting storage value:', error);
    return defaultValue;
  }
}

/**
 * Set value in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {string} type - Storage type
 * @returns {Promise<boolean>} - Success status
 */
export async function setStorageValue(key, value, type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    await storage.set({ [key]: value });
    return true;
  } catch (error) {
    console.error('Error setting storage value:', error);
    return false;
  }
}

/**
 * Remove value from storage
 * @param {string} key - Storage key
 * @param {string} type - Storage type
 * @returns {Promise<boolean>} - Success status
 */
export async function removeStorageValue(key, type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    await storage.remove(key);
    return true;
  } catch (error) {
    console.error('Error removing storage value:', error);
    return false;
  }
}

/**
 * Get multiple values from storage
 * @param {Array<string>} keys - Storage keys
 * @param {string} type - Storage type
 * @returns {Promise<Object>} - Object with key-value pairs
 */
export async function getStorageValues(keys, type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    return await storage.get(keys);
  } catch (error) {
    console.error('Error getting storage values:', error);
    return {};
  }
}

/**
 * Set multiple values in storage
 * @param {Object} items - Object with key-value pairs
 * @param {string} type - Storage type
 * @returns {Promise<boolean>} - Success status
 */
export async function setStorageValues(items, type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    await storage.set(items);
    return true;
  } catch (error) {
    console.error('Error setting storage values:', error);
    return false;
  }
}

/**
 * Clear all storage
 * @param {string} type - Storage type
 * @returns {Promise<boolean>} - Success status
 */
export async function clearStorage(type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    await storage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

/**
 * Get all storage keys
 * @param {string} type - Storage type
 * @returns {Promise<Array<string>>} - Array of storage keys
 */
export async function getStorageKeys(type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    const result = await storage.get(null);
    return Object.keys(result);
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
}

/**
 * Check if storage key exists
 * @param {string} key - Storage key
 * @param {string} type - Storage type
 * @returns {Promise<boolean>} - True if key exists
 */
export async function hasStorageKey(key, type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    const result = await storage.get(key);
    return result[key] !== undefined;
  } catch (error) {
    console.error('Error checking storage key:', error);
    return false;
  }
}

/**
 * Get storage size in bytes
 * @param {string} type - Storage type
 * @returns {Promise<number>} - Storage size in bytes
 */
export async function getStorageSize(type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    const result = await storage.get(null);
    const jsonString = JSON.stringify(result);
    return new Blob([jsonString]).size;
  } catch (error) {
    console.error('Error getting storage size:', error);
    return 0;
  }
}

/**
 * Get storage quota information
 * @param {string} type - Storage type
 * @returns {Promise<Object>} - Quota information
 */
export async function getStorageQuota(type = DEFAULT_STORAGE_TYPE) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const storage = getStorageAPI(type);
      return await storage.getBytesInUse();
    }
    
    // Fallback for localStorage
    const size = await getStorageSize(type);
    return {
      used: size,
      available: 5 * 1024 * 1024 - size, // 5MB limit
      total: 5 * 1024 * 1024
    };
  } catch (error) {
    console.error('Error getting storage quota:', error);
    return { used: 0, available: 0, total: 0 };
  }
}

/**
 * Create a storage observer
 * @param {Function} callback - Callback function
 * @param {string} type - Storage type
 * @returns {Object} - Observer object with remove function
 */
export function createStorageObserver(callback, type = DEFAULT_STORAGE_TYPE) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const storage = getStorageAPI(type);
    const listener = (changes, areaName) => {
      if (areaName === type) {
        callback(changes);
      }
    };
    
    chrome.storage.onChanged.addListener(listener);
    
    return {
      remove: () => {
        chrome.storage.onChanged.removeListener(listener);
      }
    };
  }
  
  // Fallback for localStorage
  const listener = (event) => {
    if (event.storageArea === localStorage) {
      callback({
        [event.key]: {
          oldValue: event.oldValue,
          newValue: event.newValue
        }
      });
    }
  };
  
  window.addEventListener('storage', listener);
  
  return {
    remove: () => {
      window.removeEventListener('storage', listener);
    }
  };
}

/**
 * Create a namespaced storage
 * @param {string} namespace - Namespace prefix
 * @param {string} type - Storage type
 * @returns {Object} - Namespaced storage API
 */
export function createNamespacedStorage(namespace, type = DEFAULT_STORAGE_TYPE) {
  const prefix = `${namespace}:`;
  
  return {
    get: async (key, defaultValue = null) => {
      return await getStorageValue(prefix + key, defaultValue, type);
    },
    set: async (key, value) => {
      return await setStorageValue(prefix + key, value, type);
    },
    remove: async (key) => {
      return await removeStorageValue(prefix + key, type);
    },
    getMultiple: async (keys) => {
      const prefixedKeys = keys.map(key => prefix + key);
      const result = await getStorageValues(prefixedKeys, type);
      const unprefixed = {};
      Object.entries(result).forEach(([key, value]) => {
        unprefixed[key.replace(prefix, '')] = value;
      });
      return unprefixed;
    },
    setMultiple: async (items) => {
      const prefixedItems = {};
      Object.entries(items).forEach(([key, value]) => {
        prefixedItems[prefix + key] = value;
      });
      return await setStorageValues(prefixedItems, type);
    },
    clear: async () => {
      const keys = await getStorageKeys(type);
      const namespaceKeys = keys.filter(key => key.startsWith(prefix));
      if (namespaceKeys.length > 0) {
        const storage = getStorageAPI(type);
        await storage.remove(namespaceKeys);
      }
    }
  };
}

/**
 * Export storage data
 * @param {string} type - Storage type
 * @returns {Promise<string>} - JSON string of storage data
 */
export async function exportStorageData(type = DEFAULT_STORAGE_TYPE) {
  try {
    const storage = getStorageAPI(type);
    const data = await storage.get(null);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting storage data:', error);
    return '{}';
  }
}

/**
 * Import storage data
 * @param {string} jsonData - JSON string of storage data
 * @param {string} type - Storage type
 * @returns {Promise<boolean>} - Success status
 */
export async function importStorageData(jsonData, type = DEFAULT_STORAGE_TYPE) {
  try {
    const data = JSON.parse(jsonData);
    const storage = getStorageAPI(type);
    await storage.set(data);
    return true;
  } catch (error) {
    console.error('Error importing storage data:', error);
    return false;
  }
}
