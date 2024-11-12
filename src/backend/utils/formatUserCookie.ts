export const formatUserCookie = (
  type: string,
  token: string,
  tokenExpirationInMinutes: number,
  expireIn: string,
  isDev = false,
): {
  key: string;
  value: string;
  options: {
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: boolean | 'none';
    expires: Date;
  };
} => {
  const expireInMinute = tokenExpirationInMinutes;
  const key = type === 'admin' ? 'snapsight_ai_auth' : 'snapsight_attendee_auth';
  return {
    key,
    value: token,
    options: {
      maxAge: expireInMinute * 60 * 1000,
      expires: new Date(expireIn),
      httpOnly: true, // http only, prevents JavaScript cookie access
      secure: true, // cookie must be sent over https / ssl
      sameSite: !isDev ? true : 'none',
    },
  };
};
