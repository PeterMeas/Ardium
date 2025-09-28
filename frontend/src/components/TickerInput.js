// TickerInput.js - Handles just the ticker input and fetch button
import "./TickerInput.css";

function TickerInput({ ticker, setTicker, onFetch, indicator, setIndicator, indicators }) {
  // TODO
  // 1. Create a form that calls onFetch when submitted
  // 2. Include an input that uses ticker/setTicker
  // 3. Add a submit button
const handleSubmit = (e) => {
    e.preventDefault();
    onFetch();
}

  return (
    <div>
      <form className = "form" onSubmit={ handleSubmit}>
    <input 
    value={ticker} 
    onChange={(e) => setTicker(e.target.value)}
    placeholder= "Enter ticker (AAPL, TSLA, etc.)"
    className = "input"
    />
    <select
        value = {indicator}
        onChange = {(e) => setIndicator(e.target.value)}
        className = "select"
        >
        {indicators.map((ind) => ( 
            <option key = {ind} value={ind}>
                {ind === "none" ? "None" : ind + " (3-day)"}
            </option>
        ))}
    </select>
    <button type="submit" className = "button">
    Fetch 
    </button>
      </form>
    </div>
  );
}

export default TickerInput;
