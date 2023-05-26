import styles from "./Footer.module.css";

export default function Footer() {
  document.addEventListener("DOMContentLoaded", function() {
    const footer = document.getElementById("footer");
  
    function checkFooterVisibility() {
      const contentHeight = document.querySelector(".content").offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.pageYOffset;
  
      if (contentHeight - viewportHeight <= scrollPosition) {
        footer.classList.add("show");
      } else {
        footer.classList.remove("show");
      }
    }
  
    window.addEventListener("scroll", checkFooterVisibility);
  });  

  return (
    <footer className={styles["footer"]}>
      &copy; {new Date().getFullYear()} YuHu. All rights reserved.
    </footer>
  );
}
