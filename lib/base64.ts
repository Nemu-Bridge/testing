import { Buffer } from "buffer";

export const assert_string: (
  value: unknown,
  name: string
) => asserts value is string = (value, name) => {
  if (typeof value !== "string")
    throw new TypeError(`${name} must be a string`);
};

export const assert_buffer: (
  value: unknown,
  name: string
) => asserts value is Buffer = (value, name) => {
  if (!Buffer.isBuffer(value)) throw new TypeError(`${name} must be a Buffer`);
};

export const test: (payload: string) => boolean = (payload) => {
  if (typeof payload !== "string") return false;

  const normalized: string = payload.replace(/\s+/g, "");
  if (normalized.length === 0) return false;

  const is_base64: boolean = /^[A-Za-z0-9+/]*={0,2}$/.test(normalized);
  const is_base64_url: boolean = /^[A-Za-z0-9\-_]+$/.test(normalized);

  if (!is_base64 && !is_base64_url) return false;

  let to_decode: string = normalized;
  if (is_base64) {
    if (normalized.length % 4 !== 0) return false;
  } else {
    to_decode = normalized.replace(/-/g, "+").replace(/_/g, "/");
    const mod: number = to_decode.length % 4;
    if (mod === 1) return false;
    if (mod) to_decode += "=".repeat(4 - mod);
  }

  try {
    const buf: Buffer = Buffer.from(to_decode, "base64");
    return buf.length > 0;
  } catch {
    return false;
  }
};

export const encode: (payload: string) => string = (payload) => {
  assert_string(payload, "payload");

  try {
    return Buffer.from(payload, "utf-8").toString("base64");
  } catch (error: any) {
    throw new Error(`Failed to encode string to base64: ${error.message}`);
  }
};

export const decode: (payload: string) => string = (payload) => {
  assert_string(payload, "payload");
  if (!test(payload)) throw new Error("Invalid base64 string");

  try {
    return Buffer.from(payload, "base64").toString("utf-8");
  } catch (error: any) {
    throw new Error(`Failed to decode base64 string: ${error.message}`);
  }
};

export const encode_to_json: (payload: Record<string, any>) => string = (
  payload
) => {
  if (payload === null || typeof payload !== "object")
    throw new TypeError("payload must be an object");
  try {
    return encode(JSON.stringify(payload));
  } catch (error: any) {
    throw new Error(`Failed to encode JSON to base64: ${error.message}`);
  }
};

export const decode_from_json: (payload: string) => Record<string, any> = (
  payload
) => {
  assert_string(payload, "payload");

  try {
    const decoded: string = decode(payload);
    const parsed: unknown = JSON.parse(decoded);

    if (parsed === null || typeof parsed !== "object")
      throw new Error("Decoded value is not a JSON object");

    return parsed as Record<string, any>;
  } catch (error: any) {
    throw new Error(`Failed to decode base64 JSON: ${error.message}`);
  }
};

export const encode_url_safe: (payload: string) => string = (payload) => {
  assert_string(payload, "payload");

  return encode(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const decode_url_safe: (payload: string) => string = (payload) => {
  assert_string(payload, "payload");

  const base64: string = payload.replace(/-/g, "+").replace(/_/g, "/");
  const mod: number = base64.length % 4;

  if (mod === 1) throw new Error("Invalid URL-safe base64 length");
  const padded: string = mod ? base64 + "=".repeat(4 - mod) : base64;

  try {
    return decode(padded);
  } catch (error: any) {
    throw new Error(
      `Failed to decode URL-safe base64 string: ${error.message}`
    );
  }
};

export const encode_buffer: (buffer: Buffer) => string = (buffer) => {
  assert_buffer(buffer, "buffer");

  try {
    return buffer.toString("base64");
  } catch (error: any) {
    throw new Error(`Failed to encode buffer to base64: ${error.message}`);
  }
};

export const decode_buffer: (payload: string) => Buffer = (payload) => {
  assert_string(payload, "payload");
  if (!test(payload)) throw new Error("Invalid base64 string");

  try {
    return Buffer.from(payload, "base64");
  } catch (error: any) {
    throw new Error(`Failed to decode base64 to buffer: ${error.message}`);
  }
};
