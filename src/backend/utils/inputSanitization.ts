import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const stripJSTag = (str: any) => {
  if (typeof str === 'string') {
    return str.replace(/javascript\:[\w\/\-\%]+\([\'|\"]?[\w\.]+[\'|\"]?\)/gm, '');
  }
  return str;
};

export const sanitizeContent = (obj: any, allowedTags = [], allowedAttr = ['target']) => {
  const { window } = new JSDOM('');
  const DOMPurify = createDOMPurify(window);

  if (!obj) {
    return obj;
  }

  if (typeof obj === 'string') {
    return DOMPurify.sanitize(stripJSTag(obj), {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttr,
      KEEP_CONTENT: true,
      FORCE_BODY: true,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  }

  const modifiedObj = { ...obj };

  for (const property in modifiedObj) {
    if (modifiedObj.hasOwnProperty(property)) {
      if (Array.isArray(modifiedObj[property])) {
        modifiedObj[property] = modifiedObj[property].map((o: any) => {
          return sanitizeContent(o, allowedTags, allowedAttr);
        });
      } else if (typeof modifiedObj[property] == 'object') {
        modifiedObj[property] = sanitizeContent(modifiedObj[property], allowedTags, allowedAttr);
      } else if (
        modifiedObj[property] !== null &&
        modifiedObj[property] !== undefined &&
        typeof modifiedObj[property] !== 'boolean' &&
        typeof modifiedObj[property] !== 'number'
      ) {
        // const prevProperty = modifiedObj[property]
        modifiedObj[property] = DOMPurify.sanitize(stripJSTag(modifiedObj[property]), {
          ALLOWED_TAGS: allowedTags,
          ALLOWED_ATTR: allowedAttr,
          KEEP_CONTENT: true,
          FORCE_BODY: true,
          ALLOW_UNKNOWN_PROTOCOLS: false,
        });
      }
    }
  }
  return modifiedObj;
};
