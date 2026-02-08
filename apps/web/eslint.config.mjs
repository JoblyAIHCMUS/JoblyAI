import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

baseConfig["rules"] = {
  'complexity': ['error', { max: 10 }],
  'max-depth': ['error', 3],
  'max-lines': ['error', { max: 600, skipBlankLines: true }],
  'max-params': ['error', 6],
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
}

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['.next/**/*', '**/out-tsc'],
  },
];
