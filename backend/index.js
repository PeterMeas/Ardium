
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
    // 1) validate input (return 400 if missing/too short)
    // 2) check searchCache.get(key) and return cached.data if not expired
    const key = symbol.toLowerCase();
    const cached = cacheService.getCachedSearch(key);
    if (cached) {
      console.log('Returning cached search for:', symbol);
      return res.json(cached);
    }
    const resp = await searchSymbol(symbol);
    //check for errors
    // TODO: move API error normalization to a tiny helper (alphaErrorOf(resp.data))

    if (resp.data.Note || resp.data['Error Message'] || resp.data.Information) {
      return res.status(429).json({ error: resp.data.Note || resp.data['Error Message'] || resp.data.Information });
    }
    const ttL = 60 * 1000;
    cacheService.setCachedSearch(key, resp.data, ttL);
    return res.json(resp.data);
    // 4) if resp.data.Note / resp.data['Error Message'] -> res.status(429).json({ error: ... })
    // 5) cache and return resp.data (set TTL ~60s)
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
    const outputsize = 'compact'; // compact returns last 100 data points
    //CHECK CACHE
    const cached = cacheService.getCachedStock(symbol, outputsize);
    if (cached) {
      console.log('Cache HIT for', symbol);
      return res.json(cached);
    }
    console.log('Cache MISS for', symbol);
    const response = await getDailyTimeSeries(symbol, outputsize);
    // TODO: handle Alpha Vantage rate-limit messages here like in search route

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
/*app.get('/stock/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  
  
});*/

// TODO: add dev-only cache clear endpoint
// app.post('/api/cache/clear', (req, res) => { const a=searchCache.getStats().size, b=stockCache.getStats().size; searchCache.clear(); stockCache.clear(); res.json({ cleared: { search:a, stock:b } }); });
// TODO: add /healthz with dependency checks (e.g., AlphaVantage key present)

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
