const { execSync } = require('child_process');
const appJson = require('./app.json');

const getGitCommitCount = () => {
  try {
    return parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);
  } catch {
    return 1;
  }
};

const getGitBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
};

const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return '0000000';
  }
};

const branch = getGitBranch();
const isDevBranch = branch !== 'main' && branch !== 'master';
const devOffset = isDevBranch ? 100000 : 0;
const versionCode = getGitCommitCount() + devOffset;
const versionName = `${branch.replace(/[^a-zA-Z0-9.-]/g, '-')}-${getGitHash()}-v1`;

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    version: appJson.expo.version,
    android: {
      ...appJson.expo.android,
      versionCode,
    },
    ios: {
      ...appJson.expo.ios,
      buildNumber: String(versionCode),
    },
    extra: {
      ...appJson.expo.extra,
      versionName,
    },
  },
};
