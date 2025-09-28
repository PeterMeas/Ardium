import "./App.css";
import TickerInput from "./components/TickerInput";
import ThemeToggle from "./components/ThemeToggle";
import TradingViewChart from "./components/TradingViewChart";
import { useState } from "react";

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
      const stockData = await res.json();

      // Set the chart data (TradingView format)
      setChartData(stockData);

    } catch (err) {
      console.error("Failed to fetch stock:", err);
      alert("Failed to fetch stock data. Make sure the ticker exists!");
    }
  };


  return (
    <main className="App">
      <header className="app-header">
        <h1>Ardium</h1>
        <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        <p className="subtitle"></p>
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

      {chartData && (
        <section className="chart-wrapper">
          <TradingViewChart data={chartData} isDark={isDark} />
        </section>
      )}
    </main>
  );
}

export default App;