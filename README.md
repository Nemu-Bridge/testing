# NEMU Test Framework

A modular test framework for testing AI model responses with callback-based result handling.

## Setup

### Environment Variables

Create a `.env` file in the test directory:

```env
GATE_URL="http://localhost:5000/anthropic/v1"
GATE_API_KEY="sk_your_api_key_here"
```

### Claude Configuration

If using Claude Code, update `.claude/settings.json` with your API credentials:

```json
{
  "env": {
    "GATE_URL": "http://localhost:5000/anthropic",
    "GATE_API_KEY": "sk_your_api_key_here"
  }
}
```

## Usage

### Creating a Test

Create a file in `tests/` ending with `_test.ts`:

```typescript
import { runner } from "@/lib/runner";

export const do_not_run = false;  // Set to true to skip this test

export async function run_my_test(r: runner) {
  const response = r.add_generate_text(
    "What is artificial intelligence?",
    "cerebras/gpt-oss",
    { max_tokens: 150 }
  );
  
  response.on_finish((result, index) => {
    console.log("Response:", result.text);
    console.log("Usage:", result.totalUsage);
  });
  
  response.on_error((error, index) => {
    console.error("Error:", error.message);
  });
  
  response.on_stop((index) => {
    console.log(`Test stopped at index ${index}`);
  });
}
```

### Available Methods

**add_generate_text(prompt, model_name, options)**
- `prompt`: The text prompt to send
- `model_name`: Model identifier (default: "cerebras/gpt-oss")
- `options`: Additional options like `{ max_tokens: 100 }`

**add_streaming_text(prompt, model_name, options)**
Same as above but returns a streaming response.

### Callbacks

Each test handle supports these callbacks (chainable):

- **on_finish((result, index) => {})**: Called when test completes successfully
- **on_error((error, index) => {})**: Called when test fails
- **on_stop((index) => {})**: Called when test is stopped
- **on_streaming((chunk, index) => {})**: Called for each chunk in streaming tests

### Skipping Tests

Add `export const do_not_run = true;` to skip a test file:

```typescript
export const do_not_run = true;  // This test will be skipped

export async function run_my_test(r: runner) {
  // ...
}
```

## Running Tests

```bash
# Run all tests
bun test

# Run in development mode with watch
bun dev

# Run linting
bun run lint

# Build the project
bun run build
```

## Output Format

Tests produce clean, color-coded output:

```
2026-02-06 21:24:16 INFO Loading test: my_test
Response: AI is a field of computer science...
2026-02-06 21:24:19 SUCCESS Completed 1 tests (1 passed, 0 failed)
```

## Project Structure

```
test/
├── tests/              # Test files (auto-discovered)
│   └── nemu_test.ts    # Example test
├── lib/
│   ├── runner.ts       # Test runner and handle classes
│   └── utils.ts        # Logging utilities
├── providers/
│   ├── anthropic.ts    # Anthropic provider config
│   └── openai.ts       # OpenAI provider config
├── index.ts            # Test entry point
├── package.json
└── .env                # Environment variables
```

## API Reference

### Test Handle

Returned by `add_generate_text()` and `add_streaming_text()`:

```typescript
interface test_handle {
  on_finish(callback: (result: any, index: number) => void): test_handle;
  on_error(callback: (error: Error, index: number) => void): test_handle;
  on_stop(callback: (index: number) => void): test_handle;
  on_streaming(callback: (chunk: string, index: number) => void): test_handle;
}
```

### Runner

```typescript
class runner {
  add_generate_text(prompt, model?, options?): test_handle
  add_streaming_text(prompt, model?, options?): test_handle
  run(): Promise<(any | null)[]>
}
```
