import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Footer from "./components/Footer.jsx";
import Navigation from "./components/Navigation.jsx";

import ChartsPage from "./pages/ChartsPage.jsx";
import ScreenerPage from "./pages/ScreenerPage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <Router>
      <main className="App">
        <header className="app-header">
          <div className="left-section">
            <div className="logo-section">
              <h1 className="app-logo">Ardium</h1>
              <p className="app-subtitle">Stock Analysis</p>
            </div>
            <Navigation />
          </div>
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </header>

        <Routes>
          <Route path="/" element={<ChartsPage />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>

        <Footer />
      </main>
    </Router>
  );
}

export default App;