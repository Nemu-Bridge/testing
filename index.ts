import { runner } from "@/lib/runner";
import { log_info, log_success, log_warning, log_error } from "@/lib/utils";
import { readdir } from "fs/promises";
import { join } from "path";

interface test_module {
  default?: (r: runner) => Promise<void> | void;
  DO_NOT_RUN?: boolean;
  [key: string]: any;
}

async function load_tests(r: runner) {
  const tests_dir = join(import.meta.dir, "tests");
  const files = await readdir(tests_dir);

  for (const file of files) {
    if (file.endsWith("_test.ts")) {
      const test_name = file.replace("_test.ts", "");

      const module_path = join(tests_dir, file);
      const module = (await import(module_path)) as test_module;

      if (module.DO_NOT_RUN === true) {
        log_warning(`Skipping test: ${test_name}`);
        continue;
      }

      log_info(`Loading test: ${test_name}`);

      const run_fn_name = `run_${test_name}_test`;
      if (module[run_fn_name]) {
        await module[run_fn_name](r);
      } else if (module.default) {
        await module.default(r);
      }
    }
  }
}

(async () => {
  const r = new runner();

  await load_tests(r);
  const results = await r.run();

  log_success(
    `Completed ${results.length} tests (${results.filter((res) => res !== null).length} passed, ${results.filter((res) => res === null).length} failed)`
  );
})();

process.on("uncaughtException", (err) => {
  log_error("Uncaught Exception: " + (err?.message || String(err)));
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  log_error("Unhandled Rejection: " + message);
});
