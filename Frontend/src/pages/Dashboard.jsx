import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

// Helper function to extract browser and OS from the raw User-Agent string
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: "Unknown Browser", os: "Unknown OS" };
  
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  // Simple Browser Detection
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";

  // Simple OS Detection
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

  return { browser, os };
};

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
        // CORRECT: This targets the exact 'sessions' array sent by your backend
        setSessions(response.data.sessions);
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
              {sessions.map((session) => {
                // Parse the raw userAgent string into friendly readable names
                const { browser, os } = parseUserAgent(session.userAgent);
                
                // Format the completely unreadable backend date into a beautiful, human-readable Date + Time
                const loginDate = new Date(session.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true // Uses standard AM/PM time
                });

                // The IP Address '::1' simply means "Localhost" in IPv6 format. We hide it locally to keep it clean.
                const displayIp = (session.ip === "::1" || session.ip === "127.0.0.1") ? "Localhost" : session.ip;

                return (
                  <div key={session._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-md border p-5 shadow-sm bg-gray-50 mb-4 hover:shadow-md transition-shadow">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {browser} <span className="font-normal text-gray-500">on</span> {os}
                        </h3>
                        {session.isCurrent && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex flex-col sm:block space-y-1 sm:space-y-0 sm:space-x-4">
                        <span className="inline-flex items-center">
                          <span className="font-medium mr-1">Location:</span> {displayIp}
                        </span>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <span className="inline-flex items-center">
                          <span className="font-medium mr-1">Logged in:</span> {loginDate}
                        </span>
                      </div>
                    </div>
                    
                    {/* Don't show the delete button on the current device */}
                    {!session.isCurrent && (
                      <button 
                        onClick={() => handleRevokeSession(session._id)}
                        className="rounded border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}