import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import helmet from 'helmet';
import { disableCache } from './backend/utils/disableCache';
import { CSP_CONFIG } from './backend/configs/cspConfig';
import { formatCSP } from './backend/utils/formatCSP';

export async function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);

  if (req.method === 'HEAD') {
    return NextResponse.json({}, { status: 405 });
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  helmet.hidePoweredBy();
  helmet.dnsPrefetchControl();
  helmet.referrerPolicy();

  disableCache(response);

  response.headers.set('Content-Security-Policy', formatCSP(CSP_CONFIG));
  response.headers.set('Access-Control-Allow-Origin', process.env.ENV_DOMAIN);
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubdomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Expect-CT', 'max-age=31536000, enforce');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}
