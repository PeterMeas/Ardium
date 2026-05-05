const express = require('express');
const router = express.Router();
const { validateSymbol } = require('../middleware/validators');
const { searchStock, getStockData, getCacheStats } = require('../controllers/stockController');
const cacheService = require('../utils/cacheService');

router.get('/search/:symbol', validateSymbol, searchStock);
router.get('/stock/:symbol', validateSymbol, getStockData);
router.get('/cache/stats', getCacheStats);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.delete('/cache', (req, res) => {
  cacheService.clear();
  res.json({ message: 'Cache cleared' });
});

module.exports = router;
