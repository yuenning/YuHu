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
      <ul>
        {!user && (
          <>
            <li className={styles.title}>
              {/* Rendering a link from the logo to the home page */}
              <Link to="/">
                <img src={logo} alt="Logo" className={styles.logo} />
              </Link>
            </li>
            <li>
              {/* Rendering a link to the login page */}
              <Link to="/login">Login</Link>
            </li>
          </>
        )}

        {user && (
          <>
            <li className={styles.title}>
              {/* Rendering a link from the logo to the home page */}
              <Link to="/">
                <img src={logo} alt="Logo" className={styles.logo} />
              </Link>
            </li>
            <li>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
