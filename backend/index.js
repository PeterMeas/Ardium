require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Enable all CORS requests
app.use(cors());
const searchCache = new Map(); // key -> { expires: number, data: any }

const axios = require('axios');

app.get('/api/search/:symbol', async (req, res) => {
  const symbol = (req.params.symbol || '' ).trim();
  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API key'});
  }

  try {

    if (!symbol || symbol.length < 1) {
      return res.status(400).json({ error: 'Missing or invalid symbol' });
    }
    // 1) validate input (return 400 if missing/too short)
    // 2) check searchCache.get(key) and return cached.data if not expired
    const key = symbol.toLowerCase();
    const cached = searchCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }
    const resp = await axios.get('https://www.alphavantage.co/query', {
        params: {
        function: 'SYMBOL_SEARCH',
        keywords: symbol,
        apikey: apiKey
      }
    }
  );

  if (resp.data.Note || resp.data['Error Message'] || resp.data.Information) {
        return res.status(429).json({ error: resp.data.Note || resp.data['Error Message'] || resp.data.Information });
  }
    const ttL = 60 * 1000;
    searchCache.set(key, { expires: Date.now() + ttL, data: resp.data });
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
  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    console.error('ALPHA_VANTAGE_KEY not set in .env');
    return res.status(500).json({ error: 'Missing API key'} );
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol : symbol,
        apikey: apiKey
      }

    }
  );
  console.log('alpha response keys:', Object.keys(response.data || {}));
  res.json(response.data);
  } catch (error) {
    console.error('alpha fetch error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching stock data' });
  }

})


/*app.get('/stock/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  
  
});*/

app.listen(8000, () => console.log('Backend running on http://localhost:8000'));
