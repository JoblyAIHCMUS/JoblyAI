const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
  ignoreWarnings: [/Failed to parse source map/, /google-logging-utils/],
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp:
        /^(kerberos|pg-native|bufferutil|utf-8-validate|@opentelemetry\/api)$/,
    }),
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [
        './src/assets',
        {
          input: '../../node_modules/pdfjs-dist/legacy/build',
          glob: 'pdf.worker.mjs',
          output: '.',
        },
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};
