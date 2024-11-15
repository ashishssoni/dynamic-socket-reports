export const formatUserCookie = (
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
  const key = 'app_ai_auth';
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
