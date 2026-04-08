import { describe, it, expect, vi, afterEach } from "vitest";

describe("models", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and filters models that support tools", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "anthropic/claude-sonnet-4",
              name: "Claude Sonnet 4",
              context_length: 200000,
              pricing: { prompt: "0.000003", completion: "0.000015" },
              supported_parameters: ["tools", "temperature", "system"],
            },
            {
              id: "meta/llama-3-70b",
              name: "Llama 3 70B",
              context_length: 8192,
              pricing: { prompt: "0.0000008", completion: "0.0000008" },
              supported_parameters: ["temperature"],
            },
            {
              id: "google/gemini-2.5-pro",
              name: "Gemini 2.5 Pro",
              context_length: 1000000,
              pricing: { prompt: "0.0000025", completion: "0.000010" },
              supported_parameters: ["tools", "temperature"],
            },
          ],
        }),
    }) as any;

    const { fetchModels } = await import("../src/models.js");
    const models = await fetchModels();

    expect(models).toHaveLength(2);
    expect(models[0].id).toBe("anthropic/claude-sonnet-4");
    expect(models[1].id).toBe("google/gemini-2.5-pro");
  });

  it("formats model display string correctly", async () => {
    const { formatModelChoice } = await import("../src/models.js");
    const display = formatModelChoice({
      id: "anthropic/claude-sonnet-4",
      name: "Claude Sonnet 4",
      contextLength: 200000,
      inputPrice: 3,
      outputPrice: 15,
    });
    expect(display).toBe(
      "anthropic/claude-sonnet-4 — 200K ctx — $3/$15 per 1M tokens"
    );
  });

  it("throws on fetch failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    }) as any;

    const { fetchModels } = await import("../src/models.js");
    await expect(fetchModels()).rejects.toThrow("Failed to fetch models");
  });
});
