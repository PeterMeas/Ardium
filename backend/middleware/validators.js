const TICKER_REGEX = /^[A-Z.-]{1,7}$/;

const validateSymbol = (req, res, next) => {
  const symbol = (req.params.symbol || '').trim().toUpperCase();

  if (!symbol || !TICKER_REGEX.test(symbol)) {
    return res.status(400).json({ error: 'Missing or invalid symbol' });
  }

  req.params.symbol = symbol;
  next();
};

module.exports = { validateSymbol };
