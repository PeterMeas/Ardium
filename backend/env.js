// Centralized environment loader
// - Reads .env once via dotenv
// - Exposes typed/configured constants for the app
// - Single source of truth for defaults, validation, and future overrides
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });


const cfg = {
  PORT: Number(process.env.PORT) || 8000,
  ALPHA_VANTAGE_KEY: process.env.ALPHA_VANTAGE_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// TODO: enforce required vars in production
// if (cfg.NODE_ENV === 'production' && !cfg.ALPHA_VANTAGE_KEY) {
//   throw new Error('Missing ALPHA_VANTAGE_KEY env var');
// }

module.exports = cfg;