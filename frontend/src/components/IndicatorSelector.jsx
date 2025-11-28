// IndicatorSelector.js - Clickable boxes for indicators (not dropdown)
import "./IndiactorSelector.css";

function IndicatorSelector({ selectedIndicator, setIndicator, indicators }) {
  // TODO
  // 1. Map through indicators array
  // 2. Create a clickable div for each indicator
  // 3. Add different CSS class if indicator is selected
  // 4. Call setIndicator when clicked
  
  return (
    <div className="indicator-selector">
      <h3>Select Indicator:</h3>
      {}
      <p>Hint: Use indicators.map() to create boxes!</p>
      <p>Hint: Use className conditional - is this indicator selected?</p>
    </div>
  );
}

export default IndicatorSelector;
