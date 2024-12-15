export function globalErrorHandler(err, req, res, next) {
    if (!err.status) {
        res.status(500).send("Unidentified error");
    }
    res.status(err.status).send(error.message); 
}