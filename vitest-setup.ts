import { vi } from "vitest";

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock as unknown as Storage,
  writable: true,
  configurable: true,
});
