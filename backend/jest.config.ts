import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!jose)/"],
};

export default config;
