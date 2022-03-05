module.exports = {
  roots: ['<rootDir>/src'],
  testRegex: '__tests__/.*\\.test\\.ts$',
  transform: {
    '^.+\\.(js|ts)$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: true,
};
