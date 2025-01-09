export function globalErrorHandler(err, req, res, next) {
    if (!err.status) {
        res.status(500).send("Unidentificeret fejl");
    } else {
        res.status(err.status).send(err.message);
    } 
}