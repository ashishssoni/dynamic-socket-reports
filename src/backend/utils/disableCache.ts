import { NextResponse } from 'next/server';

export const disableCache = async (res: NextResponse) => {
  res.headers.set('Surrogate-Control', 'no-store');
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
};
