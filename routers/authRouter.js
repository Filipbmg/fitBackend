import { Router } from "express";
import { db } from "../database/connection.js"
import bcrypt from "bcrypt";
import createError from "http-errors";

const router = Router();

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [user] = await db.execute('SELECT id, email, password FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            throw createError(404, "Bruger ikke fundet");
        }
        
        const userData = user[0];
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            throw createError(401, "Ugyldig information");
        }

        req.session.user = {
            id: userData.id,
            email: userData.email,
        }

        res.status(200).send({ message: "Login Succes"});
    } catch (err) {
        next(err);
    }
});

router.post('/signup', async (req, res, next) => {
    const { email, password } = req.body;
    if ( !email || !password ) {
        return res.status(400).send({ error: 'Manglende fælter' });
    }

    try {
        const [user] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (user.length > 0) {
            throw createError(409, "Ugyldig email");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await db.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword])
        if (result[0].affectedRows === 0) {
            throw createError(500, "Brugeroprettelse fejlede");
        }

        return res.status(201).send({ message: "Bruger oprettet"});
    } catch (err) {
        next(err)
    }
});

router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        } else {
            res.clearCookie("user_sid");
            res.status(200).send({ message: "Logout succes" });
        }
    });
});

router.get('/auth/status', (req, res) => {
    if (req.session.user) {
        res.status(200).send({ isAuthenticated: true })
    } else {
        res.status(200).send({ isAuthenticated: false })
    }
})


export default router;