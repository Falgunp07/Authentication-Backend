# 🔐 Enterprise-Grade Authentication System

A robust, full-stack authentication and session management architecture built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS. 

This project demonstrates production-ready security practices, including multi-factor email verification, silent JWT refreshes, and advanced active device management.

## ✨ Key Features

* **Advanced JWT Authentication:** Implements short-lived Access Tokens and highly secure, HTTP-Only Refresh Cookies to protect user identity against XSS attacks.
* **Active Device Management:** Netflix-style dashboard that tracks active sessions across devices (parsing User-Agent & IP data), allowing users to instantly and remotely revoke unauthorized access.
* **Silent Token Refresh:** Custom Axios response interceptors seamlessly catch `401 Unauthorized` errors and securely refresh expiring tokens in the background without interrupting the user experience.
* **Multi-Factor OTP Verification:** Integrates Nodemailer with Google OAuth2 to send 6-digit One-Time Passwords for secure email verification during user registration.
* **Automated Database Maintenance:** Utilizes `node-cron` background jobs to autonomously purge expired OTPs and revoked sessions from the database.
* **Robust Security Measures:** Fortified with `express-rate-limit` to prevent brute-force attacks, and Crypto hashing for secure password storage.

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS v4
* React Router DOM (Protected Routing)
* Axios (Custom Interceptors)
* Context API (Global State)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT)
* Nodemailer & Google OAuth2
* Node-Cron & Express Rate Limit

## 🚀 Getting Started

### Prerequisites
* Node.js installed
* MongoDB connection URI
* Google Cloud Console OAuth2 Credentials (for Nodemailer)

### Backend Setup
1. Navigate to the backend directory: `cd Backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   EMAIL_USER=your_email@gmail.com
   CLIENT_ID=your_google_client_id
   CLIENT_SECRET=your_google_client_secret
   REFRESH_TOKEN=your_google_oauth_refresh_token
   ```
4. Start the backend server: `npm run server` (runs on `http://localhost:3000`)

### Frontend Setup
1. Navigate to the frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev` (runs on `http://localhost:5173`)

## 🛣️ API Endpoints

* `POST /api/auth/register` - Create a new user account
* `POST /api/auth/verify-email` - Verify account via 6-digit OTP
* `POST /api/auth/login` - Authenticate user & issue JWT/Refresh Cookie
* `GET /api/auth/get-me` - Fetch current authenticated user profile
* `GET /api/auth/refresh-token` - Issue new Access Token via valid Cookie
* `GET /api/auth/sessions` - Retrieve all active devices/sessions
* `DELETE /api/auth/sessions/:sessionId` - Revoke a specific active session
* `GET /api/auth/logout` - Revoke current session and clear cookies

## 👨‍💻 Developer Notes
This project was designed specifically to showcase enterprise security standards and optimized UX flows, moving beyond basic local storage authentication protocols.
