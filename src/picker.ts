import search from "@inquirer/search";
import confirm from "@inquirer/confirm";
import chalk from "chalk";
import { type Model, formatModelChoice } from "./models.js";
import { type SavedModels, getSavedModels, saveModels } from "./config.js";

export interface ModelSelection {
  opusModel: string;
  sonnetModel: string;
  haikuModel: string;
  subagentModel: string | null;
}

async function pickModel(
  role: string,
  models: Model[]
): Promise<string | null> {
  try {
    const result = await search({
      message: `Select ${role}:`,
      source: (input) => {
        const term = (input || "").toLowerCase();
        return models
          .filter(
            (m) =>
              m.id.toLowerCase().includes(term) ||
              m.name.toLowerCase().includes(term)
          )
          .map((m) => ({
            name: formatModelChoice(m),
            value: m.id,
          }));
      },
    });
    return result;
  } catch {
    // User pressed Ctrl+C / Esc
    return null;
  }
}

function printSelection(selection: ModelSelection): void {
  console.log(chalk.bold("\n✓ Configuration:"));
  console.log(`  Opus model:     ${chalk.cyan(selection.opusModel)}`);
  console.log(`  Sonnet model:   ${chalk.cyan(selection.sonnetModel)}`);
  console.log(`  Haiku model:    ${chalk.cyan(selection.haikuModel)}`);
  if (selection.subagentModel) {
    console.log(`  Subagent model: ${chalk.cyan(selection.subagentModel)}`);
  } else {
    console.log(`  Subagent model: ${chalk.dim("(skipped)")}`);
  }
  console.log();
}

export async function selectModels(models: Model[]): Promise<ModelSelection> {
  // Check for saved model selections
  const saved = await getSavedModels();
  if (saved) {
    console.log(chalk.bold("\n📋 Last used models:"));
    printSelection(saved);

    const reuse = await confirm({
      message: "Use these models again?",
      default: true,
    });

    if (reuse) {
      return saved;
    }
  }

  console.log(chalk.bold("\n🔍 Model Selection\n"));

  const opusModel = await pickModel("opus model (primary)", models);
  if (!opusModel) {
    console.log(chalk.red("Opus model is required. Exiting."));
    process.exit(1);
  }

  const sonnetModel = await pickModel("sonnet model (default)", models);
  if (!sonnetModel) {
    console.log(chalk.red("Sonnet model is required. Exiting."));
    process.exit(1);
  }

  const haikuModel = await pickModel("haiku model (fast/cheap)", models);
  if (!haikuModel) {
    console.log(chalk.red("Haiku model is required. Exiting."));
    process.exit(1);
  }

  console.log(
    chalk.dim("\nPress Esc or Ctrl+C to skip subagent model selection.\n")
  );
  const subagentModel = await pickModel("subagent model", models);

  const selection: ModelSelection = { opusModel, sonnetModel, haikuModel, subagentModel };

  printSelection(selection);
  await saveModels(selection);

  return selection;
}
