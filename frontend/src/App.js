import "./App.css";
import TickerInput from "./components/TickerInput";
import ThemeToggle from "./components/ThemeToggle";
import Footer from "./components/Footer";
import TradingViewChart from "./components/TradingViewChart";




import { useState, useRef, useEffect } from "react";

function App() {
  const [ticker, setTicker] = useState(null);       // user-entered ticker
  const [chartData, setChartData] = useState(null);   // chart data
  const [indicator, setIndicator] = useState("none"); // selected indicator
  const [isDark, setIsDark] = useState(false);
  const indicators = ["none", "SMA"]; // can add more later



  const fetchStock = async () => {
    if (!ticker) return;
    if (ticker.length <= 1 || ticker.length > 5) {
      alert("Ticker length must be between 2 and 5 characters.");
      return;
    }

    try {
    console.log('Fetching ticker:', ticker);
      const res = await fetch(`http://127.0.0.1:8000/stock/${ticker}`);
      const data = await res.json();

      let prices = data.prices;

      // Simple moving average example
      if (indicator === "SMA") {
        const window = 3;
        prices = prices.map((_, i, arr) => {
          if (i < window - 1) return null;
          const sum = arr.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
          return sum / window;
        });
      }

      setChartData({
        labels: data.dates,
        datasets: [
          {
            label: `${data.ticker} Price`,
            data: data.prices,
            borderColor: "blue",
            fill: false,
          },
          indicator !== "none"
            ? {
                label: `${data.ticker} ${indicator}`,
                data: prices,
                borderColor: "orange",
                fill: false,
              }
            : null,
        ].filter(Boolean),
      });
    } catch (err) {
      console.error("Failed to fetch stock:", err);
      alert("Failed to fetch stock data. Make sure the ticker exists!");
    }
  };


  return (
    <main className="App">
      <header className="app-header">
        <div className="left-section">
          <div className="logo-section">
            <h1 className="app-logo">Placeholder</h1>
            <p className="app-subtitle">Stock Analysis</p>
          </div>
          <nav className="main-nav">
            <button className="nav-link">Charts</button>
            <button className="nav-link">Screener</button>
            <button className="nav-link">News</button>
            <button className="nav-link">Github</button>
          </nav>
        </div>
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
      </header>

      <section className="card">
        <div className="form-group">
          <TickerInput
          ticker = {ticker}
          setTicker = {setTicker}
          onFetch = {fetchStock}
          indicator = {indicator}
          setIndicator = {setIndicator}
          indicators = {indicators}
          />
        </div>
      </section>

      {/* TradingView Candlestick Chart */}
      <section className="chart-wrapper">
        <TradingViewChart data={chartData}/>
      </section>

      <Footer />
    </main>
  );
}

export default App;