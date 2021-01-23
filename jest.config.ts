import type { Config } from "@jest/types"
import { defaults } from "jest-config"
// import { pathsToModuleNameMapper } from "ts-jest/utils"

// cf. https://www.typescriptlang.org/ja/tsconfig#resolveJsonModule
// cf. https://www.typescriptlang.org/ja/tsconfig#moduleResolution
// import { compilerOptions } from "./tsconfig.json"

/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */
// eslint-disable-next-line @typescript-eslint/require-await
const config = async (): Promise<Config.InitialOptions> => {
  // jest configuration goes here: cf. https://jestjs.io/docs/ja/configuration
  return {
    verbose: true,
    notify: true,
    preset: "ts-jest",
    rootDir: ".",
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    testMatch: [...defaults.testMatch, "**/test/**/*.[jt]s?(x)"],
    testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, "/dist/"],
    testEnvironment: "jsdom",
    // globalSetup: "<rootDir>/test/setup.ts",
    // globalTeardown: "<rootDir>/test/teardown.ts",
    globals: {
      "ts-jest": {
        // ts-jest configuration goes here: cf. https://kulshekhar.github.io/ts-jest/docs/options
        tsconfig: "./.config/tsconfig.jest.json",
        useEsm: true
      }
    }
    // reporters: ["default", "jest-failure-reporter"],
  }
}

export default config
