import mongoose from "mongoose";

import dotenv from "dotenv-flow";
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected: " + conn.connection.host);
    } catch (e) {
        console.error("error: " + e.message);
        process.exit(1);
    }
};

export default connectDB;