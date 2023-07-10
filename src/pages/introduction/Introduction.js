import styles from "./Introduction.module.css";
import React from "react";

// import components
import dashboardsIcon from "./dashboards_icon.png";
import trackingIcon from "./tracking_icon.png";
import orderManagementIcon from "./order_management_icon.png";
import alertsIcon from "./alerts_icon.png";
import WarehouseBackground from "./WarehouseBackground.gif";

class InventoryApp extends React.Component {
  componentDidMount() {
    const scrollLinks = document.querySelectorAll(".scroll-link");

    scrollLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        targetElement.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  render() {
    return (
      <div>
        {/* Landing Page Animation */}
        <section
          id="home"
          className={`${styles["animation"]} ${styles["landingSection"]}`}
        >
          <div
            className={styles["landingBackground"]}
            style={{ backgroundImage: `url(${WarehouseBackground})` }}
          ></div>
          <div className={styles["landingText"]}>
            <h1>Welcome to Yuhu</h1>
            <p>the yoo-hoo to your inventory boo-hoo</p>
          </div>
        </section>

        {/* About Us Section */}
        <div className={styles["about-us-box"]}>
          <section id="about" className={styles["about-us"]}>
            <h1>About Us</h1>
            <p>
              At YuHu, we aim to empower small businesses like you with a
              comprehensive digital solution to transform your stock-taking
              process and inventory management. Our user-friendly web
              application streamlines inventory tasks, saving valuable time and
              effort for small business owners like you. With advanced analytics
              and automated alerts, we provide valuable insights into your
              inventory performance, enabling informed decision-making to reduce
              costs and increase profitability for you. We understand the
              challenges faced by small businesses in accessing affordable and
              intuitive inventory management tools, which is why our solution is
              specifically designed to cater to your unique needs and budgets.
              At YuHu, we are committed to helping small businesses thrive and
              succeed by providing them with the tools you need to optimize your
              inventory management processes.
            </p>
          </section>
        </div>

        {/* Features Section */}
        <section id="features" className={styles["features"]}>
          <h1>Features</h1>
          <div className={styles["features-icons"]}>
            <div className={styles["feature"]}>
              <img src={dashboardsIcon} alt="Dashboards" />
              <p>Analytics Dashboards</p>
            </div>
            <div className={styles["feature"]}>
              <img src={trackingIcon} alt="Tracking" />
              <p>Inventory Tracking</p>
            </div>
            <div className={styles["feature"]}>
              <img src={orderManagementIcon} alt="Order Management" />
              <p>Order Management</p>
            </div>
            <div className={styles["feature"]}>
              <img src={alertsIcon} alt="Alerts" />
              <p>Automated Alerts</p>
            </div>
          </div>
        </section>

        {/* Additional sections and content can be added here */}
      </div>
    );
  }
}

export default InventoryApp;
