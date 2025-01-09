import { Router } from "express";
import { db } from "../database/connection.js"
import createError from "http-errors";
import isAuthenticated from "../middleware/sessionAuthentication.js";
import dotenv from "dotenv";
import OpenAI from "openai";
import createExcelFile from "../util/jsonToExcel.js";

dotenv.config({
    path: "../.env"
})

const router = Router();
router.use(isAuthenticated)

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.get('/routine', async (req, res, next) => {
    try {
        const [result] = await db.execute('SELECT routine_data FROM workout_routines WHERE user_id = ?', [req.session.user.id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Ingen træningsplan fundet for brugeren" });
        }

        const routineData = JSON.parse(result[0].routine_data)
        const base64Excel = await createExcelFile(routineData.workoutRoutine);
        if (!base64Excel) {
            throw createError(500, "Fejl under generering af excel fil");
        }
        res.status(200).json({
            advice: routineData.advice,
            excelFile: base64Excel,
        });
    } catch (err) {
        next(err)
    }
})

router.post('/generate-routine', async (req, res, next) => {
    const userInput = `Brugerdata: ${req.body.gender}, ${req.body.age}, ${req.body.goal}, ${req.body.experience}, ${req.body.trainingFreq}`;
    try {
        const response = await openai.chat.completions.create({
            model: "ft:gpt-4o-2024-08-06:fitbot::Amn7uFig",
            messages: [
                { role: "system", content: "Du er en AI-assistent specialiseret i at skabe personlige træningsplaner. Baseret på brugerens input, skal du generere et JSON-objekt med to sektioner: 'workoutRoutine' og 'advice'. Sørg for at følgende krav er opfyldt:\n\n**1. workoutRoutine**:\n- Skal indeholde en liste af objekter, hvor hvert objekt er enten af typen 'day' eller 'exercise'.\n  - **day type**:\n    - **type**: 'day'\n    - **day**: Navnet på dagen (f.eks., 'Dag 1')\n  - **exercise type**:\n    - **type**: 'exercise'\n    - **exerciseName**: Navnet på øvelsen (f.eks., 'Bænkpres')\n    - **sets**: Antal sæt (heltal)\n    - **reps**: Antal gentagelser pr. sæt (heltal)\n    - **rest**: Hviletid mellem sæt (f.eks., '2-3 min')\n\n**2. advice**:\n- Skal indeholde personlige træningsråd til brugeren.\n\n**3. Formatering**:\n- JSON'en skal være korrekt formateret uden syntaksfejl.\n- Undgå brug af kommentarer eller trailing commas.\n- Sørg for, at alle feltnavne er præcise og konsistente."},
                { role: "user", content: userInput },
            ],
            max_tokens: 8000,
            temperature: 0
        })
        if (!response || !response.choices || response.choices.length === 0) {
            throw createError(502, "Fejl i respons fra OpenAI API.");
        }

        const rawContent = response.choices[0].message.content;

        const jsonStartIndex = rawContent.indexOf("{");
        let jsonString = rawContent.substring(jsonStartIndex).trim();
        jsonString = jsonString
            .replace(/```json/g, '')
            .replace(/```/g, '');

        const result = await db.execute('INSERT INTO workout_routines (user_id, routine_data) VALUES (?, ?)', [req.session.user.id, jsonString])
        if (result.affectedRows === 0) {
            throw createError(500, "Fejl under gemning i database");
        }

        let parsedContent = JSON.parse(jsonString);
        const base64Excel = await createExcelFile(parsedContent.workoutRoutine);
        if (!base64Excel) {
            throw createError(500, "Fejl under generering af Excel file");
        }

        res.status(201).json({
            advice: parsedContent.advice,
            excelFile: base64Excel,
        });
    } catch (err) {
        next(err);
    }
});

router.delete('/routine', async (req, res, next) => {
    try {
        const [result] = await db.execute('DELETE FROM workout_routines WHERE user_id = ?', [req.session.user.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Der kunne ikke findes nogen træningsplan som skulle slettes" });
        }
    
        res.status(200).json({ message: "Træningsplan slettet" });
    } catch (err) {
        next(err)
    }
})

export default router;