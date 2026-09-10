import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from './bg-images/spaceforcelogo.png';

const links = [
  { to: '/Admin', label: 'Admin Dashboard' },
  { to: '/Evaluator', label: 'Evaluator Dashboard' },
  { to: '/MPC', label: 'MPC Dashboard' },
];

const pages = [
  { header: 'Admin Home', url: '/admin' },
  { header: 'General User', url: '/generaluser' },
  { header: 'MPC', url: '/mpc' },
];

function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const { pathname } = useLocation();

  const currentPage = pages.find(
    (page) => page.url.toLowerCase() === pathname.toLowerCase(),
  );

  useEffect(() => {
    document.body.classList.toggle('dark-theme', darkMode);
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="title">
        <img src={logo} alt="Space Force Logo" className="navbar-logo" />
        <span>Where My Troops At</span>
      </div>

      {/* {currentPage && (
        <span className="navbar-page-name">{currentPage.header}</span>
      )} */}

      <div className="navbar-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}

        <button
          onClick={() => setDarkMode((mode) => !mode)}
          className="navbar-theme-btn"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
