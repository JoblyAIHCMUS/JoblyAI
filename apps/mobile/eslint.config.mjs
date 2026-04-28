import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

baseConfig['rules'] = {
  complexity: ['error', { max: 10 }],
  'max-depth': ['error', 3],
  'max-lines': ['error', { max: 500, skipBlankLines: true }],
  'max-params': ['error', 6],
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
};

export default [
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['node_modules/**/*', '**/out-tsc'],
  },
];
