import { spawn } from "node:child_process";

export interface LaunchOptions {
  apiKey: string;
  opusModel: string;
  sonnetModel: string;
  haikuModel: string;
  subagentModel: string | null;
  extraArgs: string[];
}

export function launchClaude(options: LaunchOptions): Promise<number> {
  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    ANTHROPIC_BASE_URL: "https://openrouter.ai/api",
    ANTHROPIC_AUTH_TOKEN: options.apiKey,
    ANTHROPIC_API_KEY: "",
    ANTHROPIC_DEFAULT_OPUS_MODEL: options.opusModel,
    ANTHROPIC_DEFAULT_SONNET_MODEL: options.sonnetModel,
    ANTHROPIC_DEFAULT_HAIKU_MODEL: options.haikuModel,
  };

  if (options.subagentModel) {
    env.CLAUDE_CODE_SUBAGENT_MODEL = options.subagentModel;
  }

  const child = spawn("claude", options.extraArgs, {
    stdio: "inherit",
    env,
  });

  return new Promise((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
  });
}
