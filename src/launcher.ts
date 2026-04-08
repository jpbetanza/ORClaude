import { spawn } from "node:child_process";

export interface LaunchOptions {
  apiKey: string;
  mainModel: string;
  smallModel: string | null;
  extraArgs: string[];
}

export function launchClaude(options: LaunchOptions): Promise<number> {
  const args: string[] = ["--model", options.mainModel];

  if (options.smallModel) {
    args.push("--small-model", options.smallModel);
  }

  args.push(...options.extraArgs);

  const child = spawn("claude", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      ANTHROPIC_BASE_URL: "https://openrouter.ai/api/v1",
      ANTHROPIC_API_KEY: options.apiKey,
    },
  });

  return new Promise((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
  });
}
