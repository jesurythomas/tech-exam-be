import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongoDB } from "./config/mongodb";
import authRoutes from "./routes/auth.routes";
import contactRoutes from "./routes/contact.routes";
import userRoutes from "./routes/user.routes";
import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config/firebase.config';

dotenv.config();


const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize server and MongoDB connection
(async () => {
    try {
        await connectMongoDB();

        // Routes
        app.use("/api/auth", authRoutes);
        app.use("/api/contacts", contactRoutes);
        app.use("/api/users", userRoutes);

        // Error handling middleware
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error(err.stack);
            res.status(500).json({ error: "Something went wrong!" });
        });

        // Start the server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();

export default app;
