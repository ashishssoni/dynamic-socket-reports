/* eslint-disable quotes */
const unsafeInlinePlusEval = "'unsafe-inline' 'unsafe-eval'";
const selfPlusAppDomainSrc = "'self' http://localhost:* https://localhost:*";

export const CSP_CONFIG = {
  'default-src': selfPlusAppDomainSrc,
  'manifest-src': selfPlusAppDomainSrc,
  'navigate-to': `${selfPlusAppDomainSrc}`,
  'form-action': selfPlusAppDomainSrc,
  'frame-ancestors': `${selfPlusAppDomainSrc}`,
  'frame-src': '* data: blob:',
  'object-src': '*',
  'child-src': `${selfPlusAppDomainSrc} blob: data:`,
  'worker-src': `${selfPlusAppDomainSrc} blob: data:`,
  'img-src': '* data: blob:',
  'media-src': '* data: blob:',
  'style-src': `${selfPlusAppDomainSrc} ${unsafeInlinePlusEval}`,
  'font-src': `${selfPlusAppDomainSrc} data: blob:`,
  'script-src': `${selfPlusAppDomainSrc} blob: ${unsafeInlinePlusEval}`,
  'connect-src': `${selfPlusAppDomainSrc} `,
};
