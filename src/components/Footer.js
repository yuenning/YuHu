import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer>
      <footer className={styles["footer"]}>
      &copy; {new Date().getFullYear()} YuHu. All rights reserved.
      </footer>
    </footer>
  );
}
