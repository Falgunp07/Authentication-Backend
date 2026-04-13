import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

export default function Dashboard() {
  // We grab the logoutUser function from our Global Memory so we can add a logout button!
  const { logoutUser } = useContext(AuthContext);
  
  // 1. Create a state memory to hold our list of devices
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 2. useEffect will run exactly ONCE when this Dashboard component first appears on the screen
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Send a GET request to http://localhost:3000/api/auth/sessions
        const response = await axiosInstance.get("/sessions");
        
        // Save the array of devices into our React memory
        setSessions(response.data.data || response.data);
        setLoading(false); // Stop showing the loading message
      } catch (err) {
        console.error("Failed to load sessions:", err);
        setError("Could not load your active devices.");
        setLoading(false);
      }
    };

    fetchSessions(); // Automatically call our function when the page loads
  }, []); // The empty array [] means "only run this once when the screen loads"

  // 3. Keep a function here to manually revoke a single session (remote logout)
  const handleRevokeSession = async (sessionId) => {
    try {
      await axiosInstance.delete(`/sessions/${sessionId}`);
      // If successful, ask React to filter out the deleted session from our current list
      setSessions((prevSessions) => prevSessions.filter(session => session._id !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session", err);
      alert("Failed to sign out of that device.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Your Active Devices</h1>
          
          <button 
            onClick={logoutUser} 
            className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mt-6">
          {/* Conditional Rendering: Show loading, error, or the list of devices */}
          {loading ? (
            <p className="text-gray-600">Loading your devices...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              {/* Loop through each session and draw a card for it */}
              {sessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between rounded-md border p-4 shadow-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {session.device || "Unknown Device"} 
                      {session.isCurrent && <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs text-green-700">This Device</span>}
                    </h3>
                    <p className="text-sm text-gray-500">{session.os}</p>
                    <p className="text-xs text-gray-400">IP: {session.ip}</p>
                  </div>
                  
                  {/* Don't show the delete button on the current device (users should use the main logout button for that) */}
                  {!session.isCurrent && (
                    <button 
                      onClick={() => handleRevokeSession(session._id)}
                      className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline"
                    >
                      Revoke Access
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}