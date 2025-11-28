const SimpleCache = require('./cache');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('SimpleCache', () => {
    let cache;
    
    beforeEach(() => {
        cache = new SimpleCache(2); // Fresh cache for each test
    });
    
    test('should return null on cache miss', () => {
        expect(cache.get('x')).toBeNull();
    });
    
    test('should store and retrieve values', () => {
        cache.set('a', 1, 200); // 200ms TTL
        expect(cache.get('a')).toBe(1);
    });
    
    test('should expire values after TTL', async () => {
        cache.set('a', 1, 200); // 200ms TTL
        await sleep(250);
        expect(cache.get('a')).toBeNull();
    });
    
    test('should evict oldest entry when full', () => {
        cache.set('k1', 'v1', 5000);
        cache.set('k2', 'v2', 5000);
        cache.set('k3', 'v3', 5000); // should evict oldest (k1) if you delete oldest on full
        expect(cache.get('k1')).toBeNull();
        expect(cache.get('k2')).toBe('v2');
        expect(cache.get('k3')).toBe('v3');
    });
    
    test('should track hit/miss stats correctly', () => {
        cache.get('x'); // miss
        cache.set('a', 1, 1000);
        cache.get('a'); // hit
        
        const stats = cache.getStats();
        expect(stats.hits).toBe(1);
        expect(stats.misses).toBe(1);
        expect(stats.size).toBe(1);
});
});