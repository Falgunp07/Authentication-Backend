// 1. We import the routing tools from the react-router-dom library
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  // 2. We grab the token from global state to check if the user is logged in
  const { token } = useContext(AuthContext);

  return (
    // 3. BrowserRouter is a wrapper that enables all routing features in the app
    <BrowserRouter>
      {/* 4. Routes acts like a switchboard. It looks at the URL and decides which Route to render */}
      <Routes>
        
        {/* The Login Route */}
        <Route 
          path="/login" 
          // If they already have a token, kick them to the dashboard! Otherwise, show Login.
          element={token ? <Navigate to="/dashboard" /> : <Login />} 
        />

        {/* The Dashboard Route (Protected) */}
        <Route 
          path="/dashboard" 
          // If they DON'T have a token, kick them back to login! Otherwise, show the Dashboard.
          element={!token ? <Navigate to="/login" /> : <Dashboard />} 
        />

        {/* The Catch-all Route (if they go to '/' or a random page, send them to login) */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;