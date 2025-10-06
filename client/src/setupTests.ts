import '@testing-library/jest-dom';

// Silence noisy React Router v7 future flag warning in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    const msg = String(args[0] ?? '');
    if (msg.includes('React Router Future Flag Warning')) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
