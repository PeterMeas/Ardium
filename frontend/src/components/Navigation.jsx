import { NavLink } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="main-nav">
      <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">Charts</NavLink>
      <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/screener">Screener</NavLink>
      <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/news">News</NavLink>
      <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/watchlist">Watchlist</NavLink>
      <button
        className="nav-link"
        onClick={() => window.open('https://github.com/PeterMeas/Ardium', '_blank', 'noopener,noreferrer')}
      >
        Github
      </button>
    </nav>
  );
}
