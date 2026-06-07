import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const preloadMap = () => {
    void import("./CampusMap");
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" onClick={closeMenu}>
          <img
            src="https://i.ibb.co/WpgVhhQ/Brown-University-Seal.png"
            alt="Brown University seal"
            className="navbar__logo"
          />
          <div>
            <span className="navbar__title">Brown Housing Lottery Demystified</span>
            <span className="navbar__subtitle">Find your next dorm with confidence</span>
          </div>
        </NavLink>

        <button
          type="button"
          className="navbar__menu-btn"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="navbar__menu-icon" aria-hidden="true" />
        </button>

        <nav
          id="main-nav"
          className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/listings" onClick={closeMenu}>
            Listings
          </NavLink>
          <NavLink to="/map" onClick={closeMenu} onMouseEnter={preloadMap} onFocus={preloadMap}>
            Campus Map
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
