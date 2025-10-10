import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

//env
import dotenv from "dotenv-flow";
dotenv.config();

//import route
import pksRouter from "./routes/pks.routes.js";
import authRouter from "./routes/auth.routes.js";

//database
import connectDB from "./config/database.js";
connectDB();

const server = express();

const allowedOrigins = [
  'https://pkslppmupnyk.io',      // Domain frontend utama Anda
  'https://www.pkslppmupnyk.io', // Varian dengan www
  'http://localhost:3000',      // Port umum untuk React dev
  'http://localhost:5173'       // Port umum untuk Vite dev
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan jika request berasal dari salah satu origin di atas,
    // atau jika request tidak memiliki 'origin' (misalnya dari Postman atau server-ke-server)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Akses diblokir oleh kebijakan CORS'));
    }
  }
};


server.use(cors(corsOptions));
server.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static & routes

// STATIC FILES - Serve seluruh folder public
server.use("/api/css", express.static(path.join(__dirname, "public/css")));
server.use("/api/js", express.static(path.join(__dirname, "public/js")));

//  halaman dokumentasi
server.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "documentation.html"));
});

//  halaman testing
server.use("/api/test", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload_test.html"));
});

//  routes Auth
server.use("/api/auth", authRouter);

//  routes PKS dan File Upload
server.use("/api/pks", pksRouter);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
