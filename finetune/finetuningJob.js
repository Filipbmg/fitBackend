import OpenAI from "openai";
import dotenv from "dotenv"

dotenv.config({
    path: "../.env"
})

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const job = await openai.fineTuning.jobs.create({
  training_file: "file-8kaP3ahbZkKvAtCUoJCxvA",
  model: "gpt-4o-2024-08-06",
  method: {
    type: "supervised",
  },
});