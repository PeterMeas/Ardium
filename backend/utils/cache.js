class SimpleCache {
  /**
   * @param {number} maxEntries - Maximum number of cache entries
   */
  constructor(maxEntries = 500) {
    /** @type {Map<string, {data: any, expires: number}>} */
    this.map = new Map();
    /** @type {number} */
    this.maxEntries = maxEntries;
    this.hits = 0;        // read successfully
    this.misses = 0;      // no entry found 
    this.requests = 0;    //requests = hit + misses
    this.puts = 0;        // times a value was updated/inserted ( set called)) 
    this.evictions = 0;   // entries removed automatically ( capacity, expiration cleanup )
  }

  /**
   * Get cached value
   * @param {string} key 
   * @returns {any|null}
   */
  get(key) {
    this.requests++;
    const entry = this.map.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (entry.expires && entry.expires <= Date.now()) {
      this.map.delete(key);
      this.evictions++;
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data;
  }

  /**
   * Set cache value with TTL
   * @param {string} key 
   * @param {any} data 
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, data, ttlMs = 60 * 1000) {
    // Simple LRU: delete oldest when full
    if (this.map.size >= this.maxEntries) {
      const firstKey = this.map.keys().next().value;
      if (firstKey) {
        this.map.delete(firstKey);
        this.evictions++;
      }
    }
    
    this.map.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
    this.puts++;
  }

  clear() {
    this.map.clear();
  }


  /**
   * returns simple cache stats
   * @returns {{size:number, maxEntries:number, hits:number, misses:number, requests:number, hitRate:number}}
   * 
   */
  getStats() {
    const hits = this.hits || 0;
    const misses = this.misses || 0;
    const total = hits + misses;
    const hitRate = (this.hits / (this.hits + this.misses ));
        return { size: this.map ? this.map.size : 0 , 
                maxEntries: this.maxEntries, 
                hits, 
                misses, 
                requests: this.requests || 0, 
                puts: this.puts || 0, 
                evictions: this.evictions || 0, 
                hitRate 
              };
  }
}

module.exports = SimpleCache;