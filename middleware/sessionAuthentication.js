import createError from "http-errors";

export default function isAuthenticated(req, res, next) {
    if (req.sessions.user) {
        return next();
    } else {
        throw createError(401, "Uauthenticated user");
    }
}