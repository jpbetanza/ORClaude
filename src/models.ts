export interface Model {
  id: string;
  name: string;
  contextLength: number;
  inputPrice: number;
  outputPrice: number;
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  supported_parameters: string[];
}

function formatContextLength(length: number): string {
  if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
  if (length >= 1000) return `${Math.round(length / 1000)}K`;
  return `${length}`;
}

function pricePerMillion(perToken: string): number {
  return parseFloat(perToken) * 1_000_000;
}

export function formatModelChoice(model: Model): string {
  const ctx = formatContextLength(model.contextLength);
  const inp = `$${model.inputPrice}`;
  const out = `$${model.outputPrice}`;
  return `${model.id} — ${ctx} ctx — ${inp}/${out} per 1M tokens`;
}

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models");

  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const raw: OpenRouterModel[] = json.data;

  return raw
    .filter((m) => m.supported_parameters?.includes("tools"))
    .map((m) => ({
      id: m.id,
      name: m.name,
      contextLength: m.context_length,
      inputPrice: pricePerMillion(m.pricing.prompt),
      outputPrice: pricePerMillion(m.pricing.completion),
    }));
}
