import mongoose from 'mongoose';

export const connectMongoDB = async (): Promise<typeof mongoose> => {
    try {
        const DB_USERNAME = process.env.DB_USERNAME as string;
        const DB_PASSWORD = process.env.DB_PASSWORD as string;

        if (!DB_USERNAME || !DB_PASSWORD) {
            throw new Error("Database credentials are missing in environment variables");
        }

        const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.pb8b2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

        await mongoose.connect(uri);
        console.log("Successfully connected to MongoDB!");

        return mongoose;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export const getDB = (): typeof mongoose => {
    if (!mongoose.connection.readyState) {
        throw new Error("Database connection not established. Call connectMongoDB() first.");
    }
    return mongoose;
};

export const closeMongoDB = async (): Promise<void> => {
    if (mongoose.connection.readyState) {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
    }
};
