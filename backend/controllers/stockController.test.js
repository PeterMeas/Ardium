const { searchStock, getStockData, getCacheStats } = require('./stockController');
const cacheService = require('../utils/cacheService');
const { searchSymbol, getDailyTimeSeries } = require('../services/alphaVantageService');

jest.mock('../utils/cacheService');
jest.mock('../services/alphaVantageService');
jest.mock('../env', () => ({
  ALPHA_VANTAGE_KEY: 'test-api-key'
}));

describe('stockController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console logs during tests to keep output clean
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('searchStock', () => {
    it('should return 400 if symbol is missing or empty', async () => {
      req.params.symbol = '   ';
      await searchStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid symbol' });
    });

    it('should return cached data if available', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedSearch.mockReturnValue({ bestMatches: [] });
      await searchStock(req, res);
      
      expect(cacheService.getCachedSearch).toHaveBeenCalledWith('aapl');
      expect(res.json).toHaveBeenCalledWith({ bestMatches: [] });
      expect(searchSymbol).not.toHaveBeenCalled();
    });

    it('should return 429 if rate limited by AlphaVantage', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedSearch.mockReturnValue(null);
      searchSymbol.mockResolvedValue({ Note: 'Rate limit' });
      await searchStock(req, res);
      
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rate limit' });
      expect(cacheService.setCachedSearch).not.toHaveBeenCalled();
    });

    it('should fetch, cache, and return data on cache miss', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedSearch.mockReturnValue(null);
      const mockData = { bestMatches: [{ symbol: 'AAPL' }] };
      searchSymbol.mockResolvedValue(mockData);
      
      await searchStock(req, res);
      
      expect(searchSymbol).toHaveBeenCalledWith('AAPL');
      expect(cacheService.setCachedSearch).toHaveBeenCalledWith('aapl', mockData, 60000);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle API errors and return 500', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedSearch.mockReturnValue(null);
      searchSymbol.mockRejectedValue(new Error('API failure'));
      
      await searchStock(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching stock data' });
    });
  });

  describe('getStockData', () => {
    it('should return cached data if available', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedStock.mockReturnValue({ 'Time Series (Daily)': {} });
      await getStockData(req, res);
      
      expect(cacheService.getCachedStock).toHaveBeenCalledWith('AAPL', 'compact');
      expect(res.json).toHaveBeenCalledWith({ 'Time Series (Daily)': {} });
      expect(getDailyTimeSeries).not.toHaveBeenCalled();
    });

    it('should return 429 if rate limited by AlphaVantage', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedStock.mockReturnValue(null);
      getDailyTimeSeries.mockResolvedValue({ Information: 'Rate limit hit' });
      await getStockData(req, res);
      
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rate limit hit' });
      expect(cacheService.setCachedStock).not.toHaveBeenCalled();
    });

    it('should fetch, cache, and return data on cache miss', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedStock.mockReturnValue(null);
      const mockData = { 'Time Series (Daily)': {} };
      getDailyTimeSeries.mockResolvedValue(mockData);
      
      await getStockData(req, res);
      
      expect(getDailyTimeSeries).toHaveBeenCalledWith('AAPL', 'compact');
      expect(cacheService.setCachedStock).toHaveBeenCalledWith('AAPL', 'compact', mockData, 300000);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle API errors and return 500', async () => {
      req.params.symbol = 'AAPL';
      cacheService.getCachedStock.mockReturnValue(null);
      getDailyTimeSeries.mockRejectedValue(new Error('API failure'));
      
      await getStockData(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching stock data' });
    });
  });

  describe('getCacheStats', () => {
    it('should return cache stats with a timestamp', () => {
      cacheService.getStats.mockReturnValue({ hits: 5, misses: 2 });
      getCacheStats(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        hits: 5,
        misses: 2,
        timestamp: expect.any(String)
      }));
    });
  });
});
