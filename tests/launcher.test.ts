import { describe, it, expect, vi, afterEach } from "vitest";
import { spawn } from "node:child_process";

vi.mock("node:child_process");

describe("launcher", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("spawns claude with correct env vars and model flags", async () => {
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
      mainModel: "anthropic/claude-sonnet-4",
      smallModel: "anthropic/claude-haiku-4-5-20251001",
      extraArgs: ["--verbose"],
    });

    expect(spawn).toHaveBeenCalledWith(
      "claude",
      [
        "--model",
        "anthropic/claude-sonnet-4",
        "--small-model",
        "anthropic/claude-haiku-4-5-20251001",
        "--verbose",
      ],
      {
        stdio: "inherit",
        env: expect.objectContaining({
          ANTHROPIC_BASE_URL: "https://openrouter.ai/api/v1",
          ANTHROPIC_API_KEY: "sk-or-test",
        }),
      }
    );
    expect(exitCode).toBe(0);
  });

  it("omits --small-model when not provided", async () => {
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
      mainModel: "anthropic/claude-sonnet-4",
      smallModel: null,
      extraArgs: [],
    });

    const args = vi.mocked(spawn).mock.calls[0][1] as string[];
    expect(args).toEqual(["--model", "anthropic/claude-sonnet-4"]);
    expect(args).not.toContain("--small-model");
  });
});
