const deniedList = ['=', '@', '+', ';', '\t', '\r', '"', '\\', ':', '“'];

export const stripRiskyCharacters = (str, allowedList = []) => {
  if (typeof str !== 'string') return str;
  if (!str) return '';

  const riskyCharacters = deniedList.filter((char) => {
    return !allowedList.includes(char);
  });
  const firstChar = str.charAt(0);
  const isInjected = riskyCharacters.includes(firstChar);

  if (!isInjected) return str;

  const slicedStr = str.slice(1);

  return stripRiskyCharacters(slicedStr, allowedList);
};
