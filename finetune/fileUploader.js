import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env"
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function uploadFile() {
  const file = await openai.files.create({
    file: fs.createReadStream("training_data.jsonl"),
    purpose: "fine-tune",
  });

  console.log(file);
}

uploadFile();