import express from 'express'
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";


const app =express()

app.use(cors({
    origin: 'http://localhost:5173', // The URL of your Vite React frontend
    credentials: true // MANDATORY: This allows cookies to be sent back and forth
}));



app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRouter);

export default app;