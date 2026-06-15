import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.smoke.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          strict: false,
        },
      },
    ],
  },
  // 30 s per test to accommodate slow DB round-trips
  testTimeout: 30000,
  // Run test files sequentially so ordered auth-token handoffs are reliable
  runInBand: true,
}

export default config
