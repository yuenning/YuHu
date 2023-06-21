// Home.jsx

import { useAuthContext } from "../../hooks/useAuthContext";

// import automated alerts
import ExpiringList from "./automatedAlerts/ExpiringList";
import QuantityLowList from "./automatedAlerts/QuantityLowList";

// import overall dashboard
import OverallSalesMetrics from "./overallDashboard/OverallSalesMetrics";
import OverallProductAnalysis from "./overallDashboard/OverallProductsAnalysis";

// import monthly dashboard
import MonthlySalesMetrics from "./monthlyDashboard/MonthlySalesMetrics";
import MonthlyProductAnalysis from "./monthlyDashboard/MonthlyProductsAnalysis";

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
        <OverallSalesMetrics />
        <OverallProductAnalysis />
      </div>
      <div className={styles.listContainer}>
        <MonthlySalesMetrics />
        <MonthlyProductAnalysis />
        <br></br>
        <br></br>
      </div>
    </>
  );
}
