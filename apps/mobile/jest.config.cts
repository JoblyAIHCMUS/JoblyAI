module.exports = {
  displayName: '@org/mobile',
  preset: 'jest-expo',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['babel-preset-expo'],
      },
    ],
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/app/__mocks__/styleMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/mobile',
};
