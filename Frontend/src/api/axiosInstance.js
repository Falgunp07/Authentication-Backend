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

export default axiosInstance;