// Home.jsx

import { useAuthContext } from "../../hooks/useAuthContext";

// import components
import ExpiringList from "./ExpiringList";
import QuantityLowList from "./QuantityLowList";
import OverallSalesMetrics from "./OverallSalesMetrics";

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
      </div>
    </>
  );
}
