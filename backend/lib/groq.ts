import Groq from "groq-sdk";

const KEYS = [process.env.GROQ_API_KEY_1!, process.env.GROQ_API_KEY_2!];

let currentKeyIndex = 0;

export function getGroqClient() {
  const apiKey = KEYS[currentKeyIndex];

  return new Groq({
    apiKey,
  });
}

export function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % KEYS.length;
}
