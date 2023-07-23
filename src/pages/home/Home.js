import { useState } from "react";
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

  const SwitchButton = () => {
    const [isOverallDashboard, setOverallDashboard] = useState(true);

    const handleClickOverall = () => {
      setOverallDashboard(true);
    };

    const handleClickCustom = () => {
      setOverallDashboard(false);
    };

    return (
      <div className={styles.container}>
        <div className={styles.buttonContainer}>
          <div className={styles.toggleButton}>
            <div
              className={`${styles.toggleOption} ${
                isOverallDashboard ? styles.active : ""
              }`}
              onClick={handleClickOverall}
            >
              Overall Dashboard
            </div>
            <div
              className={`${styles.toggleOption} ${
                !isOverallDashboard ? styles.active : ""
              }`}
              onClick={handleClickCustom}
            >
              Custom Dashboard
            </div>
          </div>
        </div>
        <br />
        <div className={styles.sidebar}>
          {isOverallDashboard ? <OverallDashboard /> : <MonthlyDashboard />}
        </div>
      </div>
    );
  };

  return (
    <>
      <br></br>
      <br></br>
      <br></br>
      <br></br>

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
        <SwitchButton />
      </div>
      <br></br>
      <br></br>
      <br></br>
    </>
  );
}
