import express from "express";
import session from "express-session";
import MySQLStore from "connect-mysql2";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler } from "./middleware/errorHandlers.js";
import authRouter from "./routers/authRouter.js";

dotenv.config();

const app = express();
app.use(globalErrorHandler);
app.use(cors({
    credentials: true,
    origin: true
}));
app.use(helmet());
app.use(express.json());

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
app.use(session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dage
        httpOnly: true,
        secure: false,
    },
}));

app.use("/login");

app.all("*", (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl}`);
    err.status = 404;

    next(err);
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});