import { createContext, useState, useEffect } from "react";

// 1. createContext: This creates the actual "Global Memory Box".
// We put 'null' as the starting shape, but React will quickly replace it with our state.
export const AuthContext = createContext(null);

// 2. AuthProvider Component: 
// This is a special wrapper component. We will wrap our whole App.jsx inside of it. 
// Any children inside it will have access to the data we pass down via 'value={{...}}'
export function AuthProvider({ children }) {
    
    // We are storing ONE thing right now: Does the user have a token?
    // We look inside localStorage right away. If a token exists from a previous visit, we grab it so they stay logged in!
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // 3. A helper function to easily update BOTH the state and localStorage at the same time
    const loginUser = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    // 4. A helper function to cleanly log out
    const logoutUser = async () => {
    try {
        // 2. Tell the backend to destroy the Refresh Token cookie and revoke the DB session
        await axiosInstance.get("/logout");
    } catch (error) {
        console.error("Backend logout failed, but we will still clear the frontend:", error);
    } finally {
        // 3. Whether the backend succeeds or fails, ALWAYS wipe the local memory
        localStorage.removeItem("token");
        setToken(null);
    }
};

    // 5. The return statement: 
    // This provides the 'token', 'loginUser', and 'logoutUser' functions to ANY child component in the app that asks for it.
    return (
        <AuthContext.Provider value={{ token, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}