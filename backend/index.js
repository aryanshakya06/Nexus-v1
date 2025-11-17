import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import connectDB from './config/db.js';
import userRoutes from './routes/user.js'
import { createClient } from 'redis';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

await connectDB();

const redisUrl = process.env.REDIS_URL;
if(!redisUrl) {
    console.log("Missing redis url");
    process.exit(1);     
}

export const redisClient = createClient({
    url: redisUrl
});

redisClient
    .connect()
    .then(() => console.log("Redis Connected"))
    .catch(console.error)

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"]
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/v1", userRoutes);
app.use("/api/v1", projectRoutes);
app.use("/api/v1", adminRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})