import { useState } from 'react';
import TickerInput from '../components/TickerInput.jsx';
import TradingViewChart from '../components/TradingViewChart.jsx';
import { fetchStockData } from '../services/api';

/**
 * The main Charts Page component.
 * Tracks user input, retrieves relevant stock data, and renders the TradingView chart.
 * 
 * @returns {JSX.Element} The charts page layout containing search and charting capabilities.
 */
export default function ChartsPage() {
  const [ticker, setTicker] = useState('');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [indicator, setIndicator] = useState("none");
  const indicators = ["none", "SMA"];

  /**
   * Validates the currently selected ticker and initiates the API call to fetch stock data.
   * Updates component state (loading, error, chartData) based on the response.
   * 
   * @returns {Promise<void>} Resolves when state has been completely updated after the fetch attempt.
   */
  const fetchStock = async () => {
    if (!ticker) return;
    if (ticker.length <= 1 || ticker.length > 5) {
      setFetchError("Ticker length must be between 2 and 5 characters.");
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);
      const data = await fetchStockData(ticker);
      
      if (data['Note'] || data['Error Message'] || data['Information']) {
        const reason = data['Note'] || data['Error Message'] || data['Information'];
        setFetchError(reason);
        setChartData([]);
        return;
      }

      if (Array.isArray(data)) {
        setChartData(data);
      } else {
        const ts = data['Time Series (Daily)'] || {};
        const ohlc = Object.keys(ts).map((dateStr) => {
          const d = ts[dateStr];
          return {
            time: dateStr,
            open: parseFloat(d['1. open']),
            high: parseFloat(d['2. high']),
            low: parseFloat(d['3. low']),
            close: parseFloat(d['4. close']),
          };
        }).sort((a, b) => a.time.localeCompare(b.time));
        setChartData(ohlc);
      }
    } catch (err) {
      console.error("Failed to fetch stock:", err);
      setFetchError(err.response?.data?.error || err.message || 'Failed to fetch stock data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="charts-page-wrapper">
      <section className="card">
        <div className="form-group">
          <TickerInput
            ticker={ticker}
            setTicker={setTicker}
            onFetch={fetchStock}
            indicator={indicator}
            setIndicator={setIndicator}
            indicators={indicators}
          />
        </div>
      </section>

      <section className="chart-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : fetchError ? (
          <p className="error-text">{fetchError}</p>
        ) : (
          <TradingViewChart data={chartData} />
        )}
      </section>
    </div>
  );
}
