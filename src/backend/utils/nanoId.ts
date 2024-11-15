import { customAlphabet } from 'nanoid';

export const nanoIdGenerator = (length = 32) => {
  const alphabets = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890_';
  const nanoid = customAlphabet(alphabets, length);

  return nanoid();
};
