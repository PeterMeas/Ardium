
const { PORT, ALPHA_VANTAGE_KEY, NODE_ENV } = require('./env');
const express = require('express');
const cors = require('cors');
const cacheService = require('./utils/cacheService');
const { searchSymbol, getDailyTimeSeries } = require('./services/alphaVantageService');

const app = express();
app.use(cors());
const apiKey = ALPHA_VANTAGE_KEY;

app.get('/api/search/:symbol', async (req, res) => {
  const symbol = (req.params.symbol || '').trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API key' });
  }
  // TODO: strengthen validation (ticker regex ^[A-Z.-]{1,7}$ and normalize to upper-case)

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

    if (resp.data.Note || resp.data['Error Message'] || resp.data.Information) {
      return res.status(429).json({ error: resp.data.Note || resp.data['Error Message'] || resp.data.Information });
    }
    const ttL = 60 * 1000;
    cacheService.setCachedSearch(key, resp.data, ttL);
    return res.json(resp.data);
  } catch (error) {
    console.error('search error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching stock data' });
  }

})

app.get('/api/stock/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  if (!apiKey) {
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

    const ttl = outputsize === 'full' ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000;
    cacheService.setCachedStock(symbol, outputsize, response.data, ttl);
    res.json(response.data);

    console.log('alpha response keys:', Object.keys(response.data || {}));
  } catch (error) {
    console.error('alpha fetch error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching stock data' });
  }

})

app.get('/api/cache/stats', (req, res) => {

  const stats = {
    ...cacheService.getStats(),
    timestamp: new Date().toISOString()
  };

  res.json(stats);

})
// TODO: Add health check endpoint
// TODO: Add cache clear endpoint for development

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
