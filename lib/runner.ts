import { generateText, streamText } from "ai";
import { anthropic } from "@/providers/anthropic";
import { openai } from "@/providers/openai";
import { parse_error } from "@/lib/error";

type provider = typeof openai | typeof anthropic;

export type test_callback_result = (result: any, index: number) => void | Promise<void>;
export type test_callback_error = (error: Error, index: number) => void | Promise<void>;
export type test_callback_stop = (index: number) => void | Promise<void>;
export type test_callback_stream = (chunk: string, index: number) => void | Promise<void>;

export interface test_handle {
  on_finish: (callback: test_callback_result) => test_handle;
  on_error: (callback: test_callback_error) => test_handle;
  on_stop: (callback: test_callback_stop) => test_handle;
  on_streaming: (callback: test_callback_stream) => test_handle;
}

class test_handle_impl implements test_handle {
  private callbacks = {
    on_finish: null as test_callback_result | null,
    on_error: null as test_callback_error | null,
    on_stop: null as test_callback_stop | null,
    on_streaming: null as test_callback_stream | null,
  };

  on_finish(callback: test_callback_result): test_handle {
    this.callbacks.on_finish = callback;
    return this;
  }

  on_error(callback: test_callback_error): test_handle {
    this.callbacks.on_error = callback;
    return this;
  }

  on_stop(callback: test_callback_stop): test_handle {
    this.callbacks.on_stop = callback;
    return this;
  }

  on_streaming(callback: test_callback_stream): test_handle {
    this.callbacks.on_streaming = callback;
    return this;
  }

  get_callbacks() {
    return this.callbacks;
  }
}

export class runner {
  private queue: Array<{ fn: () => Promise<any>, handle: test_handle_impl, name: string }> = [];
  private results: (any | null)[] = [];

  constructor(private gate: provider = openai) {}
  
  add(fn: () => Promise<any>, name: string = "untitled") {
    const handle = new test_handle_impl();
    this.queue.push({ fn, handle, name });
    return handle;
  }

  get_results(): (any | null)[] {
    return this.results;
  }

  add_generate_text(
    prompt: string,
    model_name: string = "cerebras/gpt-oss",
    options: Record<string, any> = {}
  ): test_handle {
    const handle = new test_handle_impl();
    const index = this.queue.length;
    const name = `generate_text_${index}`;
    
    this.queue.push({
      fn: async () => {
        return await generateText({
          model: this.gate(model_name),
          prompt,
          ...options,
        });
      },
      handle,
      name
    });
    
    return handle;
  }

  add_streaming_text(
    prompt: string,
    model_name: string = "cerebras/gpt-oss",
    options: Record<string, any> = {}
  ): test_handle {
    const handle = new test_handle_impl();
    const index = this.queue.length;
    const name = `streaming_text_${index}`;
    
    this.queue.push({
      fn: async () => {
        return streamText({
          model: this.gate(model_name),
          prompt,
          ...options,
        });
      },
      handle,
      name
    });
    
    return handle;
  }

  async run(): Promise<(any | null)[]> {
    const results: (any | null)[] = [];

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      if (!item) continue;
      
      const { fn, handle } = item;
      
      try {
        const result = await fn();
        results.push(result);
        
        const callbacks = handle.get_callbacks();
        if (callbacks.on_finish) {
          await callbacks.on_finish(result, i);
        }
        
        if (callbacks.on_streaming && result && result.textStream) {
          for await (const chunk of result.textStream) {
            await callbacks.on_streaming(chunk, i);
          }
        }
      } catch (error) {
        results.push(null);
        
        const callbacks = handle.get_callbacks();
        if (callbacks.on_error) {
          await callbacks.on_error(error as Error, i);
        }
        parse_error(error);
      }
    }

    this.results = results;
    this.queue = [];
    return results;
  }
}
