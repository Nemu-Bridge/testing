import { ZodSchema } from "zod";
import { color } from "./colors";
export { color };

export function z_test_schema<T>(
  object: unknown,
  schema: ZodSchema<T>
): boolean {
  const result = schema.safeParse(object);
  return result.success;
}

export function z_compare_schema<T, U>(
  first: ZodSchema<T>,
  second: ZodSchema<U>,
  sample: unknown
): boolean {
  const res_a = first.safeParse(sample);
  const res_b = second.safeParse(sample);

  if (res_a.success !== res_b.success) return false;
  if (!res_a.success && !res_b.success)
    return (
      JSON.stringify(res_a.error.issues) === JSON.stringify(res_b.error.issues)
    );

  return true;
}

export function test_json(object: string): { ok: boolean; error?: unknown } {
  try {
    JSON.parse(object);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export const format_date = (): string => {
  const d = new Date();
  return d.toISOString().replace("T", " ").slice(0, 19);
};

export const log_error = (error: string, details?: string) => {
  const date = color.gray(format_date());
  const tag = color.red("ERROR");
  const details_str = details ? ` - ${details}` : "";
  console.error(`${date} ${tag} ${error}${details_str}`);
};

export const log_system_error = (error: string, details?: string) => {
  const date = color.gray(format_date());
  const tag = color.red("ERROR");
  const details_str = details ? ` - ${details}` : "";
  console.error(`${date} ${tag} ${error}${details_str}`);
};

export const log_info = (message: string, ...args: unknown[]) => {
  const date = color.gray(format_date());
  const tag = color.cyan("INFO");
  const extra = args.length ? ` ${args.join(" ")}` : "";
  console.log(`${date} ${tag} ${message}${extra}`);
};

export const log_success = (message: string, ...args: unknown[]) => {
  const date = color.gray(format_date());
  const tag = color.green("SUCCESS");
  const extra = args.length ? ` ${args.join(" ")}` : "";
  console.log(`${date} ${tag} ${message}${extra}`);
};

export const log_warning = (message: string, ...args: unknown[]) => {
  const date = color.gray(format_date());
  const tag = color.yellow("WARN");
  const extra = args.length ? ` ${args.join(" ")}` : "";
  console.warn(`${date} ${tag} ${message}${extra}`);
};
