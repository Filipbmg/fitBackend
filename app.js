import express from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler } from "./middleware/errorHandlers.js";
import authRouter from "./routers/authRouter.js";
import { db } from "./database/connection.js";

dotenv.config();

const app = express();
app.use(globalErrorHandler);
app.use(cors({
    credentials: true,
    origin: true
}));
app.use(helmet());
app.use(express.json());

const sessionStore = new (MySQLStore(session))({
    createDatabaseTable: true,
    }, db);
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

app.use(authRouter);

app.all("*", (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl}`);
    err.status = 404;

    next(err);
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});