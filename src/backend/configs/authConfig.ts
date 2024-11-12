export const AUTH_CONFIG = {
  otpLength: parseInt(process.env.OTP_LENGTH as string) || 6,
  otpExpiration: parseInt(process.env.OTP_EXPIRATION_IN_MINUTES as string) || 5,
  userTokenExpiration: parseInt(process.env.USER_TOKEN_EXPIRATION_IN_MINUTES) || 720,
  attendeeTokenExpiration: parseInt(process.env.ATTENDEE_TOKEN_EXPIRATION_IN_MINUTES) || 720,
};
