import passport from 'passport';
import OpenIDConnectStrategy, { type Profile, type VerifyCallback } from 'passport-openidconnect';

const endpoint = process.env.LOGTO_ENDPOINT || 'http://localhost:3001';
const appId = process.env.LOGTO_CLIENT_ID || 'your_id';
const appSecret = process.env.LOGTO_CLIENT_SECRET || 'your_secret';

export default function initPassport() {
  passport.use(
    new OpenIDConnectStrategy(
      {
        issuer: `${endpoint}/oidc`,
        authorizationURL: `${endpoint}/oidc/auth`,
        tokenURL: `${endpoint}/oidc/token`,
        userInfoURL: `${endpoint}/oidc/me`,
        clientID: appId,
        clientSecret: appSecret,
        callbackURL: '/callback',
        scope: ['profile', 'offline_access'],
      },
      (issuer: string, profile: Profile, callback: VerifyCallback) => {
        callback(null, profile);
      }
    )
  );

  passport.serializeUser((user, callback) => {
    callback(null, user);
  });

  passport.deserializeUser(function (user, callback) {
    callback(null, user as Express.User);
  });
}