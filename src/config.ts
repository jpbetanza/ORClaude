import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";
import input from "@inquirer/input";
import chalk from "chalk";

const CONFIG_DIR = resolve(homedir(), ".orclaude");
const CONFIG_PATH = resolve(CONFIG_DIR, "config.json");

interface Config {
  apiKey: string;
}

async function loadConfigFile(): Promise<string | null> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const config: Config = JSON.parse(raw);
    return config.apiKey || null;
  } catch {
    return null;
  }
}

async function validateApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function promptForApiKey(): Promise<string> {
  console.log(
    chalk.yellow("\nNo OpenRouter API key found.")
  );
  console.log(
    chalk.dim("Get one at https://openrouter.ai/keys\n")
  );

  const key = await input({
    message: "Enter your OpenRouter API key:",
  });

  const trimmed = key.trim();

  console.log(chalk.dim("Validating key..."));
  const valid = await validateApiKey(trimmed);
  if (!valid) {
    console.log(chalk.red("Invalid API key. Please try again."));
    return promptForApiKey();
  }

  console.log(chalk.green("Key validated successfully!"));
  await saveApiKey(trimmed);
  return trimmed;
}

export async function saveApiKey(key: string): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify({ apiKey: key }, null, 2));
}

export async function getApiKey(): Promise<string> {
  // 1. Check environment variable
  const envKey = process.env.OPENROUTER_API_KEY;
  if (envKey) return envKey;

  // 2. Check config file
  const fileKey = await loadConfigFile();
  if (fileKey) return fileKey;

  // 3. Prompt user
  return promptForApiKey();
}
