import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// pages & components
import Introduction from "./pages/introduction/Introduction";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const { authIsReady, user } = useAuthContext();

  return (
    <div className="App">
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
