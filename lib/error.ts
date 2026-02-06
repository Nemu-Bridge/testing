import { color } from "./colors";

const ERROR_MARK = color.red(color.bold("×"));

function highlight_url(input: string): string {
  try {
    const url = new URL(input);

    const origin = url.origin + "/";
    const rest = url.pathname.replace(/^\/+/, "") + url.search + url.hash;

    return color.bold(color.cyan(origin)) + color.bold(color.red(rest));
  } catch {
    const match = input.match(/^(https?:\/\/[^/]+\/)(.*)$/);
    if (!match) {
      return color.cyan(input);
    }

    const part1 = match[1] ?? "";
    const part2 = match[2] ?? "";
    return color.bold(color.cyan(part1)) + color.bold(color.red(part2));
  }
}

function format_error(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      type: "UnknownError",
      message: String(error),
    };
  }

  const e = error as Record<string, any>;
  const result: Record<string, any> = {
    type: e.name ?? e.code ?? "AIError",
    message: e.message ?? e.reason ?? "Unknown AI error",
    url: e.url,
    model: e.requestBodyValues?.model,
    retryable: e.isRetryable,
    statusCode: e.statusCode,
    errno: e.errno,
    code: e.code,
  };

  let cause = e.cause;
  const causes: string[] = [];

  while (cause && typeof cause === "object") {
    if (cause.message && !causes.includes(cause.message)) {
      causes.push(cause.message);
    }
    cause = cause.cause;
  }

  if (causes.length) {
    result.causes = causes;
  }

  for (const key of Object.keys(result)) {
    if (result[key] === undefined) {
      delete result[key];
    }
  }

  return result;
}

function pad(label: string, width = 12) {
  return label.padEnd(width, " ");
}

export function parse_error(error: unknown) {
  const e = format_error(error);

  console.error(
    ERROR_MARK + color.bold(color.red(" error:")) + " " + color.bold(e.message)
  );

  console.error("  " + color.gray(pad("type")) + color.cyan(e.type));

  if (e.code || e.errno) {
    console.error(
      "  " +
        color.gray(pad("code")) +
        [e.code, e.errno].filter(Boolean).join(" / ")
    );
  }

  if (e.statusCode !== undefined) {
    console.error("  " + color.gray(pad("http")) + e.statusCode);
  }

  if (e.model) {
    console.error("  " + color.gray(pad("model")) + e.model);
  }

  if (e.url) {
    console.error("  " + color.gray(pad("endpoint")) + highlight_url(e.url));
  }

  if (e.retryable !== undefined) {
    console.error(
      "  " +
        color.gray(pad("retryable")) +
        (e.retryable ? color.yellow("yes") : "no")
    );
  }

  if (e.causes?.length) {
    for (const cause of e.causes) {
      console.error("  " + color.gray("note:") + " " + cause);
    }
  }
}
