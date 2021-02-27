// Simple & non-performant LeastRecentlyUsed (LRU) cache implementation.

class LRUCache {
  constructor(maxSize) {
    // Map maintains order of key insertion.
    this.cache = new Map();
    // We need to evict key/value when we need to add more than maxSize.
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const val = this.cache.get(key);

    // Delete and re-set the key to maintain as most recently used.
    this.cache.delete(key);
    this.cache.set(key, val);

    return val;
  }

  set(key, value) {
    // Delete the key from cache if already in cache (so we can update order).
    this.cache.delete(key);

    // If we are at max capacity, delete the "oldest" key/value in the map.
    if (this.cache.size === this.maxSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }

  delete(key) {
    this.cache.delete(key);
  }
}

const ProductCache = new LRUCache(3);

module.exports = ProductCache;
