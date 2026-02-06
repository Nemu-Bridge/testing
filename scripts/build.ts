import { $ } from "bun";

const start = performance.now();
const log = {
  info: (msg: string) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✔\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
  error: (msg: string) => console.error(`\x1b[31m✖\x1b[0m ${msg}`),
};

log.info("Build started");

try {
  log.info("Running TypeScript type check...");
  await $`tsc`;
  log.success("TypeScript passed");

  log.info("Running ESLint...");
  await $`eslint .`;
  log.success("ESLint passed");

  log.info("Bundling with Bun...");
  const output = await Bun.build({
    entrypoints: ["./index.ts"],
    outdir: "./out",
    target: "bun",
  });

  if (!output.success) {
    log.error("Bundling failed");
    for (const message of output.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  log.success("Bundling completed");

  const time = ((performance.now() - start) / 1000).toFixed(2);
  log.success(`Build finished in ${time}s`);
} catch (err) {
  log.error("Build failed");
  console.error(err);
  process.exit(1);
}
