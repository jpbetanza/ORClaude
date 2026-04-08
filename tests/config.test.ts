import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";

vi.mock("node:fs/promises");
vi.mock("@inquirer/input");

const CONFIG_DIR = resolve(homedir(), ".orclaude");
const CONFIG_PATH = resolve(CONFIG_DIR, "config.json");

describe("config", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns API key from environment variable", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-env-key";
    const { getApiKey } = await import("../src/config.js");
    const key = await getApiKey();
    expect(key).toBe("sk-or-env-key");
  });

  it("returns API key from config file when env var not set", async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ apiKey: "sk-or-file-key" })
    );
    const { getApiKey } = await import("../src/config.js");
    const key = await getApiKey();
    expect(key).toBe("sk-or-file-key");
  });

  it("prompts user and saves key when no key found", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const inputMock = vi.fn().mockResolvedValue("sk-or-prompted-key");
    const inquirerInput = await import("@inquirer/input");
    vi.mocked(inquirerInput.default).mockImplementation(inputMock);

    // Mock the validation fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { label: "test" } }),
    }) as any;

    const { getApiKey } = await import("../src/config.js");
    const key = await getApiKey();

    expect(key).toBe("sk-or-prompted-key");
    expect(writeFile).toHaveBeenCalledWith(
      CONFIG_PATH,
      JSON.stringify({ apiKey: "sk-or-prompted-key" }, null, 2)
    );
  });

  it("saves API key to config file", async () => {
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const { saveApiKey } = await import("../src/config.js");
    await saveApiKey("sk-or-new-key");

    expect(mkdir).toHaveBeenCalledWith(CONFIG_DIR, { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(
      CONFIG_PATH,
      JSON.stringify({ apiKey: "sk-or-new-key" }, null, 2)
    );
  });
});
