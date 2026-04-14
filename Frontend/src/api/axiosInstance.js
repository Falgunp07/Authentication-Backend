import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api/auth',
    withCredentials: true, 
});

axiosInstance.interceptors.request.use(
    (config) => {
        // 1. Grab the token that we saved during Login
        const token = localStorage.getItem("token");
        
        // 2. If it exists, attach it to the "Authorization" header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
    (response) => {
        // If the request succeeds normally, just pass it through
        return response;
    },
    async (error) => {
        // Grab the original request that just crashed
        const originalRequest = error.config;

        // If the error is a 401 Unauthorized AND we haven't retried this specific request yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Mark this request as "retrying" so we don't accidentally create an infinite loop
            originalRequest._retry = true;

            try {
                // 1. Ask the backend for a new access token
                // NOTE: We use standard 'axios' here instead of 'axiosInstance' to avoid infinite loops
                const res = await axios.get('http://localhost:3000/api/auth/refresh-token', {
                    withCredentials: true // This securely sends our HTTP-only Refresh Cookie
                });

                // 2. Grab the fresh token the backend sent us
                const newToken = res.data.token;

                // 3. Save it to the browser's local storage
                localStorage.setItem("token", newToken);

                // 4. Update the failed request's Authorization header with the new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // 5. Instantly replay the original failed request!
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                // If the Refresh Token itself is expired or invalid, we must fully kick the user out.
                console.error("Refresh token expired. Please log in again.");
                localStorage.removeItem("token");
                window.location.href = '/login'; // Force the browser to back to the login page
                return Promise.reject(refreshError);
            }
        }
        
        // If it was a different error (like 404 or 500), just throw the error normally
        return Promise.reject(error);
    }
);

export default axiosInstance;