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
          <h1>About Us</h1>
          <p>
            At YuHu, our aim is to empower small businesses with a comprehensive 
            digital solution that transforms their stock-taking process and optimizes 
            inventory management. Our user-friendly web application streamlines inventory 
            tasks, saving valuable time and effort for small business owners. With advanced 
            analytics and automated alerts, we provide valuable insights into inventory 
            performance, enabling informed decision-making to reduce costs and increase 
            profitability. We understand the challenges faced by small businesses in accessing 
            affordable and intuitive inventory management tools, which is why our solution is 
            specifically designed to cater to their unique needs and budgets. At YuHu, we are 
            committed to helping small businesses thrive and succeed by providing them with the 
            tools they need to optimize their inventory management processes.
          </p>
        </section>

        {/* Features Section */}
        <section id="features" className={styles["features"]}>
          <h1>Features</h1>
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
