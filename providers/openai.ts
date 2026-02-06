import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const { GATE_URL, GATE_API_KEY } = process.env;
if (!GATE_URL || !GATE_API_KEY) {
  throw new Error(
    "Invalid env configuration: GATE_URl or GATE_API_KEY is missing."
  );
}

const openai = createOpenAICompatible({
  name: "nemu",
  apiKey: GATE_API_KEY,
  baseURL: GATE_URL,
  includeUsage: true,
});

export { openai };
