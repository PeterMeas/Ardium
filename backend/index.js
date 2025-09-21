const express = require('express');
const cors = require('cors');
const app = express();

// Enable all CORS requests
app.use(cors());

app.get('/stock/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const data = {
    AAPL: { prices: [150,152,149,155,157], dates: ['2025-09-01','2025-09-02','2025-09-03','2025-09-04','2025-09-05'] },
    TSLA: { prices: [700,720,710,730,740], dates: ['2025-09-01','2025-09-02','2025-09-03','2025-09-04','2025-09-05'] }
  }[ticker] || { prices: [150,152,149,155,157], dates: ['2025-09-01','2025-09-02','2025-09-03','2025-09-04','2025-09-05'] };

  res.json({ ticker, ...data });
});

app.listen(8000, () => console.log('Backend running on http://localhost:8000'));
