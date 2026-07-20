const appJson = require('./app.json');

const versionCode = process.env.EXPO_APP_VERSION_CODE
  ? parseInt(process.env.EXPO_APP_VERSION_CODE, 10)
  : parseInt(appJson.expo.version.replace(/\./g, '').padEnd(3, '0'), 10);

const versionName = process.env.EXPO_APP_VERSION_NAME || appJson.expo.version;

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
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
