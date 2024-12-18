import createError from "http-errors";

export default function isAuthenticated(req, res, next) {
    if (req.sessions.user) {
        return next();
    }
    throw createError(401, "Uautoriseret bruger");
}