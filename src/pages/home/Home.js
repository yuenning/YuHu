// Home.jsx

import { useAuthContext } from "../../hooks/useAuthContext";

// import automated alerts
import ExpiringList from "./automatedAlerts/ExpiringList";
import QuantityLowList from "./automatedAlerts/QuantityLowList";

// import overall dashboard
import OverallDashboard from "./overallDashboard/OverallDashboard";

// import monthly dashboard
import MonthlyDashboard from "./monthlyDashboard/MonthlyDashboard";

// styles
import styles from "./Home.module.css";

export default function Home() {
  const { user } = useAuthContext();

  return (
    <>
      <div className={styles.home}>
        <h1>Welcome back, {user.displayName}</h1>
      </div>
      <div className={styles.listContainer}>
        <ExpiringList />
      </div>
      <div className={styles.listContainer}>
        <QuantityLowList />
        <br></br>
        <br></br>
      </div>
      <div className={styles.metricsContainer}>
        <OverallDashboard />
      </div>
      <div className={styles.listContainer}>
        <MonthlyDashboard />
        <br></br>
        <br></br>
        <br></br>
      </div>
    </>
  );
}
