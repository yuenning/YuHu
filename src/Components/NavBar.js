import { Link } from "react-router-dom";

// styles
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li className={styles.title}>YuHu</li>

        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
}
