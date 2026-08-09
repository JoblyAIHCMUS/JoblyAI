const appJson = require('./app.json');

const versionCode = Number.parseInt(process.env.EXPO_APP_VERSION_CODE ?? '', 10);
const versionName = process.env.EXPO_APP_VERSION_NAME;

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    ...(versionName ? { version: versionName } : {}),
    android: {
      ...appJson.expo.android,
      ...(Number.isFinite(versionCode) ? { versionCode } : {}),
    },
  },
};
