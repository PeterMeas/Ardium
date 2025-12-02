const SimpleCache = require('./cache');
const cacheService = require('./cacheService');

jest.mock('./cache');

SimpleCache.mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn()
}));

describe('cacheService', () => {

    describe('getCachedStock', () => {
        test('should call stockCache with correct key', () => {
            const fakeData = { symbol: 'AAPL', data: 'compact' };
            SimpleCache.mock.instances[1].get.mockReturnValue(fakeData);
            const result = cacheService.getCachedStock('AAPL', 'compact');
            expect(SimpleCache.mock.instances[1].get).toHaveBeenCalledWith('AAPL::compact');
            expect(result).toEqual(fakeData);
        })
    })

    describe('setCachedStock', () => {
        test('should verify stockCache.set is called w/correct params', () => {
            const fakeData = {
                symbol: 'AAPL',
                data: 'compact'
            }
            cacheService.setCachedStock('AAPL', 'compact', fakeData, 100 )
            expect(SimpleCache.mock.instances[1].set).toHaveBeenCalledWith('AAPL::compact', fakeData, 100)
        })  
    })

    describe('getCachedSearch', () => {
        test('should call searchCache with correct key', () => {
            const data = { symbol: 'HOOD'}
            SimpleCache.mock.instances[0].get.mockReturnValue(data);
            const result = cacheService.getCachedSearch('HOOD');
            expect(SimpleCache.mock.instances[0].get).toHaveBeenCalledWith('hood');
            expect(result).toEqual(data);
        })
    })

    describe('setCachedSearch', () => {
        test('searchCache.set should be called with correct params', () => {
        const fakeData = {
            symbol: 'TSLA'
            ,
            data: 'compact'
        }
        cacheService.setCachedSearch('TSLA', fakeData, 100)
        expect(SimpleCache.mock.instances[0].set).toHaveBeenCalledWith('tsla', fakeData, 100);
        })

    })

    describe('getStats', () => {
        test('should call getStats on both caches', () => {
            const fakeStats = {
                fakeSearchStats: {
                size: 10, maxEntries: 500, hits: 5, misses: 2, requests: 7, puts: 10, evictions: 0, hitRate: 5/7
            },

                fakeStockStats:{
                size: 20, maxEntries: 500, hits: 20, misses:10, requests: 10, puts:20, evictions: 10, hitRate: 15/20
            }
        }
            SimpleCache.mock.instances[0].getStats.mockReturnValue(fakeStats.fakeSearchStats);
            SimpleCache.mock.instances[1].getStats.mockReturnValue(fakeStats.fakeStockStats);

            const result = cacheService.getStats();
            expect(result).toEqual({
                search: fakeStats.fakeSearchStats,
                stock: fakeStats.fakeStockStats
            });

        })
    })

    describe('clear', () => {
        test('should verify both caches cleared', () => {
            cacheService.clear();
            expect(SimpleCache.mock.instances[0].clear).toHaveBeenCalled()
            expect(SimpleCache.mock.instances[1].clear).toHaveBeenCalled();

        })
    })
})