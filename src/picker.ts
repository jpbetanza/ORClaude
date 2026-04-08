import search from "@inquirer/search";
import chalk from "chalk";
import { type Model, formatModelChoice } from "./models.js";

export interface ModelSelection {
  mainModel: string;
  smallModel: string | null;
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

export async function selectModels(models: Model[]): Promise<ModelSelection> {
  console.log(chalk.bold("\n🔍 Model Selection\n"));

  const mainModel = await pickModel("main model", models);
  if (!mainModel) {
    console.log(chalk.red("Main model is required. Exiting."));
    process.exit(1);
  }

  console.log(
    chalk.dim("\nPress Esc or Ctrl+C to skip small model selection.\n")
  );
  const smallModel = await pickModel("small model", models);

  console.log(chalk.bold("\n✓ Configuration:"));
  console.log(`  Main model:  ${chalk.cyan(mainModel)}`);
  if (smallModel) {
    console.log(`  Small model: ${chalk.cyan(smallModel)}`);
  } else {
    console.log(`  Small model: ${chalk.dim("(skipped)")}`);
  }
  console.log();

  return { mainModel, smallModel };
}
