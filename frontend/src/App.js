import "./App.css";
import TickerInput from "./components/TickerInput";
import ThemeToggle from "./components/ThemeToggle";
import Footer from "./components/Footer";
import TradingViewChart from "./components/TradingViewChart";




import { useState, useRef, useEffect } from "react";

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [ticker, setTicker] = useState('');   // user entered string
  const [chartData, setChartData] = useState(null); // chart data
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [indicator, setIndicator] = useState("none"); // selected indicator
  const [isDark, setIsDark] = useState(false);
  const indicators = ["none", "SMA"]; // can add more later

  const timeframes = [
    { value: 'intraday', label: '1D', function: 'TIME_SERIES_INTRADAY' },
    { value: 'daily', label: '1M', function: 'TIME_SERIES_DAILY' },
    { value: 'weekly', label: '3M', function: 'TIME_SERIES_WEEKLY' },
    { value: 'monthly', label: '1Y', function: 'TIME_SERIES_MONTHLY' },
  ];



  const fetchStock = async () => {
    let url;

    if (!ticker) return;
    if (ticker.length <= 1 || ticker.length > 5) {
      alert("Ticker length must be between 2 and 5 characters.");
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);
      console.log('Fetching ticker:', ticker);
      const res = await fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo');
      // const res = await fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=demo')
      //const res = await fetch(`http://127.0.0.1:8000/api/stock/${ticker}?outputsize=full`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      console.log('alpha response keys:', Object.keys(data || {}))

      // alpha vant returns "note" on rate-limit and "error message" for bad tickers
      if (data['Note'] || data['Error Message'] || data['Information']) {
        const reason = data['Note'] || data['Error Message'] || data['Information'];
        setFetchError(reason);
        setChartData([]);
        setLoading(false);
        console.warn('AlphaVantage error:', reason);
        return;
      }


      // Transform AlphaVantage TIME_SERIES_DAILY -> lightweight-charts OHLC array
      // AlphaVantage uses "Time Series (Daily)" as the key for daily data
      const ts = data['Time Series (Daily)'] || data['Time Series (Daily)'] || {};
      const ohlc = Object.keys(ts).map((dateStr) => {
        const d = ts[dateStr];
        return {
          time: dateStr, // 'YYYY-MM-DD' accepted by lightweight-charts
          open: parseFloat(d['1. open']),
          high: parseFloat(d['2. high']),
          low: parseFloat(d['3. low']),
          close: parseFloat(d['4. close']),
        };
      })
        .sort((a, b) => a.time.localeCompare(b.time)); // ascending by date

      // store OHLC array directly — TradingViewChart expects this shape
      setChartData(ohlc);

    } catch (err) {
      console.error("Failed to fetch stock:", err);
      setFetchError(err.message || 'Failed to fetch stock data.');
      alert("Failed to fetch stock data. Make sure the ticker exists!");
    } finally {
      setLoading(false);
    }

  };



  return (
    <main className="App">
      <header className="app-header">
        <div className="left-section">
          <div className="logo-section">
            <h1 className="app-logo">Ardium</h1>
            <p className="app-subtitle">Stock Analysis</p>
          </div>
          <nav className="main-nav">
            <button className="nav-link">Charts</button>
            <button className="nav-link">Screener</button>
            <button className="nav-link">News</button>
            <button
              className="nav-link"
              onClick={() => window.open('https://github.com/PeterMeas/Ardium', '_blank', 'noopener,noreferrer')}
            >
              Github
            </button>
          </nav>
        </div>
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      </header>

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

      {/* TradingView Candlestick Chart */}
      <section className="chart-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : fetchError ? (
          <p style={{ color: 'crimson' }}>{fetchError}</p>
        ) : (
          <TradingViewChart data={chartData} />
        )}
      </section>

      <Footer />
    </main>
  );
}

export default App;