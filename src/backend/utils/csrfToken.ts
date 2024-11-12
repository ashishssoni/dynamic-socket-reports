export const formatCsrfCookie = (
  csrfToken: string,
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
  const key = 'app_csrf';
  return {
    key,
    value: csrfToken,
    options: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: !isDev ? true : 'none',
      expires: new Date(expireIn),
    },
  };
};
