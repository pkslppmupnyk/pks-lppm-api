import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

//env
import dotenv from "dotenv-flow";
dotenv.config();

//import route
import pksRouter from "./routes/pks.routes.js";

//database
import connectDB from "./config/database.js";
connectDB();

const server = express();
server.use(cors());
server.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static & routes

server.get("/api", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "documentation.html"));
});

server.use("/api/pks", pksRouter);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
