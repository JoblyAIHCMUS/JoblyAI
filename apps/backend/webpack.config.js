const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  externalsPresets: { node: true },
  externals: [
    ({ request }, callback) => {
      if (!request) {
        return callback();
      }
      if (request === 'pg-native' || request.startsWith('@prisma/')) {
        return callback(null, `commonjs ${request}`);
      }
      return callback();
    },
  ],
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets', './src/generated'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: false,
    }),
  ],
};
