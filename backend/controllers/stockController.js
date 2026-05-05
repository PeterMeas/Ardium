const cacheService = require('../utils/cacheService');
const { searchSymbol, getDailyTimeSeries } = require('../services/alphaVantageService');
const { ALPHA_VANTAGE_KEY } = require('../env');

const searchStock = async (req, res) => {
  const symbol = (req.params.symbol || '').trim();
  if (!ALPHA_VANTAGE_KEY) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  if (!symbol || symbol.length < 1) {
    return res.status(400).json({ error: 'Missing or invalid symbol' });
  }

  try {
    const key = symbol.toLowerCase();
    const cached = cacheService.getCachedSearch(key);
    if (cached) {
      console.log('Returning cached search for:', symbol);
      return res.json(cached);
    }
    const resp = await searchSymbol(symbol);

    if (resp.Note || resp['Error Message'] || resp.Information) {
      return res.status(429).json({ error: resp.Note || resp['Error Message'] || resp.Information });
    }
    const ttL = 60 * 1000;
    cacheService.setCachedSearch(key, resp, ttL);
    return res.json(resp);
  } catch (error) {
    console.error('search error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching stock data' });
  }
};

const getStockData = async (req, res) => {
  const symbol = req.params.symbol;
  if (!ALPHA_VANTAGE_KEY) {
    console.error('ALPHA_VANTAGE_KEY not set in .env');
    return res.status(500).json({ error: 'Missing API key' });
  }

  try {
    const outputsize = 'compact';
    const cached = cacheService.getCachedStock(symbol, outputsize);
    if (cached) {
      console.log('Cache HIT for', symbol);
      return res.json(cached);
    }
    console.log('Cache MISS for', symbol);
    const response = await getDailyTimeSeries(symbol, outputsize);

    if (response.Note || response['Error Message'] || response.Information) {
      return res.status(429).json({ error: response.Note || response['Error Message'] || response.Information });
    }

    const ttl = outputsize === 'full' ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000;
    cacheService.setCachedStock(symbol, outputsize, response, ttl);
    res.json(response);

    console.log('alpha response keys:', Object.keys(response || {}));
  } catch (error) {
    console.error('alpha fetch error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching stock data' });
  }
};

const getCacheStats = (req, res) => {
  const stats = {
    ...cacheService.getStats(),
    timestamp: new Date().toISOString()
  };

  res.json(stats);
};

module.exports = { searchStock, getStockData, getCacheStats };
