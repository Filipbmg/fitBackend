import createError from "http-errors";

export default function isAuthenticated(req, res, next) {
    if (req.session.user.id) {
        return next();
    } else {
        next(createError(401, "Uautoriseret bruger"));
    }
}