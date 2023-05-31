import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import logo from "./NavbarLogo.png";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const location = useLocation();

  const smoothScrollTo = (targetId) => {
    const targetElement = document.getElementById(targetId);
    targetElement.scrollIntoView({ behavior: "smooth" });
  };

  const shouldRenderNavigation = location.pathname === "/introduction";

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.title}>
          {/* Rendering a link from the logo to the home page */}
          <Link to="/">
            <img src={logo} alt="Logo" className={styles.logo} />
          </Link>
        </div>
        <div className={styles.links}>
          {shouldRenderNavigation && (
            <>
              {/* Navigation Bar */}
              <button
                className={styles["scroll-link"]}
                onClick={() => smoothScrollTo("about")}
              >
                About Us
              </button>
              <button
                className={styles["scroll-link"]}
                onClick={() => smoothScrollTo("features")}
              >
                Features
              </button>
            </>
          )}
          {/* When users have not logged in */}
          {!user && (
            <>
              {/* Rendering a link to the login page */}
              <Link to="/login">Login</Link>
              {/* Rendering a link to the signup page */}
              <Link to="/signup">Sign Up</Link>
            </>
          )}
          {/* When users have logged in */}
          {user && (
            <>
              <p>Welcome back, {user.displayName}</p>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
