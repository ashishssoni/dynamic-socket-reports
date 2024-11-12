export const RATE_LIMITER_CONFIG = {
  USER_LOGIN: {
    points: process.env.MAX_CONSECUTIVE_USER_LOGIN_BY_IP,
    duration: 60 * parseInt(process.env.RECORD_USER_LOGIN_ATTEMPTS_IN_MINS),
    blockDuration: 60 * parseInt(process.env.BLOCK_USER_LOGIN_DURATION_IN_MINS),
  },
};
