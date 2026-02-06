import { createAnthropic } from "@ai-sdk/anthropic";

const { GATE_URL, GATE_API_KEY } = process.env;
if (!GATE_URL || !GATE_API_KEY) {
  throw new Error(
    "Invalid env configuration: GATE_URl or GATE_API_KEY is missing."
  );
}

const anthropic = createAnthropic({
  baseURL: GATE_URL,
  apiKey: GATE_API_KEY,
});

export { anthropic };
