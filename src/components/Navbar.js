import logo from ".//NavbarLogo.png";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";

// styles
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { logout } = useLogout();
  const { user } = useAuthContext();

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
          {!user && (
            <>
              {/* Rendering a link to the login page */}
              <Link to="/login">Login</Link>
              {/* Rendering a link to the signup page */}
              <Link to="/signup">Sign Up</Link>
            </>
          )}
          {user && (
            <button className="btn" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}  