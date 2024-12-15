import express from "express";
import { globalErrorHandler } from "./middleware/errorHandlers";

const app = express();

app.use(globalErrorHandler);


app.all("*", (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl}`);
    err.status = 404;

    next(err);
});