export const stripmoduleUrlFromUrl = (url: string) => {
  const moduleUrl = url.replace('/api/', '').split('/')[0];

  return moduleUrl.includes('?') ? moduleUrl.substring(0, moduleUrl.lastIndexOf('?')) : moduleUrl;
};
