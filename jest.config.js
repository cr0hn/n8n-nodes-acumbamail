module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { target: 'ES2019', module: 'commonjs', strict: true, skipLibCheck: true }
    }]
  }
};
