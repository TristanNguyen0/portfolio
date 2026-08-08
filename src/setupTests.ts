import '@testing-library/jest-dom'

// jsdom ships no ResizeObserver. A no-op stub is enough: nothing here lays out, so
// it would never fire anyway, and tests that care drive the measurement directly.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
