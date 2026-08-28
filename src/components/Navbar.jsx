import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/interview", label: "Interview Coach" },
  { to: "/resumes", label: "Resume Analysis" },
  { to: "/suggestions", label: "Career Guidance" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
      <span className="theme-toggle-track"><span className="theme-toggle-thumb">{theme === "light" ? "L" : "D"}</span></span>
      <span>{theme === "light" ? "Light" : "Dark"}</span>
    </button>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!user) {
    return (
      <nav className="navbar public-navbar">
        <Link to="/" className="brand-mark"><span>CareerLife</span></Link>
        <div className="public-nav-links">
          <Link to="/docs">API Documentation</Link>
          <ThemeToggle />
          <Link className="nav-action" to="/login">Sign in</Link>
          <Link className="nav-action primary" to="/register">Get started</Link>
        </div>
      </nav>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/dashboard" className="brand-mark"><span>CareerLife</span></Link>
          <div className="navbar-links navbar-links-desktop">
            {LINKS.map((link) => <NavLink key={link.to} to={link.to}>{link.label}</NavLink>)}
            <NavLink to="/docs">API Docs</NavLink>
          </div>
        </div>
        <div className="navbar-user">
          <ThemeToggle />
          <div className="navbar-avatar">{initial}</div>
          <span>{user.name}</span>
          <button className="secondary" onClick={handleLogout}>Sign out</button>
          <button className="navbar-toggle" onClick={() => setOpen(true)} aria-label="Open menu">Menu</button>
        </div>
      </nav>
      <div className={`nav-overlay${open ? " show" : ""}`} onClick={() => setOpen(false)} />
      <div className={`nav-drawer${open ? " open" : ""}`}>
        <div className="nav-drawer-head">
          <div className="navbar-avatar">{initial}</div>
          <div><strong>{user.name}</strong><div className="muted">{user.email}</div></div>
          <button className="nav-drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">Close</button>
        </div>
        <ThemeToggle />
        <div className="nav-drawer-links">
          {LINKS.map((link) => <NavLink key={link.to} to={link.to}>{link.label}</NavLink>)}
          <NavLink to="/docs">API Documentation</NavLink>
        </div>
        <button className="danger" onClick={handleLogout}>Sign out</button>
      </div>
    </>
  );
}
