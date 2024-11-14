import fs from 'fs';

import path from 'path';

const configFilePath = path.join('data', 'configs', 'report-config.json');

const loadConfig = (io: any) => {
  try {
    const configData = fs.readFileSync(configFilePath, 'utf-8');
    const currentConfig = JSON.parse(configData);
    console.log('Configuration reloaded');

    io.emit('configUpdated', currentConfig);
  } catch (error) {
    console.error('Error reading/parsing config:', error);
  }
};

export const watchConfig = (io: any) => {
  fs.watch(configFilePath, (eventType, filename) => {
    if (eventType === 'change') {
      console.log(`Config file changed: ${filename}`);
      loadConfig(io);
    }
  });

  loadConfig(io);
};
