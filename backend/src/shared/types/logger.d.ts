declare module "logger" {
  export function log(...args: unknown[]): void;
  export function error(...args: unknown[]): void;
}
