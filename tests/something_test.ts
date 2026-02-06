import { runner } from "@/lib/runner";
import { log_success, log_error } from "@/lib/utils";

export async function run_something_test(r: runner) {
  const result = r.add_generate_text(
    "What can you tell me about love?",
    "cerebras/gpt-oss"
  );

  result.on_finish((result) => {
    log_success(`Response: ${result.text}`);
  });

  result.on_error((error) => {
    log_error(`Error: ${error.message}`);
  });

  result.on_stop((index) => {
    log_success(`Stopped at index ${index}`);
  });

  return result;
}
