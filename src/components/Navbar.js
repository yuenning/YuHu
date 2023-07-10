import React, { useRef, useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import logo from "./NavbarLogo.png";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const location = useLocation();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isIconClicked, setIsIconClicked] = useState(true);
  const [isIconFirstClicked, setIsIconFirstClicked] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const navbarRef = useRef(null);

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const toggleClick = () => {
    setIsIconClicked(!isIconClicked);
  };

  const toggleFirstClick = () => {
    setIsIconFirstClicked(false);
  };

  const handleToggleNavbarClick = () => {
    toggleNavbar();
    toggleClick();
    toggleFirstClick();
  };

  const smoothScrollTo = (targetId) => {
    const targetElement = document.getElementById(targetId);
    targetElement.scrollIntoView({ behavior: "smooth" });
    if (window.innerWidth <= 768) {
      toggleNavbar();
    }
  };

  const shouldRenderNavigation = location.pathname === "/introduction";

  const navRef = useRef();

  const handleNavOptionClick = () => {
    if (window.innerWidth <= 768) {
      setIsNavbarOpen(false);
      setIsIconClicked(true);
      setIsIconFirstClicked(true);
    }
  };

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth > 768) {
        setIsNavbarOpen(false);
        setIsIconClicked(true);
        setIsIconFirstClicked(true);
      }
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll <= 0) {
        navbarRef.current.style.transform = "translateY(0)";
        navbarRef.current.style.filter = "";
      } else if (currentScroll > lastScroll) {
        navbarRef.current.style.transform = "translateY(-100%)";
        navbarRef.current.style.filter = "";
      } else {
        navbarRef.current.style.transform = "translateY(0)";
        navbarRef.current.style.filter = "drop-shadow(0 -10px 20px rgb(170, 170, 170)";
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScroll]);

  return (
    <nav ref={navbarRef} className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.title}>
          <Link to="/">
            <img src={logo} alt="Logo" className={styles.logo} />
          </Link>
        </div>
        <div
          ref={navRef}
          className={`${styles.links} ${
            isNavbarOpen ? styles.responsiveNav : ""
          } ${isIconClicked && !isIconFirstClicked ? styles.iconClicked : ""}`}
        >
          {shouldRenderNavigation && (
            <>
              <button
                className={styles["scroll-link"]}
                onClick={() => smoothScrollTo("home")}
              >
                <Link to="/" onClick={handleNavOptionClick}>
                  Home
                </Link>
              </button>
              <button
                className={styles["scroll-link"]}
                onClick={() => smoothScrollTo("about")}
              >
                <Link to="/" onClick={handleNavOptionClick}>
                  About Us
                </Link>
              </button>
              <button
                className={styles["scroll-link"]}
                onClick={() => smoothScrollTo("features")}
              >
                <Link to="/" onClick={handleNavOptionClick}>
                  Features
                </Link>
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" onClick={handleNavOptionClick}>
                Login
              </Link>
              <Link to="/signup" onClick={handleNavOptionClick}>
                Sign Up
              </Link>
            </>
          )}
          {user && (
            <>
              <Link to="/inventory" onClick={handleNavOptionClick}>
                Inventory
              </Link>
              <Link to="/history" onClick={handleNavOptionClick}>
                History
              </Link>
              <Link to="/forms" onClick={handleNavOptionClick}>
                Forms
              </Link>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          )}
          <button
            className={`${styles["nav-btn"]} ${styles["nav-close-btn"]}`}
            onClick={handleToggleNavbarClick}
          >
            <FaTimes />
          </button>
        </div>
        <button className={styles["nav-btn"]} onClick={handleToggleNavbarClick}>
          <FaBars />
        </button>
      </div>
    </nav>
  );
}
