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
        test('should verify stockCache.set is called', () => {
            const fakeData = {
                symbol: 'AAPL',
                data: 'compact'
            }
            cacheService.setCachedStock('AAPL', 'compact', fakeData, 100 )
            expect(SimpleCache.mock.instances[1].set).toHaveBeenCalledWith('AAPL::compact', fakeData, 100)
        })
    })
})