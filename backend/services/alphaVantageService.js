const axios = require('axios');
const { ALPHA_VANTAGE_KEY } = require('../env');
const ALPHAV = 'https://www.alphavantage.co/query';

async function searchSymbol(symbol) {
        const resp = await axios.get(ALPHAV, {
            params: {
                function: 'SYMBOL_SEARCH',
                keywords: symbol,
                apikey: ALPHA_VANTAGE_KEY
            }
        });
        return resp.data;
}

async function getDailyTimeSeries(symbol, outputsize = 'compact') {
        const response = await axios.get(ALPHAV, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: symbol,
                apikey: ALPHA_VANTAGE_KEY,
                outputsize: outputsize
            }
        });
        return response.data;
}
module.exports = {searchSymbol, getDailyTimeSeries};