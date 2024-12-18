import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

const useSocket = () => {
  const [isReportReady, setIsReportReady] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState(null);
  const [reportFilename, setReportFilename] = useState<string | null>(null);
  const [configUpdated, setConfigUpdated] = useState(null);

  const acknowledgeReportReady = useCallback(() => {
    socket?.emit('report-ready-acknowledged');
    setIsReportReady(false);
  }, [socket]);

  useEffect(() => {
    // Initialize the Socket.IO connection
    const socket = io(undefined, {
      withCredentials: true,
      path: '/socket.io/',
      transports: ['websocket'],
    });

    setSocket(socket);

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('reportReady', (data) => {
      const filename = typeof data === 'string' ? data : data.filename;
      console.log('Report ready received', filename);
      setIsReportReady(true);
      setReportFilename(filename);
    });

    socket.on('reportFailed', (data) => {
      console.log('Report Not Found', data.message);
      setError(data.message);
    });

    socket.on('configUpdated', (data) => {
      console.log('Configuration updated', data);
      setConfigUpdated(data);
    });

    socket.on('connect_error', (err) => {
      setError('Failed to connect to the WebSocket');
      console.error('WebSocket error:', err);
    });

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, []);

  const downloadReport = async () => {
    try {
      if (!reportFilename) {
        throw new Error('Filename not available yet.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/report/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': localStorage.getItem('csrfToken'),
        },
        body: JSON.stringify({ fileName: reportFilename }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = +response.headers.get('Content-Length');
      let receivedLength = 0;
      const chunks = [];

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        const progress = (receivedLength / contentLength) * 100;
        console.log(`Download progress: ${progress.toFixed(2)}%`);
      }

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', reportFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
      setError('Error downloading report.');
    }
  };

  return { isReportReady, acknowledgeReportReady, downloadReport, configUpdated, error };
};

export default useSocket;
