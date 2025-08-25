// Minimal ambient typings to allow TypeScript typechecking without Foundry types installed.
// Replace with @league-of-foundry-developers/foundry-vtt-types in a real environment.

declare class Application<TOptions = any> {
  constructor(options?: TOptions);
  static get defaultOptions(): Application.Options;
  options: TOptions & { id?: string };
  render(force?: boolean, options?: Application.RenderOptions): this;
}

declare namespace Application {
  interface Options {
    id?: string;
    title?: string;
    [key: string]: unknown;
  }
  interface RenderOptions {
    [key: string]: unknown;
  }
}

declare const Hooks: {
  on(name: string, fn: (...args: any[]) => void): void;
  once(name: string, fn: (...args: any[]) => void): void;
};

declare const game: { user?: { isGM?: boolean } };

declare function mergeObject<T>(original: T, other: Partial<T>, options?: any): T;

// Minimal UI shim
declare const ui: {
  notifications?: {
    info?: (message: string) => void;
    warn?: (message: string) => void;
    error?: (message: string) => void;
  };
};
