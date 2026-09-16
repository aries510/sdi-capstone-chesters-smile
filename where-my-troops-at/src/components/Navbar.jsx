import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../bg-images/WMTA.png';

const links = [
  { to: '/GeneralUser', label: 'My Info' },
  { to: '/Admin', label: 'Admin Dashboard' },
  { to: '/Evaluator', label: 'Evaluator Dashboard' },
  { to: '/MPC', label: 'MPC Dashboard' },
];

const pages = [
  { header: 'Admin Home', url: '/admin' },
  { header: 'General User', url: '/generaluser' },
  { header: 'MPC', url: '/mpc' },
];

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const currentPage = pages.find(
    (page) => page.url.toLowerCase() === pathname.toLowerCase(),
  );

  const logoff = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    document.body.classList.toggle('dark-theme', darkMode);
  }, [darkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (pathname === '/') {
    return null;
  } else {
    return (
      <nav className="navbar">
        <div className="title">
          <img src={logo} alt="Space Force Logo" className="navbar-logo" />
          <div className="wmta-brand-title">WHERE MY TROOPS AT</div>
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
          <div className="menu-wrapper" ref={menuRef}>
            <button
              className="hamburger-icon"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>

            {menuOpen && (
              <div className="menu-dropdown">
                <div className="menu-dropdown-links">
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
                </div>
                <button
                  className="navbar-theme-btn"
                  onClick={() => setDarkMode((mode) => !mode)}
                >
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button className="navbar-theme-btn" onClick={() => logoff()}>
                  Logoff
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }
}
