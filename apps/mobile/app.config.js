const fs = require('fs');
const path = require('path');
const appJson = require('./app.json');

const googleServicesFile = './google-services.json';
const googleServicesPath = path.join(__dirname, 'google-services.json');

module.exports = ({ config }) => {
  const expoConfig = {
    ...config,
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
    },
  };

  if (fs.existsSync(googleServicesPath)) {
    expoConfig.android.googleServicesFile = googleServicesFile;
  }

  return expoConfig;
};
