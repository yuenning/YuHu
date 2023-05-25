import styles from "./Introduction.module.css";
import React from 'react';
// import { useLocation } from 'react-router-dom';

class InventoryApp extends React.Component {

  componentDidMount() {
    const scrollLinks = document.querySelectorAll('.scroll-link');

    scrollLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        targetElement.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  render() {
    return (
      <div>
        {/* Landing Page Animation */}
        <section id="home" className={styles["animation"]}>
          <div className={styles["landingText"]}>
            <h1>Welcome to YUHU!!</h1>
            <p>the yoo-hoo to your inventory boo-hoo</p>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className={styles["about-us"]}>
          <h2>About Us</h2>
          <p>
            At Yuhu, we are dedicated to empowering small businesses through our comprehensive digital solution that revolutionizes their stock-taking process and optimizes inventory management. Our aim is to provide small business owners with a user-friendly web application that streamlines inventory management tasks, saving them valuable time and effort.
          </p>
          <p>
            We are driven by the motivation to bridge the gap in the market, where existing inventory management applications are often expensive and cater primarily to larger enterprises. This leaves small businesses at a disadvantage, unable to access affordable and user-friendly tools to optimize their inventory processes.
          </p>
          <p>
            Our solution is specifically designed for small businesses, offering a cost-efficient and intuitive web application that meets their unique needs and budgets. We focus on simplicity and ease of use, ensuring that our platform requires minimal training and technical expertise. Small business owners and their employees can quickly adapt to and utilize our platform effectively, without any barriers hindering their success.
          </p>
          <p>
            With advanced analytics and automated alerts, our web application provides valuable insights into inventory performance, enabling informed decision-making to reduce costs and increase profitability. By improving operational efficiency, minimizing stockouts, and avoiding unnecessary inventory holding costs, our solution helps small businesses stay ahead in their competitive markets.
          </p>
          <p>
            At YuHu, we are committed to empowering small businesses to thrive and succeed by providing them with the tools they need to optimize their inventory management processes.
          </p>
        </section>

        {/* Features Section */}
        <section id="features" className={styles["features"]}>
          <h2>Features</h2>
          <ul>
            <li>Analytics Dashboards</li>
            <li>Inventory Tracking</li>
            <li>Order Management</li>
            <li>Automated Alerts</li>
          </ul>
        </section>

        {/* Additional sections and content can be added here */}
      </div>
    );
  }
}

export default InventoryApp;
