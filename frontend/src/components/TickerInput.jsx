import { useState, useEffect } from "react";
import { searchTickers } from "../services/api";
import "./TickerInput.css";

function TickerInput({ ticker, setTicker, onFetch, indicator, setIndicator, indicators }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!ticker || ticker.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await searchTickers(ticker, controller.signal);
        const results = data.bestMatches || data || [];
        setSuggestions(results.slice(0, 5));
        setShowDropdown(true);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          // fetch aborted, silently ignore
        } else {
          console.error("Search failed", err);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [ticker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    onFetch();
  };

  const handleSelect = (symbol) => {
    setTicker(symbol);
    setShowDropdown(false);
  };

  return (
    <div className="ticker-search-container">
      <form className="form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <input
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase());
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Enter ticker (AAPL, etc.)"
            className="input"
            autoComplete="off"
          />
          {showDropdown && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((item, idx) => {
                const displaySymbol = item['1. symbol'] || item.symbol || item;
                const displayName = item['2. name'] || item.name || '';
                return (
                  <li 
                    key={idx} 
                    onClick={() => handleSelect(displaySymbol)}
                    className="suggestion-item"
                  >
                    <strong>{displaySymbol}</strong>
                    {displayName && <small className="suggestion-name">{displayName}</small>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <select
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
          className="select"
        >
          {indicators.map((ind) => (
            <option key={ind} value={ind}>
              {ind === "none" ? "None" : ind + " (3-day)"}
            </option>
          ))}
        </select>
        <button type="submit" className="button">
          Fetch
        </button>
      </form>
    </div>
  );
}

export default TickerInput;
