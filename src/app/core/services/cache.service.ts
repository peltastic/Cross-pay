import { Injectable } from '@angular/core';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly CACHE_PREFIX = 'fx_cache_';

  set<T>(key: string, data: T, expiresInMinutes: number = 60): void {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMinutes * 60 * 1000
    };
    
    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheEntry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      
      if (now - cacheEntry.timestamp > cacheEntry.expiresIn) {
        this.remove(key);
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  isExpired(key: string): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return true;

      const cacheEntry: CacheEntry<any> = JSON.parse(cached);
      const now = Date.now();
      
      return now - cacheEntry.timestamp > cacheEntry.expiresIn;
    } catch (error) {
      return true;
    }
  }
}