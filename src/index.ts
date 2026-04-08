// src/index.ts
import chalk from "chalk";
import { getApiKey } from "./config.js";
import { fetchModels } from "./models.js";
import { selectModels } from "./picker.js";
import { launchClaude } from "./launcher.js";

async function main(): Promise<void> {
  console.log(chalk.bold("orclaude") + chalk.dim(" — Claude Code via OpenRouter\n"));

  // 1. Resolve API key
  const apiKey = await getApiKey();

  // 2. Fetch and filter models
  console.log(chalk.dim("Fetching models from OpenRouter..."));
  const models = await fetchModels();
  console.log(chalk.dim(`Found ${models.length} compatible models.\n`));

  // 3. Pick models
  const selection = await selectModels(models);

  // 4. Launch Claude Code
  const extraArgs = process.argv.slice(2);
  const exitCode = await launchClaude({
    apiKey,
    opusModel: selection.opusModel,
    sonnetModel: selection.sonnetModel,
    haikuModel: selection.haikuModel,
    subagentModel: selection.subagentModel,
    extraArgs,
  });

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(chalk.red("Error:"), err.message);
  process.exit(1);
});
