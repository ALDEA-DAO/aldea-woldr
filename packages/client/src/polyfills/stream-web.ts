/**
 * Stub for node:stream/web module
 * This provides minimal browser-compatible implementations
 */

// Use native browser streams if available, otherwise provide stubs
export const ReadableStream = globalThis.ReadableStream || class ReadableStream {};
export const WritableStream = globalThis.WritableStream || class WritableStream {};
export const TransformStream = globalThis.TransformStream || class TransformStream {};

export default {
  ReadableStream,
  WritableStream,
  TransformStream,
};
