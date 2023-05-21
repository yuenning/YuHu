import { Link } from "react-router-dom";
import logo from ".//NavbarLogo.png";

// styles
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li className={styles.title}>
          <img src={logo} alt="Logo" className={styles.logo} />
        </li>

        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
}
