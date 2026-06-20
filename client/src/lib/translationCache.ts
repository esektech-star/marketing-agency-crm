/**
 * Translation Caching System
 * Optimizes performance by caching translations in memory and localStorage
 */

interface CacheEntry {
  timestamp: number;
  data: Record<string, any>;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = 'translation_cache_';

class TranslationCache {
  private memoryCache: Map<string, CacheEntry> = new Map();

  /**
   * Get translation from cache (memory first, then localStorage)
   */
  get(key: string, language: string): any {
    const cacheKey = `${CACHE_PREFIX}${language}_${key}`;

    // Check memory cache first
    const memEntry = this.memoryCache.get(cacheKey);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const entry = JSON.parse(stored) as CacheEntry;
        if (!this.isExpired(entry)) {
          // Restore to memory cache
          this.memoryCache.set(cacheKey, entry);
          return entry.data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }

    return null;
  }

  /**
   * Set translation in cache (both memory and localStorage)
   */
  set(key: string, language: string, data: any): void {
    const cacheKey = `${CACHE_PREFIX}${language}_${key}`;
    const entry: CacheEntry = {
      timestamp: Date.now(),
      data,
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, entry);

    // Store in localStorage
    try {
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }

  /**
   * Clear cache for a specific language
   */
  clearLanguage(language: string): void {
    const prefix = `${CACHE_PREFIX}${language}_`;

    // Clear memory cache
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    // Clear localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.memoryCache.clear();

    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_DURATION;
  }

  /**
   * Get cache statistics
   */
  getStats(): { memorySize: number; cacheEntries: string[] } {
    const entries: string[] = [];
    this.memoryCache.forEach((_, key) => {
      entries.push(key);
    });
    return {
      memorySize: this.memoryCache.size,
      cacheEntries: entries,
    };
  }
}

// Export singleton instance
export const translationCache = new TranslationCache();
