import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";

// pages and components
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Navbar from "./Components/NavBar";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
