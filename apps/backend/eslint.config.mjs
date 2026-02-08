import baseConfig from '../../eslint.config.mjs';

baseConfig["rules"] = {
  'complexity': ['error', { max: 10 }],
  'max-depth': ['error', 3],
  'max-lines': ['error', { max: 500, skipBlankLines: true }],
  'max-params': ['error', 6],
}

export default [...baseConfig];
