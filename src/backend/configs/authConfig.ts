export const AUTH_CONFIG = {
  userTokenExpiration: parseInt(process.env.USER_TOKEN_EXPIRATION_IN_MINUTES) || 720,
};
