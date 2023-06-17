import styles from "./App.module.css";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// pages & components
import Introduction from "./pages/introduction/Introduction";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";

// logged-in pages
import Home from "./pages/home/Home";
import Forms from "./pages/forms/Forms";
import History from "./pages/history/History";
import Inventory from "./pages/inventory/Inventory";

// components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const { authIsReady, user } = useAuthContext();

  return (
    <div className={styles["App"]}>
      {authIsReady && (
        <Router>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                user ? <Home /> : <Navigate to="/introduction" replace />
              }
            />
            <Route path="/introduction" element={<Introduction />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/signup"
              element={
                user && user.displayName ? (
                  <Navigate to="/" replace />
                ) : (
                  <Signup />
                )
              }
            />
            <Route
              path="/forms"
              element={
                user && user.displayName ? (
                  <Forms />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/history"
              element={
                user && user.displayName ? (
                  <History />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/inventory"
              element={
                user && user.displayName ? (
                  <Inventory />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Add a catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Router>
      )}
    </div>
  );
}

export default App;
