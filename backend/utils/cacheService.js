const SimpleCache = require('./cache'); 

const searchCache = new SimpleCache(500);
const stockCache = new SimpleCache(500);

function getCachedStock(symbol, outputsize) {
    const cacheKey = `${symbol}::${outputsize}`;
    const cached = stockCache.get(cacheKey);
    return cached;
}

function setCachedStock(symbol, outputsize, data, ttl) {
    const cacheKey = `${symbol}::${outputsize}`;
    stockCache.set(cacheKey, data, ttl);
}

    function getCachedSearch(symbol) {
        return searchCache.get(symbol.toLowerCase())
}

function setCachedSearch(symbol, data, ttl) {
    searchCache.set(symbol.toLowerCase(), data, ttl);
}
function getStats() {
    const stats = {
        search : searchCache.getStats(),
        stock : stockCache.getStats()
    }
    return stats;
}

function clear() {
    searchCache.clear();
    stockCache.clear();
}

module.exports= {getCachedStock,
                setCachedStock, getCachedSearch, getStats, clear, setCachedSearch};
