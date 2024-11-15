/* eslint-disable no-console */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const initWebsocketServer = async (attempt = 0) => {
  try {
    const port = parseInt(process.env.PORT, 10) || 3000;
    const url = `http://0.0.0.0:${port}/api/v1/websocket`;

    await fetch(url);
  } catch (error) {
    // eslint-disable-next-line quotes
    console.info("⚠️ Socket.io server isn't responding", error);
    if (attempt + 1 <= 5) {
      attempt += 1;
      await sleep(3000 * attempt);
      console.info('Attempting to reconnect', attempt);
      initWebsocketServer(attempt);
    }
  }
};

(async () => {
  await initWebsocketServer(0);
})();
