import { describe, it, expect, vi, afterEach } from "vitest";
import { spawn } from "node:child_process";

vi.mock("node:child_process");

describe("launcher", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("spawns claude with correct env vars for all model roles", async () => {
    const mockProcess = {
      on: vi.fn((event, cb) => {
        if (event === "close") cb(0);
        return mockProcess;
      }),
    };
    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const { launchClaude } = await import("../src/launcher.js");
    const exitCode = await launchClaude({
      apiKey: "sk-or-test",
      opusModel: "anthropic/claude-opus-4",
      sonnetModel: "anthropic/claude-sonnet-4",
      haikuModel: "anthropic/claude-haiku-4-5-20251001",
      subagentModel: "google/gemini-3-flash-preview",
      extraArgs: ["--verbose"],
    });

    expect(spawn).toHaveBeenCalledWith(
      "claude",
      ["--verbose"],
      {
        stdio: "inherit",
        env: expect.objectContaining({
          ANTHROPIC_BASE_URL: "https://openrouter.ai/api",
          ANTHROPIC_AUTH_TOKEN: "sk-or-test",
          ANTHROPIC_API_KEY: "",
          ANTHROPIC_DEFAULT_OPUS_MODEL: "anthropic/claude-opus-4",
          ANTHROPIC_DEFAULT_SONNET_MODEL: "anthropic/claude-sonnet-4",
          ANTHROPIC_DEFAULT_HAIKU_MODEL: "anthropic/claude-haiku-4-5-20251001",
          CLAUDE_CODE_SUBAGENT_MODEL: "google/gemini-3-flash-preview",
        }),
      }
    );
    expect(exitCode).toBe(0);
  });

  it("omits CLAUDE_CODE_SUBAGENT_MODEL when not provided", async () => {
    const mockProcess = {
      on: vi.fn((event, cb) => {
        if (event === "close") cb(0);
        return mockProcess;
      }),
    };
    vi.mocked(spawn).mockReturnValue(mockProcess as any);

    const { launchClaude } = await import("../src/launcher.js");
    await launchClaude({
      apiKey: "sk-or-test",
      opusModel: "anthropic/claude-opus-4",
      sonnetModel: "anthropic/claude-sonnet-4",
      haikuModel: "anthropic/claude-haiku-4-5-20251001",
      subagentModel: null,
      extraArgs: [],
    });

    const env = vi.mocked(spawn).mock.calls[0][2] as any;
    expect(env.env.CLAUDE_CODE_SUBAGENT_MODEL).toBeUndefined();
    expect(env.env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("anthropic/claude-opus-4");
  });
});
