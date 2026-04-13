// 1. We import the routing tools from the react-router-dom library
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";

function App() {
  // 2. We grab the token from global state to check if the user is logged in
  const { token } = useContext(AuthContext);

  return (
    // 3. BrowserRouter is a wrapper that enables all routing features in the app
    <BrowserRouter>
      <Routes>
        
        {/* The Login Route */}
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />

        <Route path="/dashboard" element={!token ? <Navigate to="/login" /> : <Dashboard />} />

        {/* The Catch-all Route (if they go to '/' or a random page, send them to login) */}
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;